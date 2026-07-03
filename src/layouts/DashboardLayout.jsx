import { useState } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Sidebar, DRAWER_WIDTH, COLLAPSED_WIDTH } from './Sidebar';
import AppBarHeader from './AppBarHeader';

const DashboardLayout = ({
  children,
  activeTab,
  onTabChange,
  restaurantName,
  userName,
  onLogout,
  orderCounts,
  notifications,
  onNotificationRead,
  onNotificationReadAll,
  onNotificationClear,
  connected,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('goresto_sidebar_collapsed') === '1'; } catch { return false; }
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('goresto_sidebar_collapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBarHeader
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
        onSidebarCollapse={toggleCollapse}
        restaurantName={restaurantName}
        userName={userName}
        onLogout={onLogout}
        notifications={notifications}
        onNotificationRead={onNotificationRead}
        onNotificationReadAll={onNotificationReadAll}
        onNotificationClear={onNotificationClear}
        connected={connected}
        sidebarWidth={sidebarWidth}
      />

      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        orderCounts={orderCounts}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${sidebarWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'width 0.2s ease',
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
