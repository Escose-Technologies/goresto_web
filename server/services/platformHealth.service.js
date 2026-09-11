import { prisma } from '../config/database.js';

/**
 * Platform activation & health, for the Goresto team only.
 *
 * Strictly read-only: no writes, no side effects, nothing a restaurant can
 * observe. It runs only when a superadmin opens the tab, so it never sits in
 * the path of a restaurant's own dashboard.
 *
 * One SQL pass rather than a query per restaurant — at 100+ restaurants an
 * N+1 here would be the slowest thing in the product. count() returns bigint,
 * which JSON.stringify refuses, so every aggregate is cast to int in SQL.
 */

// Days since the last order. Set by the operator, not guessed.
const HEALTHY_DAYS = 7;
const SLOWING_DAYS = 14;
const AT_RISK_DAYS = 30;
const DORMANT_DAYS = 180; // 6 months

export const getRestaurantHealth = async () => {
  const rows = await prisma.$queryRaw`
    WITH agg AS (
      SELECT
        r.id,
        r.name,
        r.status,
        r."createdAt",
        (SELECT COUNT(*)::int FROM "MenuItem" m WHERE m."restaurantId" = r.id) AS menu_items,
        (SELECT COUNT(*)::int FROM "Table"    t WHERE t."restaurantId" = r.id) AS tables,
        (SELECT COUNT(*)::int FROM "Staff"    s WHERE s."restaurantId" = r.id) AS staff,
        (SELECT COUNT(*)::int FROM "Order"    o WHERE o."restaurantId" = r.id) AS orders_total,
        (SELECT COUNT(*)::int FROM "Order"    o WHERE o."restaurantId" = r.id
           AND o."createdAt" >= NOW() - INTERVAL '7 days')  AS orders_7d,
        (SELECT COUNT(*)::int FROM "Order"    o WHERE o."restaurantId" = r.id
           AND o."createdAt" >= NOW() - INTERVAL '30 days') AS orders_30d,
        (SELECT MAX(o."createdAt") FROM "Order" o WHERE o."restaurantId" = r.id) AS last_order_at,
        (SELECT COUNT(*)::int FROM "Bill" b WHERE b."restaurantId" = r.id) AS bills_total,
        (SELECT COALESCE(SUM(b."grandTotal"), 0)::float FROM "Bill" b
           WHERE b."restaurantId" = r.id
             AND b."createdAt" >= NOW() - INTERVAL '30 days'
             AND b."paymentStatus" <> 'cancelled') AS revenue_30d
      FROM "Restaurant" r
    )
    SELECT
      id, name, status, "createdAt" AS joined_at,
      menu_items, tables, staff,
      orders_total, orders_7d, orders_30d,
      bills_total, revenue_30d, last_order_at,
      CASE WHEN last_order_at IS NULL THEN NULL
           ELSE FLOOR(EXTRACT(EPOCH FROM (NOW() - last_order_at)) / 86400)::int
      END AS days_since_order,
      FLOOR(EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 86400)::int AS days_since_joined,
      CASE
        WHEN orders_total = 0 AND menu_items = 0 THEN 'not_started'
        WHEN orders_total = 0                    THEN 'never_ordered'
        WHEN last_order_at >= NOW() - INTERVAL '7 days'   THEN 'healthy'
        WHEN last_order_at >= NOW() - INTERVAL '14 days'  THEN 'slowing'
        WHEN last_order_at >= NOW() - INTERVAL '30 days'  THEN 'at_risk'
        WHEN last_order_at >= NOW() - INTERVAL '180 days' THEN 'dormant'
        ELSE 'lost'
      END AS health
    FROM agg
    ORDER BY orders_total DESC
  `;

  return rows;
};

/** Onboarding funnel across the platform. */
export const getFunnel = async () => {
  const [row] = await prisma.$queryRaw`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE r.status = 'pending')::int   AS pending,
      COUNT(*) FILTER (WHERE r.status = 'active')::int    AS approved,
      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "MenuItem" m WHERE m."restaurantId" = r.id))::int AS added_menu,
      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "Table"    t WHERE t."restaurantId" = r.id))::int AS added_tables,
      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "Order"    o WHERE o."restaurantId" = r.id))::int AS took_order,
      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "Bill"     b WHERE b."restaurantId" = r.id))::int AS generated_bill
    FROM "Restaurant" r
    WHERE r.status <> 'rejected'
  `;
  return row;
};

/** Platform totals, for the "how are we doing" strip. */
export const getTotals = async () => {
  const [row] = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*)::int FROM "Restaurant" WHERE status = 'active')  AS active_restaurants,
      (SELECT COUNT(*)::int FROM "Restaurant" WHERE status = 'pending') AS pending_restaurants,
      (SELECT COUNT(*)::int FROM "Order")                               AS orders_all_time,
      (SELECT COUNT(*)::int FROM "Order" WHERE "createdAt" >= NOW() - INTERVAL '30 days') AS orders_30d,
      (SELECT COUNT(*)::int FROM "Bill")                                AS bills_all_time,
      (SELECT COALESCE(SUM("grandTotal"), 0)::float FROM "Bill"
         WHERE "createdAt" >= NOW() - INTERVAL '30 days' AND "paymentStatus" <> 'cancelled') AS revenue_30d
  `;
  return row;
};
