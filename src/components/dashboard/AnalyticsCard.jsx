import { useCurrency } from '../../contexts/CurrencyContext';
import './AnalyticsCard.css';

// Single stat card
export const StatCard = ({ title, value, subtitle, icon, trend, color = 'primary' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        {icon && <span className="stat-icon">{icon}</span>}
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      {trend && (
        <div className={`stat-trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}`}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

// Popular items list
export const PopularItemsList = ({ items = [], title = 'Popular Items' }) => {
  const cur = useCurrency();
  if (!items || items.length === 0) {
    return (
      <div className="popular-items-card">
        <h3>{title}</h3>
        <p className="no-data">No data available</p>
      </div>
    );
  }

  return (
    <div className="popular-items-card">
      <h3>{title}</h3>
      <ul className="popular-items-list">
        {items.map((item, index) => (
          <li key={item.id || index} className="popular-item">
            <span className="popular-item-rank">{index + 1}</span>
            <div className="popular-item-info">
              <span className="popular-item-name">{item.name}</span>
              <span className="popular-item-orders">{item.orders} orders</span>
            </div>
            <span className="popular-item-revenue">{cur}{item.revenue?.toFixed(2) || '0.00'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Orders by status
export const OrdersByStatus = ({ data = {} }) => {
  const statuses = [
    { key: 'pending', label: 'Pending', color: '#FBBF24' },
    { key: 'accepted', label: 'Accepted', color: '#10B981' },
    { key: 'preparing', label: 'Preparing', color: '#3B82F6' },
    { key: 'ready', label: 'Ready', color: '#8B5CF6' },
    { key: 'completed', label: 'Completed', color: '#059669' },
    { key: 'cancelled', label: 'Cancelled', color: '#EF4444' },
  ];

  const total = Object.values(data).reduce((sum, val) => sum + (val || 0), 0) || 1;

  return (
    <div className="orders-status-card">
      <h3>Orders by Status</h3>
      <div className="status-bars">
        {statuses.map(({ key, label, color }) => {
          const count = data[key] || 0;
          const percentage = ((count / total) * 100).toFixed(1);
          return (
            <div key={key} className="status-bar-row">
              <div className="status-bar-label">
                <span className="status-dot" style={{ backgroundColor: color }}></span>
                <span>{label}</span>
              </div>
              <div className="status-bar-track">
                <div
                  className="status-bar-fill"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
              </div>
              <span className="status-bar-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Recent Activity List
export const RecentActivity = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="recent-activity-card">
        <h3>Recent Activity</h3>
        <p className="no-data">No recent activity</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order':
        return '🛒';
      case 'review':
        return '⭐';
      case 'menu':
        return '🍽️';
      default:
        return '📋';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="recent-activity-card">
      <h3>Recent Activity</h3>
      <ul className="activity-list">
        {activities.map((activity, index) => (
          <li key={index} className="activity-item">
            <span className="activity-icon">{getActivityIcon(activity.type)}</span>
            <div className="activity-info">
              <span className="activity-message">{activity.message}</span>
              <span className="activity-time">{formatTime(activity.timestamp)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Main Analytics Dashboard
export const AnalyticsDashboard = ({ analytics }) => {
  const cur = useCurrency();
  if (!analytics) {
    return (
      <div className="analytics-loading">
        <p>Loading analytics...</p>
      </div>
    );
  }

  const { stats = {}, popularItems = [], ordersByStatus = {}, recentActivity = [] } = analytics;

  return (
    <div className="analytics-dashboard">
      <div className="analytics-stats-grid">
        <StatCard
          title="Orders Today"
          value={stats.ordersToday || 0}
          subtitle={`${stats.ordersTotal || 0} total`}
          icon="🛒"
          color="primary"
        />
        <StatCard
          title="Revenue Today"
          value={`${cur}${(stats.revenueToday || 0).toFixed(2)}`}
          subtitle={`${cur}${(stats.revenueTotal || 0).toFixed(2)} total`}
          icon="💰"
          color="success"
        />
        <StatCard
          title="Avg Order Value"
          value={`${cur}${(stats.averageOrderValue || 0).toFixed(2)}`}
          icon="📊"
          color="info"
        />
        <StatCard
          title="Rating"
          value={`${(stats.averageRating || 0).toFixed(1)} ⭐`}
          subtitle={`${stats.totalReviews || 0} reviews`}
          icon="⭐"
          color="warning"
        />
      </div>

      <div className="analytics-details-grid">
        <PopularItemsList items={popularItems} />
        <OrdersByStatus data={ordersByStatus} />
      </div>

      <RecentActivity activities={recentActivity} />
    </div>
  );
};

export default AnalyticsDashboard;
