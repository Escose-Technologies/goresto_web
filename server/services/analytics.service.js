import { prisma } from '../config/database.js';

export const getAnalytics = async (restaurantId, opts = {}) => {
  // "Today" window: prefer the client's local-day boundaries (so it matches the
  // Billing tab exactly). Fall back to the server's local midnight.
  const serverMidnight = new Date();
  serverMidnight.setHours(0, 0, 0, 0);
  const todayStart = opts.todayStart ? new Date(opts.todayStart) : serverMidnight;
  const todayEnd = opts.todayEnd ? new Date(opts.todayEnd) : null;
  const todayCreatedAt = { gte: todayStart, ...(todayEnd ? { lte: todayEnd } : {}) };

  // Revenue mirrors the Billing tab: sum of grandTotal over non-cancelled bills.
  const notCancelled = { not: 'cancelled' };

  const [ordersTotalCount, ordersTodayCount, billTotalAgg, billTodayAgg, ordersByStatus, recentOrders, reviewAgg] = await Promise.all([
    // Order counts (orders placed — distinct metric from billed revenue)
    prisma.order.count({ where: { restaurantId } }),
    prisma.order.count({ where: { restaurantId, createdAt: todayCreatedAt } }),
    // Billed revenue — all time
    prisma.bill.aggregate({
      where: { restaurantId, paymentStatus: notCancelled },
      _count: { id: true },
      _sum: { grandTotal: true },
    }),
    // Billed revenue — today
    prisma.bill.aggregate({
      where: { restaurantId, paymentStatus: notCancelled, createdAt: todayCreatedAt },
      _sum: { grandTotal: true },
    }),
    // Orders grouped by status
    prisma.order.groupBy({
      by: ['status'],
      where: { restaurantId },
      _count: { status: true },
    }),
    // Recent orders (last 10) + last 500 for popular items calculation
    prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: { items: true, tableNumber: true, customerName: true, total: true, createdAt: true },
    }),
    // Review stats
    prisma.review.aggregate({
      where: { restaurantId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  const ordersTotal = ordersTotalCount;
  const ordersToday = ordersTodayCount;
  const billCount = billTotalAgg._count.id;
  const revenueTotal = billTotalAgg._sum.grandTotal || 0;
  const revenueToday = billTodayAgg._sum.grandTotal || 0;
  // Average bill value, consistent with the Billing summary's averageBillValue.
  const averageOrderValue = billCount > 0 ? Math.round((revenueTotal / billCount) * 100) / 100 : 0;

  // Popular items (top 5 by quantity from recent 500 orders)
  const itemCounts = {};
  for (const order of recentOrders) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const key = item.menuItemId || item.name;
      if (!itemCounts[key]) {
        itemCounts[key] = { id: item.menuItemId, name: item.name, orders: 0, revenue: 0 };
      }
      itemCounts[key].orders += item.quantity || 1;
      itemCounts[key].revenue += (item.price || 0) * (item.quantity || 1);
    }
  }
  const popularItems = Object.values(itemCounts)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5)
    .map((i) => ({ ...i, revenue: Math.round(i.revenue * 100) / 100 }));

  // Format status counts
  const statusMap = {};
  for (const row of ordersByStatus) {
    statusMap[row.status] = row._count.status;
  }

  const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$' };
  const settings = await prisma.settings.findFirst({ where: { restaurantId }, select: { currency: true } });
  const cur = SYMBOLS[settings?.currency] || '₹';

  // Recent activity (last 10 from the already-fetched orders)
  const recentActivity = recentOrders
    .slice(0, 10)
    .map((o) => ({
      type: 'order',
      message: `Order from ${o.customerName || `Table ${o.tableNumber}`} - ${cur}${o.total}`,
      timestamp: o.createdAt.toISOString(),
    }));

  return {
    stats: {
      ordersToday,
      ordersTotal,
      revenueToday: Math.round(revenueToday * 100) / 100,
      revenueTotal: Math.round(revenueTotal * 100) / 100,
      averageOrderValue,
      averageRating: Math.round((reviewAgg._avg.rating || 0) * 10) / 10,
      totalReviews: reviewAgg._count.rating || 0,
    },
    popularItems,
    ordersByStatus: statusMap,
    recentActivity,
  };
};
