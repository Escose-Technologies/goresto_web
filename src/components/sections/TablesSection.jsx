import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { QRCodeGenerator } from '../QRCodeGenerator';
import { TableForm } from '../TableForm';

const STATUS_COLOR = {
  available: 'success',
  occupied: 'warning',
  reserved: 'info',
  maintenance: 'error',
};

const TablesSection = ({
  tables,
  expandedQRCodes,
  setExpandedQRCodes,
  restaurantId,
  restaurantName,
  showForm,
  editingTable,
  onAdd,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) => {
  return (
    <>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Tables
      </Typography>

      <Fab
        color="primary"
        size="medium"
        onClick={onAdd}
        aria-label="Add Table"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}
      >
        <Icon icon="mdi:plus" width={24} />
      </Fab>

      {tables.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Icon icon="mdi:table-furniture" width={48} style={{ opacity: 0.4, marginBottom: 8 }} />
          <Typography>No tables found. Add your first table!</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {tables.map((table) => (
            <Grid key={table.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea onClick={() => onEdit(table)}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Table {table.number}
                      </Typography>
                      <Chip
                        label={table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                        color={STATUS_COLOR[table.status] || 'default'}
                        size="small"
                      />
                    </Stack>

                    <Stack spacing={0.5} sx={{ color: 'text.secondary', fontSize: 14 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Icon icon="mdi:account-group-outline" width={18} />
                        <Typography variant="body2">{table.capacity} guests</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Icon icon="mdi:map-marker-outline" width={18} />
                        <Typography variant="body2">{table.location}</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>

                {/* QR toggle */}
                <Box sx={{ px: 2, pb: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedQRCodes((prev) => ({ ...prev, [table.id]: !prev[table.id] }));
                    }}
                    sx={{ cursor: 'pointer', py: 0.5 }}
                  >
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      QR Code
                    </Typography>
                    <IconButton size="small">
                      <Icon
                        icon={expandedQRCodes[table.id] ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                        width={20}
                      />
                    </IconButton>
                  </Stack>

                  <Collapse in={!!expandedQRCodes[table.id]}>
                    <Box sx={{ pt: 1, pb: 1 }} onClick={(e) => e.stopPropagation()}>
                      <QRCodeGenerator
                        restaurantId={restaurantId}
                        restaurantName={restaurantName}
                        tableNumber={table.number}
                        showDownload
                      />
                    </Box>
                  </Collapse>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Table Form Dialog */}
      <Dialog
        open={showForm || !!editingTable}
        onClose={onCancel}
        maxWidth="sm"
        fullWidth
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.5)' } } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <TableForm
            table={editingTable}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={editingTable ? () => onDelete(editingTable.id) : undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TablesSection;
