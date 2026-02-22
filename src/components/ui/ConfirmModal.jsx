import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const VARIANT_COLOR = {
  danger: 'error',
  warning: 'warning',
  primary: 'primary',
};

export const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmText = 'Delete', variant = 'danger' }) => {
  const color = VARIANT_COLOR[variant] || 'error';

  return (
    <Dialog open={!!open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title || 'Are you sure?'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color={color} onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
