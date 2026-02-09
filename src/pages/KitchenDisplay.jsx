import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { playNewOrderSound } from '../utils/sounds';
import './KitchenDisplay.css';

const STATUS_FLOW = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'prepared',
  prepared: 'ready',
  ready: 'served',
};

const ACTION_LABELS = {
  pending: 'Accept',
  accepted: 'Start Preparing',
  preparing: 'Mark Done',
  prepared: 'Mark Ready',
  ready: 'Mark Served',
};

const ACTION_CLASSES = {
  pending: 'accept',
  accepted: 'start',
  preparing: 'done',
  prepared: 'done',
  ready: 'serve',
};

const getElapsedInfo = (createdAt) => {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins < 10) return { text: `${mins}m`, className: 'green' };
  if (mins < 20) return { text: `${mins}m`, className: 'yellow' };
  if (mins < 30) return { text: `${mins}m`, className: 'orange' };
  return { text: `${mins}m`, className: 'red' };
};

export const KitchenDisplay = () => {
  const { restaurantId } = useParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [, setTick] = useState(0); // force re-render for timers
  const timerRef = useRef(null);

  const {
    joinKitchen,
    onOrderNew,
    onOrderUpdated,
    updateOrderStatus,
    isConnected,
    onConnect,
    onDisconnect,
  } = useSocket();

  // Timer for elapsed time updates
  useEffect(() => {
    if (authenticated) {
      timerRef.current = setInterval(() => setTick(t => t + 1), 30000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [authenticated]);

  // Connection status listeners
  useEffect(() => {
    if (!authenticated) return;

    setConnected(isConnected());

    const cleanupConnect = onConnect(() => setConnected(true));
    const cleanupDisconnect = onDisconnect(() => setConnected(false));

    return () => {
      cleanupConnect();
      cleanupDisconnect();
    };
  }, [authenticated, isConnected, onConnect, onDisconnect]);

  // Real-time order listeners
  useEffect(() => {
    if (!authenticated) return;

    const cleanupNew = onOrderNew((order) => {
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      // Mark as new for pulse animation
      setNewOrderIds(prev => new Set([...prev, order.id]));
      setTimeout(() => {
        setNewOrderIds(prev => {
          const next = new Set(prev);
          next.delete(order.id);
          return next;
        });
      }, 5000);
      playNewOrderSound();
    });

    const cleanupUpdated = onOrderUpdated((order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    return () => {
      cleanupNew();
      cleanupUpdated();
    };
  }, [authenticated, onOrderNew, onOrderUpdated]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }

    setVerifying(true);
    setPinError('');

    try {
      const response = await joinKitchen(restaurantId, pin);
      if (response.success) {
        setOrders(response.orders || []);
        setAuthenticated(true);
        setConnected(true);
      } else {
        setPinError(response.error || 'Invalid PIN');
      }
    } catch (err) {
      setPinError('Connection failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleStatusUpdate = useCallback(async (orderId, currentStatus) => {
    const nextStatus = STATUS_FLOW[currentStatus];
    if (!nextStatus) return;

    const response = await updateOrderStatus(restaurantId, orderId, nextStatus);
    if (response.success && response.order) {
      setOrders(prev => prev.map(o => o.id === orderId ? response.order : o));
    }
  }, [restaurantId, updateOrderStatus]);

  const handleExit = () => {
    setAuthenticated(false);
    setOrders([]);
    setPin('');
  };

  // ─── PIN Entry Screen ───────────────────────────────────
  if (!authenticated) {
    return (
      <div className="kds-pin-screen">
        <form className="kds-pin-card" onSubmit={handlePinSubmit}>
          <h1>Kitchen Display</h1>
          <p>Enter 4-digit PIN to access</p>
          <input
            className="kds-pin-input"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPin(val);
              setPinError('');
            }}
            placeholder="----"
            autoFocus
          />
          <button
            className="kds-pin-btn"
            type="submit"
            disabled={pin.length !== 4 || verifying}
          >
            {verifying ? 'Verifying...' : 'Enter Kitchen'}
          </button>
          {pinError && <div className="kds-pin-error">{pinError}</div>}
        </form>
      </div>
    );
  }

  // ─── Categorize orders into columns ─────────────────────
  const activeOrders = orders.filter(o =>
    !['completed', 'cancelled', 'rejected', 'served'].includes(o.status)
  );

  const newOrders = activeOrders
    .filter(o => o.status === 'pending' || o.status === 'accepted')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const preparingOrders = activeOrders
    .filter(o => o.status === 'preparing')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const readyOrders = activeOrders
    .filter(o => o.status === 'prepared' || o.status === 'ready')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // ─── Kitchen Display ────────────────────────────────────
  return (
    <div className="kds-container">
      <header className="kds-header">
        <div className="kds-header-left">
          <h1>Kitchen Display</h1>
          <div className="kds-connection-status">
            <span className={`kds-status-dot ${connected ? 'connected' : ''}`} />
            {connected ? 'Live' : 'Reconnecting...'}
          </div>
        </div>
        <div className="kds-header-right">
          <span className="kds-order-count">
            <strong>{activeOrders.length}</strong> active orders
          </span>
          <button className="kds-exit-btn" onClick={handleExit}>
            Exit
          </button>
        </div>
      </header>

      <div className="kds-columns">
        {/* New Orders Column */}
        <div className="kds-column">
          <div className="kds-column-header new">
            New Orders
            <span className="kds-column-count">({newOrders.length})</span>
          </div>
          <div className="kds-column-body">
            {newOrders.length === 0 ? (
              <div className="kds-empty">No new orders</div>
            ) : (
              newOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isNew={newOrderIds.has(order.id)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="kds-column">
          <div className="kds-column-header preparing">
            Preparing
            <span className="kds-column-count">({preparingOrders.length})</span>
          </div>
          <div className="kds-column-body">
            {preparingOrders.length === 0 ? (
              <div className="kds-empty">Nothing preparing</div>
            ) : (
              preparingOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isNew={false}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="kds-column">
          <div className="kds-column-header ready">
            Ready
            <span className="kds-column-count">({readyOrders.length})</span>
          </div>
          <div className="kds-column-body">
            {readyOrders.length === 0 ? (
              <div className="kds-empty">No ready orders</div>
            ) : (
              readyOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isNew={false}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order, isNew, onStatusUpdate }) => {
  const elapsed = getElapsedInfo(order.createdAt);
  const nextAction = ACTION_LABELS[order.status];
  const actionClass = ACTION_CLASSES[order.status];

  return (
    <div
      className={`kds-order-card status-${order.status} ${isNew ? 'new-order' : ''}`}
    >
      <div className="kds-order-header">
        <div>
          <div className="kds-order-id">#{order.id.slice(-6).toUpperCase()}</div>
          <div className="kds-order-table">Table {order.tableNumber}</div>
          {order.customerName && (
            <div className="kds-order-customer">{order.customerName}</div>
          )}
        </div>
        <span className={`kds-elapsed-badge ${elapsed.className}`}>
          {elapsed.text}
        </span>
      </div>

      <div className="kds-order-items">
        {order.items.map((item, i) => (
          <div key={i} className="kds-order-item">
            <span className="kds-item-qty">{item.quantity}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="kds-order-notes">Note: {order.notes}</div>
      )}

      {nextAction && (
        <button
          className={`kds-action-btn ${actionClass}`}
          onClick={() => onStatusUpdate(order.id, order.status)}
        >
          {nextAction}
        </button>
      )}
    </div>
  );
};
