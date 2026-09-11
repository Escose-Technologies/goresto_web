import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { subscriptionService } from '../../services/apiService';

const PLANS = [
  { value: 'free_trial', label: 'Free trial' },
  { value: 'standard', label: 'Standard' },
  { value: 'custom', label: 'Custom' },
];
const STATUSES = [
  { value: 'trialing', label: 'Trialing', color: 'info' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'past_due', label: 'Past due', color: 'warning' },
  { value: 'suspended', label: 'Suspended', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
];
const METHODS = ['upi', 'cash', 'bank_transfer', 'card', 'other'];

const rupees = (paise) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const daysUntil = (iso) => (iso ? Math.ceil((new Date(iso) - Date.now()) / 86400000) : null);

const SubscriptionsPanel = ({ toast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // { sub, mode: 'edit' | 'trial' | 'payment' }
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [capDraft, setCapDraft] = useState('');

  const load = () => {
    setLoading(true);
    subscriptionService.listAll()
      .then((d) => { setData(d); setCapDraft(String(d?.usage?.cap ?? '')); })
      .catch((e) => toast?.error('Failed to load subscriptions: ' + e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const subs = data?.subscriptions || [];
  const usage = data?.usage || { cap: 0, used: 0, remaining: 0 };

  const expiringSoon = useMemo(
    () => subs.filter((s) => {
      const d = daysUntil(s.trialEndsAt);
      return s.status === 'trialing' && d !== null && d <= 30;
    }),
    [subs],
  );

  const openEdit = (sub, mode) => {
    setEditing({ sub, mode });
    setForm(mode === 'edit'
      ? { plan: sub.plan, status: sub.status, priceRupees: (sub.pricePaise || 0) / 100,
          billingCycle: sub.billingCycle, trialEndsAt: sub.trialEndsAt ? sub.trialEndsAt.slice(0, 10) : '', reason: '' }
      : mode === 'trial'
        ? { days: 365, reason: '' }
        : { amountRupees: (sub.pricePaise || 0) / 100, method: 'upi', reference: '', notes: '' });
  };

  const submit = async () => {
    const { sub, mode } = editing;
    setSaving(true);
    try {
      if (mode === 'edit') {
        await subscriptionService.update(sub.restaurantId, {
          plan: form.plan, status: form.status, priceRupees: form.priceRupees,
          billingCycle: form.billingCycle,
          trialEndsAt: form.trialEndsAt ? new Date(form.trialEndsAt).toISOString() : null,
          reason: form.reason,
        });
        toast?.success('Subscription updated');
      } else if (mode === 'trial') {
        await subscriptionService.restartTrial(sub.restaurantId, { days: form.days, reason: form.reason });
        toast?.success('Free period restarted');
      } else {
        await subscriptionService.recordPayment(sub.restaurantId, {
          amountRupees: form.amountRupees, method: form.method,
          reference: form.reference || null, notes: form.notes || null,
        });
        toast?.success('Payment recorded');
      }
      setEditing(null);
      load();
    } catch (e) {
      toast?.error('Failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveCap = async () => {
    try {
      const d = await subscriptionService.setFreeSlots(Number(capDraft));
      setData((prev) => ({ ...prev, usage: d }));
      toast?.success(`Free slots set to ${d.cap}`);
    } catch (e) {
      toast?.error('Failed: ' + e.message);
    }
  };

  if (loading) return <Typography variant="body2" color="text.secondary">Loading subscriptions…</Typography>;

  const reasonRequired = editing?.mode !== 'payment';
  const canSubmit = !saving && (!reasonRequired || (form.reason || '').trim().length >= 3);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Subscriptions</Typography>
          <Typography variant="body2" color="text.secondary">
            Nothing charges automatically — payments are recorded by hand.
          </Typography>
        </Box>
        <Button size="small" onClick={load} startIcon={<Icon icon="mdi:refresh" width={18} />}>Refresh</Button>
      </Stack>

      <Grid container spacing={1.5} mb={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Free-year slots
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {usage.used} / {usage.cap}
              <Typography component="span" variant="body2" color="text.secondary"> used</Typography>
            </Typography>
            <Stack direction="row" spacing={1} mt={1} alignItems="center">
              <TextField size="small" type="number" label="Cap" value={capDraft}
                onChange={(e) => setCapDraft(e.target.value)} sx={{ width: 120 }} />
              <Button size="small" variant="outlined" onClick={saveCap}>Update</Button>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          {expiringSoon.length > 0 ? (
            <Alert severity="warning" sx={{ height: '100%' }}>
              <strong>{expiringSoon.length}</strong> free {expiringSoon.length === 1 ? 'period ends' : 'periods end'} within 30 days:{' '}
              {expiringSoon.map((s) => s.restaurant?.name).join(', ')}
            </Alert>
          ) : (
            <Alert severity="success" sx={{ height: '100%' }}>No free periods ending in the next 30 days.</Alert>
          )}
        </Grid>
      </Grid>

      <Stack spacing={1.25}>
        {subs.map((s) => {
          const st = STATUSES.find((x) => x.value === s.status) || STATUSES[0];
          const left = daysUntil(s.trialEndsAt);
          return (
            <Card key={s.id} variant="outlined" sx={{ p: 1.75 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} flexWrap="wrap">
                <Box sx={{ minWidth: 210, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="body2" fontWeight={700}>{s.restaurant?.name || s.restaurantId}</Typography>
                    <Chip size="small" variant="outlined" label={PLANS.find((p) => p.value === s.plan)?.label || s.plan} />
                    <Chip size="small" color={st.color} label={st.label} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.4 }}>
                    {rupees(s.pricePaise)} / {s.billingCycle === 'yearly' ? 'year' : 'month'}
                    {s.trialEndsAt && ` · free until ${fmt(s.trialEndsAt)}`}
                    {left !== null && left >= 0 && ` (${left}d left)`}
                    {left !== null && left < 0 && ` (expired ${Math.abs(left)}d ago)`}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button size="small" variant="outlined" onClick={() => openEdit(s, 'edit')}>Edit</Button>
                  <Button size="small" variant="outlined" onClick={() => openEdit(s, 'trial')}>Restart free</Button>
                  <Button size="small" variant="contained" onClick={() => openEdit(s, 'payment')}>Record payment</Button>
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </Stack>

      <Dialog open={Boolean(editing)} onClose={() => !saving && setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing?.mode === 'edit' ? 'Edit subscription'
            : editing?.mode === 'trial' ? 'Restart free period' : 'Record payment'}
          {' — '}{editing?.sub?.restaurant?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {editing?.mode === 'edit' && (
              <>
                <TextField select label="Plan" value={form.plan || ''} onChange={(e) => setForm({ ...form, plan: e.target.value })} fullWidth>
                  {PLANS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                </TextField>
                <TextField select label="Status" value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
                  {STATUSES.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                </TextField>
                <TextField label="Price (₹)" type="number" value={form.priceRupees ?? ''} onChange={(e) => setForm({ ...form, priceRupees: e.target.value })} fullWidth helperText="Set 0 for free. Any amount allowed — this is the discount lever." />
                <TextField select label="Billing cycle" value={form.billingCycle || 'monthly'} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })} fullWidth>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>
                <TextField label="Free until" type="date" value={form.trialEndsAt || ''} onChange={(e) => setForm({ ...form, trialEndsAt: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              </>
            )}
            {editing?.mode === 'trial' && (
              <TextField label="Free days from today" type="number" value={form.days ?? 365} onChange={(e) => setForm({ ...form, days: e.target.value })} fullWidth helperText="365 = another full year" />
            )}
            {editing?.mode === 'payment' && (
              <>
                <TextField label="Amount (₹)" type="number" value={form.amountRupees ?? ''} onChange={(e) => setForm({ ...form, amountRupees: e.target.value })} fullWidth />
                <TextField select label="Method" value={form.method || 'upi'} onChange={(e) => setForm({ ...form, method: e.target.value })} fullWidth>
                  {METHODS.map((m) => <MenuItem key={m} value={m}>{m.replace('_', ' ')}</MenuItem>)}
                </TextField>
                <TextField label="Reference (UTR / txn id)" value={form.reference || ''} onChange={(e) => setForm({ ...form, reference: e.target.value })} fullWidth />
                <TextField label="Notes" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth />
              </>
            )}
            {reasonRequired && (
              <TextField
                label="Reason"
                value={form.reason || ''}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                fullWidth required multiline minRows={2}
                helperText="Recorded permanently against this subscription. Why is this change being made?"
              />
            )}
            <Stack direction="row" spacing={1.5}>
              <Button variant="contained" onClick={submit} disabled={!canSubmit}>
                {saving ? 'Saving…' : 'Confirm'}
              </Button>
              <Button variant="outlined" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubscriptionsPanel;
