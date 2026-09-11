import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { platformHealthService } from '../../services/apiService';

// Thresholds mirror the server's CASE expression. Changing one means changing
// both — kept side by side deliberately rather than duplicated silently.
const HEALTH = {
  healthy:       { label: 'Healthy',       hint: 'ordered in the last 7 days',  color: 'success', icon: 'mdi:check-circle-outline' },
  slowing:       { label: 'Slowing',       hint: '8–14 days quiet',             color: 'info',    icon: 'mdi:trending-down' },
  at_risk:       { label: 'At risk',       hint: '15–30 days quiet',            color: 'warning', icon: 'mdi:alert-outline' },
  dormant:       { label: 'Dormant',       hint: '1–6 months quiet',            color: 'error',   icon: 'mdi:sleep' },
  lost:          { label: 'Lost',          hint: 'over 6 months quiet',         color: 'error',   icon: 'mdi:close-circle-outline' },
  never_ordered: { label: 'Never ordered', hint: 'set up, no orders yet',       color: 'warning', icon: 'mdi:cart-off' },
  not_started:   { label: 'Not started',   hint: 'no menu, no orders',          color: 'default', icon: 'mdi:progress-question' },
};
const ORDER = ['not_started', 'never_ordered', 'lost', 'dormant', 'at_risk', 'slowing', 'healthy'];

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const Stat = ({ label, value, sub }) => (
  <Card variant="outlined" sx={{ p: 1.75, height: '100%' }}>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={800} lineHeight={1.2}>{value}</Typography>
    {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
  </Card>
);

const FunnelStep = ({ label, value, of }) => {
  const pct = of ? Math.round((value / of) * 100) : 0;
  return (
    <Box sx={{ flex: 1, minWidth: 110 }}>
      <Typography variant="h6" fontWeight={800}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Box sx={{ mt: 0.5, height: 5, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: 'primary.main' }} />
      </Box>
      <Typography variant="caption" color="text.disabled">{pct}%</Typography>
    </Box>
  );
};

const ActivationHealthPanel = ({ toast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    platformHealthService.overview()
      .then(setData)
      .catch((err) => toast?.error('Failed to load platform health: ' + err.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const restaurants = data?.restaurants || [];
  const counts = useMemo(() => {
    const c = {};
    restaurants.forEach((r) => { c[r.health] = (c[r.health] || 0) + 1; });
    return c;
  }, [restaurants]);

  // Most concerning first: a dormant restaurant with 50 past orders is a
  // bigger loss than one with 2, so break ties on historical volume.
  const visible = useMemo(() => {
    const list = filter ? restaurants.filter((r) => r.health === filter) : restaurants;
    return [...list].sort((a, b) => {
      const d = ORDER.indexOf(a.health) - ORDER.indexOf(b.health);
      return d !== 0 ? d : (b.orders_total || 0) - (a.orders_total || 0);
    });
  }, [restaurants, filter]);

  if (loading) return <Typography variant="body2" color="text.secondary">Loading platform health…</Typography>;

  const f = data?.funnel || {};
  const t = data?.totals || {};

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Activation &amp; Health</Typography>
          <Typography variant="body2" color="text.secondary">
            Who is actually using Goresto. Visible to the Goresto team only.
          </Typography>
        </Box>
        <Button size="small" onClick={load} startIcon={<Icon icon="mdi:refresh" width={18} />}>Refresh</Button>
      </Stack>

      <Grid container spacing={1.5} mb={2.5}>
        <Grid size={{ xs: 6, md: 3 }}><Stat label="Active restaurants" value={t.active_restaurants ?? 0} sub={`${t.pending_restaurants ?? 0} pending approval`} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Stat label="Orders (30d)" value={t.orders_30d ?? 0} sub={`${t.orders_all_time ?? 0} all time`} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Stat label="Bills (30d)" value={t.bills_all_time ?? 0} sub="all time" /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Stat label="Billed (30d)" value={money(t.revenue_30d)} sub="across all restaurants" /></Grid>
      </Grid>

      <Card variant="outlined" sx={{ p: 2, mb: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Onboarding funnel</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <FunnelStep label="Approved"   value={f.approved ?? 0}       of={f.total} />
          <FunnelStep label="Added menu" value={f.added_menu ?? 0}     of={f.total} />
          <FunnelStep label="Added tables" value={f.added_tables ?? 0} of={f.total} />
          <FunnelStep label="First order" value={f.took_order ?? 0}    of={f.total} />
          <FunnelStep label="First bill"  value={f.generated_bill ?? 0} of={f.total} />
        </Stack>
      </Card>

      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
        <Chip
          label={`All (${restaurants.length})`}
          onClick={() => setFilter('')}
          color={filter === '' ? 'primary' : 'default'}
          variant={filter === '' ? 'filled' : 'outlined'}
        />
        {ORDER.slice().reverse().filter((k) => counts[k]).map((k) => (
          <Chip
            key={k}
            icon={<Icon icon={HEALTH[k].icon} width={16} />}
            label={`${HEALTH[k].label} (${counts[k]})`}
            onClick={() => setFilter(filter === k ? '' : k)}
            color={filter === k ? HEALTH[k].color : 'default'}
            variant={filter === k ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      {visible.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No restaurants in this bucket.</Typography>
      ) : (
        <Stack spacing={1.25}>
          {visible.map((r) => {
            const h = HEALTH[r.health] || HEALTH.not_started;
            return (
              <Card key={r.id} variant="outlined" sx={{ p: 1.75 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} flexWrap="wrap">
                  <Box sx={{ minWidth: 200, flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2" fontWeight={700}>{r.name}</Typography>
                      <Chip size="small" color={h.color} label={h.label} variant="outlined" icon={<Icon icon={h.icon} width={14} />} />
                      {r.status !== 'active' && <Chip size="small" label={r.status} />}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.4 }}>
                      joined {fmtDate(r.joined_at)} · {r.days_since_joined}d ago ·{' '}
                      {r.days_since_order === null
                        ? 'never ordered'
                        : r.days_since_order === 0
                          ? 'ordered today'
                          : `last order ${r.days_since_order}d ago`}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2.5} flexWrap="wrap">
                    {[
                      ['Menu', r.menu_items],
                      ['Tables', r.tables],
                      ['Staff', r.staff],
                      ['Orders', r.orders_total],
                      ['7d', r.orders_7d],
                      ['30d', r.orders_30d],
                      ['Bills', r.bills_total],
                      ['Billed 30d', money(r.revenue_30d)],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ textAlign: 'center', minWidth: 44 }}>
                        <Typography variant="body2" fontWeight={700}>{value}</Typography>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    size="small"
                    href={`/menu/${r.id}`}
                    target="_blank"
                    rel="noopener"
                    startIcon={<Icon icon="mdi:open-in-new" width={16} />}
                  >
                    Menu
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default ActivationHealthPanel;
