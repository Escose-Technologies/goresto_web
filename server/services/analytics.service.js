import { prisma } from '../config/database.js';

export const getAnalytics = async (restaurantId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all orders for this restaurant
  const allOrders = await prisma.order.findMany({
    where: { restaurantId },
  });

  const todayOrders = allOrders.filter((o) => o.createdAt >= today);

  const ordersToday = todayOrders.length;
  const ordersTotal = allOrders.length;
  const revenueToday = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const revenueTotal = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const averageOrderValue = ordersTotal > 0 ? Math.round((revenueTotal / ordersTotal) * 100) / 100 : 0;

  // Popular items (top 5 by quantity)
  const itemCounts = {};
  for (const order of allOrders) {
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

  // Orders by status
  const ordersByStatus = {};
  for (const order of allOrders) {
    const status = order.status;
    ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
  }

  // Recent activity (last 10 orders)
  const recentActivity = allOrders
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10)
    .map((o) => ({
      type: 'order',
      message: `Order from ${o.customerName || `Table ${o.tableNumber}`} - $${o.total}`,
      timestamp: o.createdAt.toISOString(),
    }));

  // Get review stats
  const reviewAgg = await prisma.review.aggregate({
    where: { restaurantId },
    _avg: { rating: true },
    _count: { rating: true },
  });

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
    ordersByStatus,
    recentActivity,
  };
};
