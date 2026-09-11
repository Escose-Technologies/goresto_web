import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../errors/index.js';

const FREE_SLOTS_KEY = 'freeTrialSlots';
const DEFAULT_FREE_SLOTS = 250;
const TRIAL_DAYS = 365;

/** Paise everywhere internally; rupees only at the edges. */
export const rupeesToPaise = (rupees) => Math.round(Number(rupees || 0) * 100);
export const paiseToRupees = (paise) => Number(paise || 0) / 100;

export const getFreeSlotCap = async () => {
  const row = await prisma.platformSetting.findUnique({ where: { key: FREE_SLOTS_KEY } });
  const n = Number(row?.value);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_FREE_SLOTS;
};

export const setFreeSlotCap = async (value, actorEmail) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new ValidationError('Free slot cap must be zero or more');
  await prisma.platformSetting.upsert({
    where: { key: FREE_SLOTS_KEY },
    create: { key: FREE_SLOTS_KEY, value: n },
    update: { value: n },
  });
  console.log(`[subscription] free slot cap set to ${n} by ${actorEmail || 'unknown'}`);
  return n;
};

export const getFreeSlotUsage = async () => {
  const [cap, used] = await Promise.all([
    getFreeSlotCap(),
    prisma.subscription.count({ where: { plan: 'free_trial' } }),
  ]);
  return { cap, used, remaining: Math.max(cap - used, 0) };
};

/**
 * Called when a registration is approved. The free year runs from approval.
 * If the free slots are exhausted the restaurant still gets a subscription —
 * on the standard plan, flagged past_due — rather than none at all, so it can
 * never fall through the cracks unbilled and untracked.
 */
export const createForRestaurant = async ({ restaurantId, actorEmail, standardPricePaise = 100000 }) => {
  const existing = await prisma.subscription.findUnique({ where: { restaurantId } });
  if (existing) return existing;

  const { remaining } = await getFreeSlotUsage();
  const onFreeTrial = remaining > 0;
  const trialEndsAt = onFreeTrial
    ? new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    : null;

  return prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.create({
      data: {
        restaurantId,
        plan: onFreeTrial ? 'free_trial' : 'standard',
        status: onFreeTrial ? 'trialing' : 'past_due',
        pricePaise: onFreeTrial ? 0 : standardPricePaise,
        trialEndsAt,
      },
    });
    await tx.subscriptionEvent.create({
      data: {
        subscriptionId: sub.id,
        restaurantId,
        type: 'created',
        detail: { onFreeTrial, remainingSlots: remaining },
        reason: onFreeTrial
          ? 'Approved during the free-year launch offer'
          : 'Approved after free slots were exhausted',
        actorEmail,
      },
    });
    return sub;
  });
};

const record = (tx, sub, type, detail, reason, actorEmail) =>
  tx.subscriptionEvent.create({
    data: { subscriptionId: sub.id, restaurantId: sub.restaurantId, type, detail, reason, actorEmail },
  });

/**
 * Every mutation goes through here so nothing changes without an audit row.
 * `reason` is required by the validator, not optional by convention.
 */
export const update = async (restaurantId, changes, { reason, actorEmail }) => {
  const sub = await prisma.subscription.findUnique({ where: { restaurantId } });
  if (!sub) throw new NotFoundError('Subscription');

  const data = {};
  const detail = {};

  if (changes.plan && changes.plan !== sub.plan) {
    data.plan = changes.plan; detail.plan = { from: sub.plan, to: changes.plan };
  }
  if (changes.status && changes.status !== sub.status) {
    data.status = changes.status; detail.status = { from: sub.status, to: changes.status };
  }
  if (changes.pricePaise !== undefined && changes.pricePaise !== sub.pricePaise) {
    data.pricePaise = changes.pricePaise;
    detail.pricePaise = { from: sub.pricePaise, to: changes.pricePaise };
  }
  if (changes.billingCycle && changes.billingCycle !== sub.billingCycle) {
    data.billingCycle = changes.billingCycle;
    detail.billingCycle = { from: sub.billingCycle, to: changes.billingCycle };
  }
  if (changes.trialEndsAt !== undefined) {
    const next = changes.trialEndsAt ? new Date(changes.trialEndsAt) : null;
    data.trialEndsAt = next;
    detail.trialEndsAt = { from: sub.trialEndsAt, to: next };
  }
  if (changes.notes !== undefined) data.notes = changes.notes;

  if (Object.keys(data).length === 0) return sub;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.subscription.update({ where: { restaurantId }, data });
    await record(tx, sub, 'updated', detail, reason, actorEmail);
    return updated;
  });
};

/** Restart or extend the free period — the power asked for, always audited. */
export const restartTrial = async (restaurantId, { days = TRIAL_DAYS, reason, actorEmail }) => {
  const sub = await prisma.subscription.findUnique({ where: { restaurantId } });
  if (!sub) throw new NotFoundError('Subscription');

  const trialEndsAt = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.subscription.update({
      where: { restaurantId },
      data: { plan: 'free_trial', status: 'trialing', pricePaise: 0, trialEndsAt },
    });
    await record(tx, sub, 'trial_restarted',
      { days, from: sub.trialEndsAt, to: trialEndsAt }, reason, actorEmail);
    return updated;
  });
};

export const recordPayment = async (restaurantId, payment, { actorEmail }) => {
  const sub = await prisma.subscription.findUnique({ where: { restaurantId } });
  if (!sub) throw new NotFoundError('Subscription');

  return prisma.$transaction(async (tx) => {
    const row = await tx.subscriptionPayment.create({
      data: {
        subscriptionId: sub.id,
        restaurantId,
        amountPaise: payment.amountPaise,
        method: payment.method || 'upi',
        reference: payment.reference || null,
        periodStart: payment.periodStart ? new Date(payment.periodStart) : null,
        periodEnd: payment.periodEnd ? new Date(payment.periodEnd) : null,
        notes: payment.notes || null,
        recordedByEmail: actorEmail || null,
      },
    });
    // A payment implies the account is current again; superadmin can override.
    if (sub.status === 'past_due') {
      await tx.subscription.update({ where: { restaurantId }, data: { status: 'active' } });
    }
    await record(tx, sub, 'payment_recorded',
      { amountPaise: row.amountPaise, method: row.method, reference: row.reference },
      payment.notes || 'Payment recorded', actorEmail);
    return row;
  });
};

export const listAll = async () => {
  const subs = await prisma.subscription.findMany({
    include: {
      restaurant: { select: { id: true, name: true, status: true, createdAt: true } },
      payments: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
    orderBy: { createdAt: 'asc' },
  });
  const usage = await getFreeSlotUsage();
  return { subscriptions: subs, usage };
};

export const getForRestaurant = async (restaurantId) =>
  prisma.subscription.findUnique({ where: { restaurantId } });

export const getEvents = async (restaurantId) =>
  prisma.subscriptionEvent.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
