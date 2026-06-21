import MuiIconButton from '@mui/material/IconButton';
import { Icon } from '@iconify/react';

export const CloseButton = ({ onClick, size = 'medium', sx, ...props }) => (
  <MuiIconButton
    onClick={onClick}
    aria-label="Close"
    size={size}
    sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' }, ...sx }}
    {...props}
  >
    <Icon icon="material-symbols:close-rounded" width={size === 'small' ? 18 : 22} />
  </MuiIconButton>
);
