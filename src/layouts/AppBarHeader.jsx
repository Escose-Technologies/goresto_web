import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import { Icon } from '@iconify/react';
import { DRAWER_WIDTH } from './Sidebar';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const AppBarHeader = ({
  onMenuToggle,
  onSidebarCollapse,
  restaurantName,
  userName,
  onLogout,
  notifications = [],
  onNotificationRead,
  onNotificationReadAll,
  onNotificationClear,
  connected = false,
  sidebarWidth,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const width = sidebarWidth ?? DRAWER_WIDTH;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { lg: `calc(100% - ${width}px)` },
        ml: { lg: `${width}px` },
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        transition: 'width 0.2s ease, margin-left 0.2s ease',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: { xs: 2, md: 3 } }}>
        {/* Mobile hamburger */}
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 1, display: { lg: 'none' } }}
        >
          <Icon icon="material-symbols:menu-rounded" width={24} />
        </IconButton>


        {/* Restaurant name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          {/* Mobile logo */}
          <Box
            component="img"
            src="/logo.png"
            alt="Goresto"
            sx={{ width: 28, height: 28, borderRadius: 0.5, display: { lg: 'none' } }}
          />
          <Typography variant="h6" noWrap sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.125rem' } }}>
            {restaurantName || 'Dashboard'}
          </Typography>
          <Chip
            size="small"
            label={connected ? 'Live' : 'Offline'}
            color={connected ? 'success' : 'default'}
            variant="outlined"
            sx={{ height: 22, '& .MuiChip-label': { px: 1, fontSize: 11 } }}
            icon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: connected ? 'success.main' : 'grey.400',
                  ml: 1,
                }}
              />
            }
          />
        </Box>

        {/* Action items */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Notifications */}
          <IconButton size="large" onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge badgeContent={unreadCount} color="error" max={9}>
              <Icon icon="material-symbols:notifications-outline-rounded" width={22} />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={() => setNotifAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  width: 340,
                  maxWidth: 'calc(100vw - 24px)',
                  mt: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 3,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {unreadCount > 0 && (
                  <Typography
                    variant="caption"
                    onClick={onNotificationReadAll}
                    sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                  >
                    Mark all read
                  </Typography>
                )}
                {notifications.length > 0 && (
                  <Typography
                    variant="caption"
                    onClick={onNotificationClear}
                    sx={{ cursor: 'pointer', color: 'text.secondary', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                  >
                    Clear
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider />

            {notifications.length === 0 ? (
              <Box sx={{ px: 2, py: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Icon icon="material-symbols:notifications-off-outline-rounded" width={32} style={{ opacity: 0.5 }} />
                <Typography variant="body2" sx={{ mt: 0.5 }}>No notifications</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <MenuItem
                    key={n.id}
                    onClick={() => !n.read && onNotificationRead(n.id)}
                    sx={{
                      py: 1.25,
                      alignItems: 'flex-start',
                      gap: 1,
                      whiteSpace: 'normal',
                      backgroundColor: n.read ? 'transparent' : 'action.hover',
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0.25,
                        display: 'inline-flex',
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        borderRadius: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: n.read ? 'action.selected' : 'warning.light',
                        color: n.read ? 'text.secondary' : 'warning.dark',
                      }}
                    >
                      <Icon icon="mdi:bell-ring" width={18} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={n.read ? 500 : 700}>
                        Table {n.tableNumber} needs assistance
                      </Typography>
                      {n.customerName && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {n.customerName}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(n.createdAt)}
                      </Typography>
                    </Box>
                    {!n.read && (
                      <Box sx={{ mt: 1, width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
                    )}
                  </MenuItem>
                ))}
              </Box>
            )}
          </Menu>

          {/* Profile menu */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="large">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {userName ? userName[0].toUpperCase() : 'A'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 200,
                  mt: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 3,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {userName || 'Admin'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Restaurant Admin
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onLogout();
              }}
              sx={{ mt: 0.5 }}
            >
              <ListItemIcon>
                <Icon icon="material-symbols:logout-rounded" width={18} />
              </ListItemIcon>
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarHeader;
