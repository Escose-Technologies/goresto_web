import { useState } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Sidebar, DRAWER_WIDTH } from './Sidebar';
import AppBarHeader from './AppBarHeader';

const DashboardLayout = ({
  children,
  activeTab,
  onTabChange,
  restaurantName,
  userName,
  onLogout,
  orderCounts,
  notificationCount,
  connected,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBarHeader
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
        restaurantName={restaurantName}
        userName={userName}
        onLogout={onLogout}
        notificationCount={notificationCount}
        connected={connected}
      />

      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        orderCounts={orderCounts}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Spacer for fixed AppBar */}
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }} />

        {/* Main content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
