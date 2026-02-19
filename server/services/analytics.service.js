import { prisma } from '../config/database.js';

export const getAnalytics = async (restaurantId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Use DB aggregations instead of loading all orders into memory
  const [totalAgg, todayAgg, ordersByStatus, recentOrders, reviewAgg] = await Promise.all([
    // Total order stats
    prisma.order.aggregate({
      where: { restaurantId },
      _count: { id: true },
      _sum: { total: true },
    }),
    // Today's order stats
    prisma.order.aggregate({
      where: { restaurantId, createdAt: { gte: today } },
      _count: { id: true },
      _sum: { total: true },
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

  const ordersTotal = totalAgg._count.id;
  const revenueTotal = totalAgg._sum.total || 0;
  const ordersToday = todayAgg._count.id;
  const revenueToday = todayAgg._sum.total || 0;
  const averageOrderValue = ordersTotal > 0 ? Math.round((revenueTotal / ordersTotal) * 100) / 100 : 0;

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

  // Recent activity (last 10 from the already-fetched orders)
  const recentActivity = recentOrders
    .slice(0, 10)
    .map((o) => ({
      type: 'order',
      message: `Order from ${o.customerName || `Table ${o.tableNumber}`} - $${o.total}`,
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
