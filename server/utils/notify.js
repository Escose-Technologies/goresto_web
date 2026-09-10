import * as notificationsService from '../services/notifications.service.js';
import { emitNotification } from './socketEmitter.js';

/**
 * Record a notification and push it to the restaurant's connected clients.
 * Fire-and-forget: callers must not fail because the feed did.
 */
export const notify = async (restaurantId, payload) => {
  const row = await notificationsService.record({ restaurantId, ...payload });
  if (row) emitNotification(restaurantId, row);
  return row;
};

export const money = (n) => `\u20b9${Number(n || 0).toFixed(2)}`;
