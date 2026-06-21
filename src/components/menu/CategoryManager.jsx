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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { categoryService } from '../../services/apiService';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const CategoryManager = ({ restaurantId, categories, onCategoriesChange, toast }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await categoryService.getAll(restaurantId);
      setItems(data);
    } catch { /* silent */ }
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
      const created = await categoryService.create(restaurantId, { name, description: newDesc.trim() || null });
      setItems((prev) => [...prev, created]);
      setNewName('');
      setNewDesc('');
      onCategoriesChange?.([...items.map((c) => c.name), created.name]);
      toast?.success(`Category "${created.name}" added`);
    } catch (err) {
      toast?.error('Failed to add: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    const name = editName.trim();
    if (!name) return;
    setLoading(true);
    try {
      const updated = await categoryService.update(restaurantId, id, { name, description: editDesc.trim() || null });
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      onCategoriesChange?.(items.map((c) => (c.id === id ? updated.name : c.name)));
      toast?.success('Category updated');
    } catch (err) {
      toast?.error('Update failed: ' + err.message);
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

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Manage Categories</DialogTitle>
        <DialogContent>
          {/* Add new */}
          <Stack spacing={1} mb={2} mt={0.5}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Category name"
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
            <TextField
              size="small"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              fullWidth
              disabled={loading}
              multiline
              minRows={1}
              maxRows={2}
            />
          </Stack>

          {/* List */}
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
              No custom categories yet. Add one above.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {items.map((cat) => (
                <Box
                  key={cat.id}
                  sx={{
                    p: 1.5, borderRadius: 2, bgcolor: 'grey.50',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  {editingId === cat.id ? (
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                          label="Name"
                          autoFocus
                          fullWidth
                          disabled={loading}
                        />
                        <IconButton size="small" onClick={() => handleUpdate(cat.id)} disabled={loading} color="primary">
                          <Icon icon="material-symbols:check-rounded" width={18} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setEditingId(null)}>
                          <Icon icon="material-symbols:close-rounded" width={18} />
                        </IconButton>
                      </Stack>
                      <TextField
                        size="small"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        label="Description"
                        fullWidth
                        disabled={loading}
                        multiline
                        minRows={1}
                        maxRows={2}
                      />
                    </Stack>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>{cat.name}</Typography>
                        {cat.description && (
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                            {cat.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                          Created {formatDate(cat.createdAt)}
                          {cat.updatedAt !== cat.createdAt && ` · Updated ${formatDate(cat.updatedAt)}`}
                        </Typography>
                      </Box>
                      <Tooltip title="Edit" arrow>
                        <IconButton size="small" onClick={() => startEdit(cat)}>
                          <Icon icon="material-symbols:edit-outline-rounded" width={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton size="small" onClick={() => handleDelete(cat.id, cat.name)} color="error">
                          <Icon icon="material-symbols:delete-outline-rounded" width={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
