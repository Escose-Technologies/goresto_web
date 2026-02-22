import { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import { Icon } from '@iconify/react';
import navConfig from './navConfig';

const DRAWER_WIDTH = 280;

const Sidebar = ({ activeTab, onTabChange, open, onClose, orderCounts = {} }) => {
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Goresto"
            sx={{ width: 36, height: 36, borderRadius: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Goresto
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navConfig.map((item) => {
            const isActive = activeTab === item.id;
            const count = orderCounts[item.id] || 0;

            return (
              <ListItemButton
                key={item.id}
                selected={isActive}
                onClick={() => {
                  onTabChange(item.id);
                  onClose?.();
                }}
              >
                <ListItemIcon>
                  {count > 0 ? (
                    <Badge badgeContent={count} color="error" max={99}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: 'subtitle2',
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
          Goresto Restaurant Management
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile temporary drawer */}
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

export { Sidebar, DRAWER_WIDTH };
