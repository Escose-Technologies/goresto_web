import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Stars = ({ value = 0, size = 16 }) => (
  <Stack direction="row" spacing={0.15} aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Icon
        key={i}
        icon={i <= value ? 'material-symbols:star-rounded' : 'material-symbols:star-outline-rounded'}
        width={size}
        style={{ color: i <= value ? '#F59E0B' : '#C7CBD1' }}
      />
    ))}
  </Stack>
);

const ReviewsSection = ({ reviews = [], menuItems = [], loading = false, onDelete, onOpenOrder }) => {
  const [ratingFilter, setRatingFilter] = useState('all');

  const itemName = useMemo(() => {
    const map = new Map(menuItems.map((m) => [m.id, m.name]));
    return (id) => (id ? map.get(id) || 'Menu item' : null);
  }, [menuItems]);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, total: 0, buckets: [0, 0, 0, 0, 0] };
    const buckets = [0, 0, 0, 0, 0];
    let sum = 0;
    reviews.forEach((r) => {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) buckets[r.rating - 1] += 1;
    });
    return { avg: Math.round((sum / reviews.length) * 10) / 10, total: reviews.length, buckets };
  }, [reviews]);

  const visible = useMemo(() => {
    const list = ratingFilter === 'all'
      ? reviews
      : reviews.filter((r) => String(r.rating) === String(ratingFilter));
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, ratingFilter]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1.5}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h5" fontWeight={700}>Reviews</Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
          </Typography>
        </Stack>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Rating</InputLabel>
          <Select value={ratingFilter} label="Rating" onChange={(e) => setRatingFilter(e.target.value)}>
            <MenuItem value="all">All ratings</MenuItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <MenuItem key={r} value={r}>{r} star{r > 1 ? 's' : ''}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {stats.total > 0 && (
        <Card variant="outlined" sx={{ p: 2.5, mb: 2.5 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Stack alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={0.5}>
                <Typography variant="h3" fontWeight={800} lineHeight={1}>{stats.avg}</Typography>
                <Stars value={Math.round(stats.avg)} size={18} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: true }}>
              <Stack spacing={0.5}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.buckets[star - 1];
                  const pct = stats.total ? (count / stats.total) * 100 : 0;
                  return (
                    <Stack key={star} direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" sx={{ width: 12 }}>{star}</Typography>
                      <Icon icon="material-symbols:star-rounded" width={13} style={{ color: '#F59E0B' }} />
                      <Box sx={{ flex: 1, height: 7, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
                        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: 'warning.main' }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 22, textAlign: 'right' }}>
                        {count}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Grid>
          </Grid>
        </Card>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography>Loading reviews…</Typography>
        </Box>
      ) : visible.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Icon icon="material-symbols:star-outline-rounded" width={44} style={{ opacity: 0.4, marginBottom: 8 }} />
          <Typography>
            {reviews.length === 0
              ? 'No reviews yet. They arrive when customers rate you from the menu.'
              : 'No reviews with this rating.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {visible.map((r) => (
            <Grid key={r.id} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {r.customerName || 'Anonymous'}
                      </Typography>
                      <Stars value={r.rating} />
                    </Stack>
                    {r.menuItemId && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={itemName(r.menuItemId)}
                        sx={{ mt: 0.75 }}
                      />
                    )}
                  </Box>
                  {onDelete && (
                    <Tooltip title="Delete review">
                      <IconButton size="small" onClick={() => onDelete(r.id)}>
                        <Icon icon="mdi:delete-outline" width={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {r.comment && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
                    {r.comment}
                  </Typography>
                )}

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25 }} spacing={1}>
                  <Typography variant="caption" color="text.disabled">
                    {timeAgo(r.createdAt)}
                  </Typography>
                  {r.orderId && onOpenOrder && (
                    <Stack
                      direction="row"
                      spacing={0.25}
                      alignItems="center"
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenOrder(r.orderId)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenOrder(r.orderId)}
                      sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                      <Icon icon="mdi:receipt-text-outline" width={15} />
                      <Typography variant="caption" fontWeight={600}>View order</Typography>
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ReviewsSection;
