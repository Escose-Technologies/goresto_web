// Maps between Prisma enum values and frontend-friendly strings

const ENUM_TO_FRONTEND = {
  non_veg: 'non-veg',
  on_hold: 'on-hold',
  on_leave: 'on-leave',
};

const FRONTEND_TO_ENUM = {
  'non-veg': 'non_veg',
  'on-hold': 'on_hold',
  'on-leave': 'on_leave',
};

export const toFrontend = (value) => ENUM_TO_FRONTEND[value] || value;
export const toEnum = (value) => FRONTEND_TO_ENUM[value] || value;

export const formatMenuItem = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    description: item.description,
    category: item.category,
    image: item.image,
    available: item.available,
    dietary: {
      type: toFrontend(item.dietaryType),
      spiceLevel: item.spiceLevel,
      allergens: item.allergens,
      labels: item.labels,
    },
    rating: item.rating,
    reviewCount: item.reviewCount,
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  };
};

export const formatOrder = (order) => {
  if (!order) return null;
  return {
    ...order,
    status: toFrontend(order.status),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
  };
};

export const formatStaff = (staff) => {
  if (!staff) return null;
  return {
    ...staff,
    status: toFrontend(staff.status),
    hireDate: staff.hireDate ? staff.hireDate.toISOString().split('T')[0] : null,
    createdAt: staff.createdAt?.toISOString(),
    updatedAt: staff.updatedAt?.toISOString(),
  };
};

export const formatTable = (table) => {
  if (!table) return null;
  return {
    ...table,
    createdAt: table.createdAt?.toISOString(),
    updatedAt: table.updatedAt?.toISOString(),
  };
};

export const formatUser = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
};

export const formatRestaurant = (restaurant) => {
  if (!restaurant) return null;
  return {
    ...restaurant,
    createdAt: restaurant.createdAt?.toISOString(),
    updatedAt: restaurant.updatedAt?.toISOString(),
  };
};

export const formatSettings = (settings) => {
  if (!settings) return null;
  return {
    ...settings,
    createdAt: settings.createdAt?.toISOString(),
    updatedAt: settings.updatedAt?.toISOString(),
  };
};

export const formatReview = (review) => {
  if (!review) return null;
  return {
    ...review,
    createdAt: review.createdAt?.toISOString(),
  };
};
