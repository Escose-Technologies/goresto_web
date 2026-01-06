# GoResto - Restaurant Management Platform

A modern React.js application for managing restaurants and menus with QR code scanning capabilities.

## Features

### Super Admin
- Manage multiple restaurants
- Create, edit, and delete restaurants
- Assign restaurant admins to restaurants

### Restaurant Admin
- Manage menu items for their assigned restaurant
- Add, edit, and delete menu items
- Organize items by categories (create new categories on the fly)
- Manage restaurant tables (add, edit, delete tables)
- Track table status (available, occupied, reserved, maintenance)
- Create and manage orders
- Track order status (pending, preparing, ready, completed, cancelled)
- Generate QR codes for customers to scan

### Public (Customers)
- Scan QR code to view restaurant menu
- Browse menu by categories
- View detailed menu item information

## Tech Stack

- **React 18** - UI library
- **React Router** - Routing
- **Vite** - Build tool
- **qrcode.react** - QR code generation
- **Local Storage** - Data persistence (for writes)
- **JSON Files** - Static data storage (for reads)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Demo Credentials

### Super Admin
- **Email:** superadmin@goresto.com
- **Password:** admin123

### Restaurant Admin
- **Email:** admin@restaurant.com
- **Password:** admin123

### Restaurant Owner (Demo)
- **Email:** owner@restaurant.com
- **Password:** owner123

## Project Structure

```
GoResto/
├── public/
│   └── data/
│       ├── restaurants.json    # Restaurant data
│       ├── menus.json         # Menu items per restaurant
│       ├── tables.json        # Restaurant tables
│       ├── orders.json        # Restaurant orders
│       └── users.json         # Admin user credentials
├── src/
│   ├── components/            # Reusable components
│   │   ├── ProtectedRoute.jsx
│   │   ├── QRCodeGenerator.jsx
│   │   └── MenuItemForm.jsx
│   ├── pages/                 # Page components
│   │   ├── Login.jsx
│   │   ├── SuperAdminDashboard.jsx
│   │   ├── RestaurantAdminDashboard.jsx
│   │   └── PublicMenu.jsx
│   ├── services/              # Data services
│   │   └── dataService.js
│   ├── context/               # React context
│   │   └── AuthContext.jsx
│   ├── styles/                # Styles and theme
│   │   ├── theme.js
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## Data Storage

### Reading Data
The application reads data from JSON files in `public/data/` directory.

### Writing Data
Since this is a static website, writes are stored in browser's localStorage. The data persists locally but won't be shared across devices or browsers.

To update the initial JSON files:
1. Make changes through the admin interface (stored in localStorage)
2. Export the localStorage data
3. Manually update the JSON files if needed

## Usage

### For Super Admin

1. Login with super admin credentials
2. Click "Add Restaurant" to create a new restaurant
3. Fill in restaurant details and assign an admin
4. View and manage all restaurants

### For Restaurant Admin

1. Login with restaurant admin credentials
2. **Menu Management Tab:**
   - Click "Add Menu Item" to add items to your menu
   - Fill in item details (name, price, description, category, image)
   - Type category name directly or select from suggestions
   - View the QR code and share it with customers
   - Manage menu items (edit, delete, filter by category)
3. **Tables Management Tab:**
   - Click "Add Table" to add tables to your restaurant
   - Set table number, capacity, location (Indoor/Outdoor/VIP/Bar)
   - Track table status (available, occupied, reserved, maintenance)
   - Edit or delete tables as needed
4. **Orders Management Tab:**
   - Click "Create Order" to create a new order
   - Select table and add menu items with quantities
   - Track order status (pending, preparing, ready, completed, cancelled)
   - Update order status directly from the order card
   - Add notes and special instructions
   - View order totals and item details
   - Filter orders by status
   - Edit or delete orders as needed

### For Customers

1. Scan the QR code provided by the restaurant
2. Browse the menu by category
3. Click on any item to view details

## Customization

### Theme Colors

Edit `src/styles/theme.js` to customize the color scheme:

```javascript
export const theme = {
  colors: {
    primary: {
      light: '#9333EA',
      main: '#7C3AED',
      dark: '#6D28D9',
    },
    // ... more colors
  }
};
```

## Notes

- This is a static website with no backend server
- Data modifications are stored in localStorage
- QR codes point to `/menu/:restaurantId` route
- Images should be hosted externally or placed in `public/images/`

## License

MIT

alias myip='ifconfig | grep "inet " | grep -v 127.0.0.1'