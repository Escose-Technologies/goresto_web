const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  'on-hold': 'On Hold',
  preparing: 'Preparing',
  prepared: 'Prepared',
  served: 'Served',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const TABLE_STATUS_LABELS = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
};

const STAFF_STATUS_LABELS = {
  active: 'Active',
  'on-leave': 'On Leave',
  inactive: 'Inactive',
};

export const getOrderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || status;

export const getTableStatusLabel = (status) => TABLE_STATUS_LABELS[status] || status;

export const getStaffStatusLabel = (status) => STAFF_STATUS_LABELS[status] || status;
