import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('Seeding database...');

  // Clear existing data (development only)
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.table.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Create users
  const superadmin = await prisma.user.create({
    data: {
      email: 'superadmin@goresto.com',
      password: await bcrypt.hash('admin123', SALT_ROUNDS),
      role: 'superadmin',
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@restaurant.com',
      password: await bcrypt.hash('admin123', SALT_ROUNDS),
      role: 'restaurant_admin',
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'owner@restaurant.com',
      password: await bcrypt.hash('owner123', SALT_ROUNDS),
      role: 'restaurant_admin',
    },
  });

  console.log('Created users');

  // Create restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'The Gourmet Kitchen',
      address: '123 Main Street, City Center',
      phone: '+1 (555) 123-4567',
      email: 'info@gourmetkitchen.com',
      adminId: admin1.id,
      qrCode: '',
      cuisineTypes: ['Indian', 'Continental', 'Italian'],
      socialLinks: { instagram: '', facebook: '', twitter: '' },
    },
  });

  // Update qrCode and user assignments
  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { qrCode: `/menu/${restaurant.id}` },
  });

  await prisma.user.update({
    where: { id: admin1.id },
    data: { restaurantId: restaurant.id },
  });

  await prisma.user.update({
    where: { id: admin2.id },
    data: { restaurantId: restaurant.id },
  });

  console.log('Created restaurant:', restaurant.name);

  // Create menu items
  const menuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Caesar Salad',
        price: 12.99,
        description: 'Fresh romaine lettuce with Caesar dressing, parmesan cheese, and croutons',
        category: 'Salads',
        available: true,
        dietaryType: 'veg',
        spiceLevel: 0,
        allergens: ['dairy', 'gluten'],
        labels: ['popular'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Grilled Chicken',
        price: 18.99,
        description: 'Herb-marinated grilled chicken breast with roasted vegetables',
        category: 'Main Course',
        available: true,
        dietaryType: 'non_veg',
        spiceLevel: 1,
        allergens: [],
        labels: ['popular', 'chef-special'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Margherita Pizza',
        price: 14.99,
        description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
        category: 'Pizza',
        available: true,
        dietaryType: 'veg',
        spiceLevel: 0,
        allergens: ['dairy', 'gluten'],
        labels: ['popular'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Chocolate Cake',
        price: 8.99,
        description: 'Rich chocolate layered cake with ganache frosting',
        category: 'Desserts',
        available: true,
        dietaryType: 'egg',
        spiceLevel: 0,
        allergens: ['dairy', 'gluten', 'eggs'],
        labels: ['popular'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Spicy Pasta Arrabbiata',
        price: 13.99,
        description: 'Penne pasta in a spicy tomato sauce with garlic and chili',
        category: 'Pasta',
        available: true,
        dietaryType: 'veg',
        spiceLevel: 2,
        allergens: ['gluten'],
        labels: ['spicy'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Butter Chicken',
        price: 16.99,
        description: 'Tender chicken in a creamy tomato-based curry with butter and spices',
        category: 'Main Course',
        available: true,
        dietaryType: 'non_veg',
        spiceLevel: 2,
        allergens: ['dairy'],
        labels: ['popular', 'spicy'],
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Mango Lassi',
        price: 5.99,
        description: 'Refreshing yogurt-based mango drink',
        category: 'Beverages',
        available: true,
        dietaryType: 'veg',
        spiceLevel: 0,
        allergens: ['dairy'],
        labels: ['new'],
      },
    }),
  ]);

  console.log(`Created ${menuItems.length} menu items`);

  // Create tables
  const tables = await Promise.all([
    prisma.table.create({
      data: { restaurantId: restaurant.id, number: '1', capacity: 4, status: 'available', location: 'Indoor' },
    }),
    prisma.table.create({
      data: { restaurantId: restaurant.id, number: '2', capacity: 2, status: 'occupied', location: 'Indoor' },
    }),
    prisma.table.create({
      data: { restaurantId: restaurant.id, number: '3', capacity: 6, status: 'available', location: 'Outdoor' },
    }),
  ]);

  console.log(`Created ${tables.length} tables`);

  // Create an order
  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: '2',
      items: [
        { menuItemId: menuItems[0].id, name: 'Caesar Salad', quantity: 1, price: 12.99 },
        { menuItemId: menuItems[1].id, name: 'Grilled Chicken', quantity: 2, price: 18.99 },
      ],
      total: 50.97,
      status: 'preparing',
      customerName: 'John D.',
      customerMobile: '555-1234',
      notes: 'No onions',
    },
  });

  console.log('Created sample order');

  // Create staff
  await prisma.staff.create({
    data: {
      restaurantId: restaurant.id,
      name: 'John Doe',
      email: 'john.doe@restaurant.com',
      phone: '+1 (555) 123-4567',
      role: 'Waiter',
      status: 'active',
      hireDate: new Date('2024-01-15'),
      address: '123 Main St, City',
      emergencyContact: 'Jane Doe - +1 (555) 987-6543',
      notes: 'Experienced waiter with 5 years in hospitality',
    },
  });

  console.log('Created staff member');

  // Create settings
  await prisma.settings.create({
    data: {
      restaurantId: restaurant.id,
      restaurantName: 'The Gourmet Kitchen',
      address: '123 Main Street, City Center',
      phone: '+1 (555) 123-4567',
      email: 'info@gourmetkitchen.com',
      currency: 'INR',
      openingTime: '09:00',
      closingTime: '22:00',
      primaryColor: '#7C3AED',
      secondaryColor: '#9333EA',
      timezone: 'Asia/Kolkata',
      taxRate: 0.08,
      serviceCharge: 0.1,
      allowOnlineOrders: true,
      allowTableReservations: true,
    },
  });

  console.log('Created settings');

  // Create reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        restaurantId: restaurant.id,
        menuItemId: menuItems[1].id,
        customerName: 'John D.',
        rating: 5,
        comment: 'Best grilled chicken I\'ve ever had!',
      },
    }),
    prisma.review.create({
      data: {
        restaurantId: restaurant.id,
        menuItemId: menuItems[1].id,
        customerName: 'Sarah M.',
        rating: 4,
        comment: 'Very tender and flavorful',
      },
    }),
    prisma.review.create({
      data: {
        restaurantId: restaurant.id,
        menuItemId: menuItems[0].id,
        customerName: 'Mike R.',
        rating: 5,
        comment: 'Fresh and delicious!',
      },
    }),
    prisma.review.create({
      data: {
        restaurantId: restaurant.id,
        menuItemId: menuItems[2].id,
        customerName: 'Emily K.',
        rating: 4,
        comment: 'Authentic Italian taste',
      },
    }),
    prisma.review.create({
      data: {
        restaurantId: restaurant.id,
        menuItemId: menuItems[3].id,
        customerName: 'Tom L.',
        rating: 5,
        comment: 'Heavenly chocolate cake!',
      },
    }),
  ]);

  console.log(`Created ${reviews.length} reviews`);

  // Update menu item ratings based on reviews
  for (const item of menuItems) {
    const agg = await prisma.review.aggregate({
      where: { menuItemId: item.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    if (agg._count.rating > 0) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: {
          rating: Math.round((agg._avg.rating || 0) * 10) / 10,
          reviewCount: agg._count.rating,
        },
      });
    }
  }

  console.log('Updated menu item ratings');
  console.log('\nSeed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('  Super Admin: superadmin@goresto.com / admin123');
  console.log('  Restaurant Admin: admin@restaurant.com / admin123');
  console.log('  Restaurant Admin: owner@restaurant.com / owner123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
