import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { feedbackService } from '../../services/apiService';
import { presetRange, customRange } from '../../utils/dateRange';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'triaged', label: 'Triaged' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'wont_fix', label: "Won't fix" },
];

const CATEGORIES = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'general', label: 'General' },
];

const DATE_PRESETS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'last3', label: 'Last 3 months' },
  { value: 'custom', label: 'Custom range…' },
];

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const ProductFeedbackPanel = ({ restaurants = [], toast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Debounced so typing a restaurant name doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const range = useMemo(() => (
    datePreset === 'custom' ? customRange(customFrom, customTo) : presetRange(datePreset)
  ), [datePreset, customFrom, customTo]);

  useEffect(() => {
    if (datePreset === 'custom' && !(customFrom && customTo)) return;
    let cancelled = false;
    setLoading(true);
    feedbackService.listAll({
      ...(debouncedQ ? { q: debouncedQ } : {}),
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(rating ? { rating } : {}),
      ...(restaurantId ? { restaurantId } : {}),
      ...(range.from ? { from: range.from } : {}),
      ...(range.to ? { to: range.to } : {}),
    })
      .then((d) => { if (!cancelled) setItems(Array.isArray(d) ? d : []); })
      .catch((err) => { if (!cancelled) toast?.error('Failed to load feedback: ' + err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQ, status, category, rating, restaurantId, range, datePreset, customFrom, customTo]);

  const updateStatus = async (id, next) => {
    const prev = items;
    setItems((list) => list.map((f) => (f.id === id ? { ...f, status: next } : f)));
    try {
      await feedbackService.update(id, { status: next });
    } catch (err) {
      setItems(prev);
      toast?.error('Failed to update: ' + err.message);
    }
  };

  const clearFilters = () => {
    setQ(''); setStatus(''); setCategory(''); setRating('');
    setRestaurantId(''); setDatePreset('all'); setCustomFrom(''); setCustomTo('');
  };

  const filtersActive = Boolean(q || status || category || rating || restaurantId || datePreset !== 'all');

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h6" fontWeight={700}>
          Product Feedback{' '}
          <Typography component="span" variant="body2" color="text.secondary">
            ({items.length}{items.length === 300 ? '+' : ''})
          </Typography>
        </Typography>
        {filtersActive && (
          <Button size="small" onClick={clearFilters} startIcon={<Icon icon="mdi:filter-remove-outline" width={18} />}>
            Clear filters
          </Button>
        )}
      </Stack>

      <Card variant="outlined" sx={{ p: 2, mb: 2.5 }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Restaurant, title, text or email"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="mdi:magnify" width={18} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField select fullWidth size="small" label="Restaurant" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {restaurants.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <TextField select fullWidth size="small" label="Rating" value={rating} onChange={(e) => setRating(e.target.value)}>
              <MenuItem value="">Any</MenuItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <MenuItem key={r} value={r}>{r} ★</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
            <TextField select fullWidth size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.5 }}>
            <TextField select fullWidth size="small" label="Type" value={category} onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 1.5 }}>
            <TextField select fullWidth size="small" label="Period" value={datePreset} onChange={(e) => setDatePreset(e.target.value)}>
              {DATE_PRESETS.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
            </TextField>
          </Grid>
          {datePreset === 'custom' && (
            <>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField fullWidth size="small" type="date" label="From" value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField fullWidth size="small" type="date" label="To" value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
                  inputProps={{ min: customFrom || undefined }} />
              </Grid>
            </>
          )}
        </Grid>
      </Card>

      {loading ? (
        <Typography variant="body2" color="text.secondary">Loading…</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Icon icon="material-symbols:rate-review-outline-rounded" width={44} style={{ opacity: 0.4 }} />
          <Typography sx={{ mt: 1 }}>
            {filtersActive ? 'No feedback matches these filters.' : 'No feedback yet.'}
          </Typography>
          {filtersActive && (
            <Button size="small" onClick={clearFilters} sx={{ mt: 1 }}>Clear filters</Button>
          )}
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {items.map((f) => (
            <Card key={f.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} flexWrap="wrap">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" variant="outlined" label={String(f.category || '').replace('_', ' ')} />
                    <Typography variant="body2" fontWeight={700}>{f.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'warning.main' }}>{'★'.repeat(f.rating)}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    <strong>{f.restaurant?.name || 'Unknown'}</strong> · {f.userEmail || 'unknown'} · {fmtDateTime(f.createdAt)}
                  </Typography>
                </Box>
                <TextField
                  select size="small" value={f.status}
                  onChange={(e) => updateStatus(f.id, e.target.value)}
                  sx={{ minWidth: 145 }}
                >
                  {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </TextField>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25, whiteSpace: 'pre-wrap' }}>
                {f.details}
              </Typography>

              {f.diagnostics ? (
                <>
                  <Button
                    size="small"
                    sx={{ mt: 1, textTransform: 'none' }}
                    onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                    endIcon={<Icon icon={expanded === f.id ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={16} />}
                  >
                    Diagnostics
                    {f.diagnostics?.errorCount > 0 ? ` · ${f.diagnostics.errorCount} error${f.diagnostics.errorCount === 1 ? '' : 's'}` : ''}
                  </Button>
                  {expanded === f.id && (
                    <Box component="pre" sx={{
                      mt: 1, p: 1.5, borderRadius: 1, bgcolor: 'grey.900', color: 'grey.100',
                      fontSize: 11, overflowX: 'auto', maxHeight: 340, whiteSpace: 'pre-wrap',
                    }}>
                      {JSON.stringify(f.diagnostics, null, 2)}
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                  No diagnostics — the submitter declined to share them.
                </Typography>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ProductFeedbackPanel;
