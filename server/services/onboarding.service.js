import { prisma } from '../config/database.js';

/**
 * Setup progress for one restaurant.
 *
 * Every step is derived from data that already exists — nothing is stored, so
 * the checklist cannot drift out of date the way written documentation does.
 * Rename a tab tomorrow and this still reports the truth.
 */
export const getChecklist = async (restaurantId) => {
  const [menuItems, tables, staff, orders, bills, settings] = await Promise.all([
    prisma.menuItem.count({ where: { restaurantId } }),
    prisma.table.count({ where: { restaurantId } }),
    prisma.staff.count({ where: { restaurantId } }),
    prisma.order.count({ where: { restaurantId } }),
    prisma.bill.count({ where: { restaurantId } }),
    prisma.settings.findUnique({
      where: { restaurantId },
      select: { kitchenPin: true, gstin: true, gstEnabled: true },
    }),
  ]);

  const gstRequired = settings?.gstEnabled !== false;

  const steps = [
    {
      id: 'menu',
      label: 'Add your menu items',
      help: 'Customers see these when they scan the QR code.',
      tab: 'menu',
      done: menuItems > 0,
    },
    {
      id: 'tables',
      label: 'Set up tables & QR codes',
      help: 'Each table gets its own QR so you know where an order came from.',
      tab: 'tables',
      done: tables > 0,
    },
    {
      id: 'kitchenPin',
      label: 'Set your kitchen PIN',
      help: 'Needed before the Kitchen Display can be opened.',
      tab: 'settings',
      done: Boolean(settings?.kitchenPin),
    },
    {
      id: 'staff',
      label: 'Add your staff',
      help: 'Keeps a record of your team and their roles.',
      tab: 'staff',
      done: staff > 0,
    },
    // Only asked for when GST is switched on: a composition or unregistered
    // restaurant has no GSTIN and should not be nagged for one.
    ...(gstRequired
      ? [{
          id: 'gst',
          label: 'Add your GST details',
          help: 'Required before your bills can be proper tax invoices.',
          tab: 'settings',
          done: Boolean(settings?.gstin),
        }]
      : []),
    {
      id: 'firstOrder',
      label: 'Take your first order',
      help: 'Scan a table QR yourself to try it end to end.',
      tab: 'orders',
      done: orders > 0,
    },
    {
      id: 'firstBill',
      label: 'Generate your first bill',
      help: 'Turn a completed order into a bill from the Billing tab.',
      tab: 'billing',
      done: bills > 0,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  return {
    steps,
    total: steps.length,
    done: doneCount,
    remaining: steps.length - doneCount,
    complete: doneCount === steps.length,
  };
};

/**
 * Same signals, every restaurant — for the Goresto team's call list.
 *
 * One SQL pass, not six queries per restaurant: the per-restaurant version
 * above is fine for a single dashboard, but looping it over 100 restaurants
 * would fire 600 queries every time the console is opened.
 */
export const getChecklistForAll = async () => {
  const rows = await prisma.$queryRaw`
    SELECT
      r.id AS "restaurantId",
      r.name,
      (SELECT COUNT(*)::int FROM "MenuItem" m WHERE m."restaurantId" = r.id) > 0 AS menu,
      (SELECT COUNT(*)::int FROM "Table"    t WHERE t."restaurantId" = r.id) > 0 AS tables,
      (SELECT COUNT(*)::int FROM "Staff"    s WHERE s."restaurantId" = r.id) > 0 AS staff,
      (SELECT COUNT(*)::int FROM "Order"    o WHERE o."restaurantId" = r.id) > 0 AS "firstOrder",
      (SELECT COUNT(*)::int FROM "Bill"     b WHERE b."restaurantId" = r.id) > 0 AS "firstBill",
      COALESCE((SELECT st."kitchenPin" IS NOT NULL FROM "Settings" st WHERE st."restaurantId" = r.id), false) AS "kitchenPin",
      COALESCE((SELECT NULLIF(st.gstin, '') IS NOT NULL FROM "Settings" st WHERE st."restaurantId" = r.id), false) AS gst,
      COALESCE((SELECT st."gstEnabled" FROM "Settings" st WHERE st."restaurantId" = r.id), true) AS "gstRequired"
    FROM "Restaurant" r
    WHERE r.status <> 'rejected'
    ORDER BY r."createdAt"
  `;

  return rows.map((r) => {
    const checks = {
      menu: r.menu,
      tables: r.tables,
      kitchenPin: r.kitchenPin,
      staff: r.staff,
      ...(r.gstRequired ? { gst: r.gst } : {}),
      firstOrder: r.firstOrder,
      firstBill: r.firstBill,
    };
    const missing = Object.entries(checks).filter(([, done]) => !done).map(([id]) => id);
    const total = Object.keys(checks).length;
    return {
      restaurantId: r.restaurantId,
      name: r.name,
      total,
      done: total - missing.length,
      remaining: missing.length,
      complete: missing.length === 0,
      missing,
    };
  });
};
