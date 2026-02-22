import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
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
import { MenuItemForm } from '../MenuItemForm';

const MenuSection = ({
  menuItems,
  categories,
  selectedCategory,
  setSelectedCategory,
  restaurantFoodType,
  showForm,
  editingItem,
  onAdd,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) => {
  const filtered =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Menu Items
      </Typography>

      <Fab
        color="primary"
        size="medium"
        onClick={onAdd}
        aria-label="Add Menu Item"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}
      >
        <Icon icon="mdi:plus" width={24} />
      </Fab>

      <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          label="Category"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Icon icon="mdi:food-outline" width={48} style={{ opacity: 0.4, marginBottom: 8 }} />
          <Typography>No menu items found. Add your first item!</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardActionArea
                  onClick={() => onEdit(item)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1 }}
                >
                  {item.image ? (
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={item.name}
                      sx={{ height: 160, objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        color: 'grey.400',
                      }}
                    >
                      <Icon icon="mdi:food-variant" width={48} />
                    </Box>
                  )}

                  <CardContent sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                        &#8377;{item.price.toFixed(2)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.5} mb={1} flexWrap="wrap">
                      <Chip label={item.category} size="small" variant="outlined" />
                      <Chip
                        label={item.available ? 'Available' : 'Unavailable'}
                        color={item.available ? 'success' : 'default'}
                        size="small"
                      />
                    </Stack>

                    {item.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}

                    {(item.updatedAt || item.createdAt) && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                        {item.updatedAt
                          ? `Updated ${new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          : `Added ${new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu Item Form Dialog */}
      <Dialog
        open={showForm || !!editingItem}
        onClose={onCancel}
        maxWidth="sm"
        fullWidth
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.5)' } } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <MenuItemForm
            item={editingItem}
            categories={categories}
            foodType={restaurantFoodType || 'both'}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={editingItem ? () => onDelete(editingItem.id) : undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuSection;
