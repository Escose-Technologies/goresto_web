import './Badge.css';

export const Badge = ({
  children,
  variant = 'default', // default, success, warning, error, info, veg, nonVeg, egg
  size = 'default', // small, default, large
  icon,
  className = '',
}) => {
  const classes = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

// Status Badge for orders, tables, etc.
export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    accepted: { variant: 'info', label: 'Accepted' },
    preparing: { variant: 'info', label: 'Preparing' },
    prepared: { variant: 'warning', label: 'Prepared' },
    ready: { variant: 'success', label: 'Ready' },
    served: { variant: 'success', label: 'Served' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    rejected: { variant: 'error', label: 'Rejected' },
    'on-hold': { variant: 'default', label: 'On Hold' },
    available: { variant: 'success', label: 'Available' },
    occupied: { variant: 'error', label: 'Occupied' },
    reserved: { variant: 'info', label: 'Reserved' },
    maintenance: { variant: 'warning', label: 'Maintenance' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    'on-leave': { variant: 'warning', label: 'On Leave' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

// Dietary Type Badge (Veg/Non-Veg/Egg)
export const DietaryTypeBadge = ({ type, size = 'default' }) => {
  if (!type) return null;

  return (
    <span className={`dietary-type-badge dietary-type-${type} dietary-type-${size}`}>
      <span className="dietary-dot" />
    </span>
  );
};

// Count Badge (for cart, notifications)
export const CountBadge = ({ count, max = 99 }) => {
  if (!count || count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span className="count-badge">
      {displayCount}
    </span>
  );
};
