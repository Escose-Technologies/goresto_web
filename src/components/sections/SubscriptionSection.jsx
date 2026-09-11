import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { subscriptionService } from '../../services/apiService';

const PLAN_LABEL = { free_trial: 'Free Trial', standard: 'Standard', custom: 'Custom' };
const STATUS_META = {
  trialing:  { label: 'Free period active', color: 'info' },
  active:    { label: 'Active',             color: 'success' },
  past_due:  { label: 'Payment due',        color: 'warning' },
  suspended: { label: 'Suspended',          color: 'error' },
  cancelled: { label: 'Cancelled',          color: 'default' },
};

const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const daysUntil = (iso) => (iso ? Math.ceil((new Date(iso) - Date.now()) / 86400000) : null);

const Row = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={600}>{value}</Typography>
  </Stack>
);

const SubscriptionSection = ({ restaurantId, toast }) => {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    subscriptionService.mine(restaurantId)
      .then(setSub)
      .catch((e) => toast?.error('Could not load your plan: ' + e.message))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) return <Typography variant="body2" color="text.secondary">Loading your plan…</Typography>;

  if (!sub) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>Subscription Plan</Typography>
        <Alert severity="info">
          No plan is recorded for this restaurant yet. Please contact the Goresto team.
        </Alert>
      </Box>
    );
  }

  const status = STATUS_META[sub.status] || STATUS_META.trialing;
  const left = daysUntil(sub.trialEndsAt);
  const isTrial = sub.plan === 'free_trial' && sub.trialEndsAt;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700}>Subscription Plan</Typography>
      <Typography variant="body2" color="text.secondary" mb={2.5}>
        Your Goresto plan and billing status.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Icon icon="material-symbols:card-membership-outline-rounded" width={26} />
              <Box>
                <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                  {PLAN_LABEL[sub.plan] || sub.plan}
                </Typography>
                <Chip size="small" color={status.color} label={status.label} sx={{ mt: 0.5 }} />
              </Box>
            </Stack>

            <Row
              label="Price"
              value={Number(sub.priceRupees) === 0
                ? 'Free'
                : `₹${Number(sub.priceRupees).toLocaleString('en-IN')} / ${sub.billingCycle === 'yearly' ? 'year' : 'month'}`}
            />
            {isTrial && <Row label="Free until" value={fmt(sub.trialEndsAt)} />}
            {sub.currentPeriodEnd && <Row label="Current period ends" value={fmt(sub.currentPeriodEnd)} />}
            <Row label="Member since" value={fmt(sub.createdAt)} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {isTrial && left !== null && left > 30 && (
            <Alert severity="success" icon={<Icon icon="mdi:gift-outline" width={22} />}>
              <Typography variant="body2" fontWeight={600}>You're on the launch offer</Typography>
              <Typography variant="caption">
                Everything is free until {fmt(sub.trialEndsAt)} — {left} days from now. Nothing to pay,
                and no card on file.
              </Typography>
            </Alert>
          )}
          {isTrial && left !== null && left <= 30 && left >= 0 && (
            <Alert severity="warning">
              <Typography variant="body2" fontWeight={600}>
                Your free period ends in {left} {left === 1 ? 'day' : 'days'}
              </Typography>
              <Typography variant="caption">
                The Goresto team will be in touch before {fmt(sub.trialEndsAt)}. Your restaurant keeps
                working in the meantime.
              </Typography>
            </Alert>
          )}
          {sub.status === 'past_due' && (
            <Alert severity="warning">
              <Typography variant="body2" fontWeight={600}>A payment is due</Typography>
              <Typography variant="caption">
                Please get in touch with the Goresto team. Your restaurant is still fully working.
              </Typography>
            </Alert>
          )}

          <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={0.5}>Questions about billing?</Typography>
            <Typography variant="body2" color="text.secondary">
              Write to <a href="mailto:info@escose.com">info@escose.com</a> and the team will help.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubscriptionSection;
