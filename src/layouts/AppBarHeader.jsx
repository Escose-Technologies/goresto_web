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

const AppBarHeader = ({
  onMenuToggle,
  restaurantName,
  userName,
  onLogout,
  notificationCount = 0,
  connected = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { lg: `${DRAWER_WIDTH}px` },
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
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
          <IconButton size="large">
            <Badge badgeContent={notificationCount} color="error" max={9}>
              <Icon icon="material-symbols:notifications-outline-rounded" width={22} />
            </Badge>
          </IconButton>

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
