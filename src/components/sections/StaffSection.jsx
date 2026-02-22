import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Fab from '@mui/material/Fab';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { StaffForm } from '../StaffForm';
import { getStaffStatusLabel } from '../../utils/statusLabels';

const STATUS_COLOR = {
  active: 'success',
  inactive: 'default',
  'on-leave': 'warning',
};

const StaffSection = ({
  staff,
  staffStatusFilter,
  setStaffStatusFilter,
  showForm,
  editingStaff,
  onAdd,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) => {
  const filtered = staff.filter(
    (s) => staffStatusFilter === 'All' || s.status === staffStatusFilter,
  );

  return (
    <>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Staff Management
      </Typography>

      <Fab
        color="primary"
        size="medium"
        onClick={onAdd}
        aria-label="Onboard New Staff"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}
      >
        <Icon icon="mdi:plus" width={24} />
      </Fab>

      <FormControl size="small" sx={{ minWidth: 180, mb: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={staffStatusFilter}
          label="Status"
          onChange={(e) => setStaffStatusFilter(e.target.value)}
        >
          <MenuItem value="All">All Staff</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="on-leave">On Leave</MenuItem>
        </Select>
      </FormControl>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Icon icon="mdi:account-group-outline" width={48} style={{ opacity: 0.4, marginBottom: 8 }} />
          <Typography>No staff members found. Onboard your first staff member!</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((member) => (
            <Grid key={member.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea onClick={() => onEdit(member)}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
                      <Avatar
                        src={member.photo || undefined}
                        alt={member.name}
                        sx={{ width: 52, height: 52, bgcolor: 'primary.lighter' }}
                      >
                        {!member.photo && <Icon icon="mdi:account" width={28} />}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>
                          {member.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          <Chip label={member.role} size="small" variant="outlined" />
                          <Chip
                            label={getStaffStatusLabel(member.status)}
                            color={STATUS_COLOR[member.status] || 'default'}
                            size="small"
                          />
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack spacing={0.5} sx={{ color: 'text.secondary' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Icon icon="mdi:email-outline" width={16} />
                        <Typography variant="body2" noWrap>
                          {member.email}
                        </Typography>
                      </Stack>
                      {member.phone && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Icon icon="mdi:phone-outline" width={16} />
                          <Typography variant="body2">{member.phone}</Typography>
                        </Stack>
                      )}
                      {member.hireDate && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Icon icon="mdi:calendar-outline" width={16} />
                          <Typography variant="body2">
                            Hired: {new Date(member.hireDate).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Staff Form Dialog */}
      <Dialog
        open={showForm || !!editingStaff}
        onClose={onCancel}
        maxWidth="sm"
        fullWidth
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.5)' } } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <StaffForm
            staff={editingStaff}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={editingStaff ? () => onDelete(editingStaff.id) : undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StaffSection;
