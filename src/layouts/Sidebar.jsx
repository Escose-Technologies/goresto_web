import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Icon } from '@iconify/react';
import navConfig from './navConfig';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

const Sidebar = ({ activeTab, onTabChange, open, onClose, orderCounts = {}, collapsed = false, onToggleCollapse }) => {
  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo + hamburger toggle */}
      <Box sx={{ p: collapsed ? 1.5 : 3, pb: collapsed ? 1 : 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Goresto"
            sx={{ width: collapsed ? 32 : 36, height: collapsed ? 32 : 36, borderRadius: 1 }}
          />
          {!collapsed && (
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Goresto
            </Typography>
          )}
        </Box>
        {onToggleCollapse && (
          <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right" arrow>
            <IconButton size="small" onClick={onToggleCollapse}>
              <Icon icon="material-symbols:menu-rounded" width={22} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ mx: collapsed ? 1 : 2 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', px: collapsed ? 1 : 2, py: 2 }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navConfig.map((item) => {
            const isActive = activeTab === item.id;
            const count = orderCounts[item.id] || 0;

            const button = (
              <ListItemButton
                key={item.id}
                selected={isActive}
                onClick={() => {
                  onTabChange(item.id);
                  onClose?.();
                }}
                sx={collapsed ? {
                  justifyContent: 'center',
                  px: 1.5,
                  minHeight: 44,
                  borderRadius: 2,
                } : undefined}
              >
                <ListItemIcon sx={collapsed ? { minWidth: 0, justifyContent: 'center' } : undefined}>
                  {count > 0 ? (
                    <Badge badgeContent={count} color="error" max={99}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      variant: 'subtitle2',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                )}
              </ListItemButton>
            );

            return collapsed ? (
              <Tooltip key={item.id} title={item.label} placement="right" arrow>
                {button}
              </Tooltip>
            ) : button;
          })}
        </List>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
            Goresto Restaurant Management
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: currentWidth,
          flexShrink: 0,
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': {
            width: currentWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            transition: 'width 0.2s ease',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile temporary drawer (always full width) */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { Sidebar, DRAWER_WIDTH, COLLAPSED_WIDTH };
