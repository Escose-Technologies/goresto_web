import { useEffect, useRef, useCallback } from 'react';
import { getSocket, disconnectSocket } from '../services/socketService';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    return () => {
      // Don't disconnect globally — other components may still use it
    };
  }, []);

  const joinRestaurant = useCallback((restaurantId, token) => {
    const socket = getSocket();
    return new Promise((resolve) => {
      socket.emit('join:restaurant', { restaurantId, token }, (response) => {
        resolve(response);
      });
    });
  }, []);

  const joinKitchen = useCallback((restaurantId, pin) => {
    const socket = getSocket();
    return new Promise((resolve) => {
      socket.emit('join:kitchen', { restaurantId, pin }, (response) => {
        resolve(response);
      });
    });
  }, []);

  const joinPublic = useCallback((restaurantId) => {
    const socket = getSocket();
    return new Promise((resolve) => {
      socket.emit('join:public', { restaurantId }, (response) => {
        resolve(response);
      });
    });
  }, []);

  const onOrderNew = useCallback((callback) => {
    const socket = getSocket();
    socket.on('order:new', callback);
    return () => socket.off('order:new', callback);
  }, []);

  const onOrderUpdated = useCallback((callback) => {
    const socket = getSocket();
    socket.on('order:updated', callback);
    return () => socket.off('order:updated', callback);
  }, []);

  const updateOrderStatus = useCallback((restaurantId, orderId, status) => {
    const socket = getSocket();
    return new Promise((resolve) => {
      socket.emit('order:updateStatus', { restaurantId, orderId, status }, (response) => {
        resolve(response);
      });
    });
  }, []);

  const isConnected = useCallback(() => {
    const socket = getSocket();
    return socket.connected;
  }, []);

  const onConnect = useCallback((callback) => {
    const socket = getSocket();
    socket.on('connect', callback);
    return () => socket.off('connect', callback);
  }, []);

  const onDisconnect = useCallback((callback) => {
    const socket = getSocket();
    socket.on('disconnect', callback);
    return () => socket.off('disconnect', callback);
  }, []);

  return {
    joinRestaurant,
    joinKitchen,
    joinPublic,
    onOrderNew,
    onOrderUpdated,
    updateOrderStatus,
    isConnected,
    onConnect,
    onDisconnect,
    disconnect: disconnectSocket,
  };
};
