import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { categoryService } from '../../services/apiService';

export const CategoryManager = ({ restaurantId, categories, onCategoriesChange, toast }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await categoryService.getAll(restaurantId);
      setItems(data);
    } catch { /* silent — list still usable from props */ }
  }, [restaurantId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    if (items.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast?.warning('Category already exists');
      return;
    }
    setLoading(true);
    try {
      const created = await categoryService.create(restaurantId, { name });
      setItems((prev) => [...prev, created]);
      setNewName('');
      onCategoriesChange?.([...items.map((c) => c.name), created.name]);
      toast?.success(`Category "${created.name}" added`);
    } catch (err) {
      toast?.error('Failed to add category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id) => {
    const name = editName.trim();
    if (!name) return;
    setLoading(true);
    try {
      const updated = await categoryService.update(restaurantId, id, { name });
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      onCategoriesChange?.(items.map((c) => (c.id === id ? updated.name : c.name)));
      toast?.success('Category renamed');
    } catch (err) {
      toast?.error('Rename failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Menu items won't be deleted — they'll just have no category.`)) return;
    setLoading(true);
    try {
      await categoryService.remove(restaurantId, id);
      const next = items.filter((c) => c.id !== id);
      setItems(next);
      onCategoriesChange?.(next.map((c) => c.name));
      toast?.success(`Category "${name}" deleted`);
    } catch (err) {
      toast?.error('Delete failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Icon icon="material-symbols:category-outline-rounded" width={18} />}
        onClick={() => setOpen(true)}
      >
        Manage Categories
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Manage Categories</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} mb={2} mt={0.5}>
            <TextField
              size="small"
              placeholder="New category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              fullWidth
              disabled={loading}
            />
            <Button variant="contained" onClick={handleAdd} disabled={loading || !newName.trim()} sx={{ flexShrink: 0 }}>
              Add
            </Button>
          </Stack>

          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
              No custom categories yet. Add one above or they'll be created from menu items.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {items.map((cat) => (
                <Box
                  key={cat.id}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    p: 1, borderRadius: 2, bgcolor: 'grey.50',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  {editingId === cat.id ? (
                    <>
                      <TextField
                        size="small"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(cat.id)}
                        autoFocus
                        fullWidth
                        disabled={loading}
                      />
                      <IconButton size="small" onClick={() => handleRename(cat.id)} disabled={loading}>
                        <Icon icon="material-symbols:check-rounded" width={18} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setEditingId(null)}>
                        <Icon icon="material-symbols:close-rounded" width={18} />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>{cat.name}</Typography>
                      <IconButton size="small" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}>
                        <Icon icon="material-symbols:edit-outline-rounded" width={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(cat.id, cat.name)} color="error">
                        <Icon icon="material-symbols:delete-outline-rounded" width={16} />
                      </IconButton>
                    </>
                  )}
                </Box>
              ))}
            </Stack>
          )}

          {categories.length > 0 && (
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary" mb={1} display="block">
                Categories from existing menu items:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {categories.filter((c) => !items.some((i) => i.name === c)).map((c) => (
                  <Chip key={c} label={c} size="small" variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
