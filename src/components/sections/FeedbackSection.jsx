import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { feedbackService } from '../../services/apiService';
import { collectDiagnostics, summarizeDiagnostics } from '../../utils/diagnostics';

const CATEGORIES = [
  { value: 'bug', label: 'Something is broken' },
  { value: 'feature_request', label: 'I want a new feature' },
  { value: 'general', label: 'General feedback' },
];

const STATUS_META = {
  new: { label: 'New', color: 'default' },
  triaged: { label: 'Triaged', color: 'info' },
  in_progress: { label: 'In progress', color: 'warning' },
  resolved: { label: 'Resolved', color: 'success' },
  wont_fix: { label: "Won't fix", color: 'default' },
};

const Stars = ({ value, onChange }) => (
  <Stack direction="row" spacing={0.5}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Box
        key={i}
        component="button"
        type="button"
        aria-label={`${i} star${i > 1 ? 's' : ''}`}
        onClick={() => onChange(i)}
        sx={{
          border: 'none', background: 'none', p: 0, cursor: 'pointer', lineHeight: 0,
          color: i <= value ? '#F59E0B' : '#C7CBD1',
          transition: 'transform .1s',
          '&:hover': { transform: 'scale(1.12)' },
        }}
      >
        <Icon icon={i <= value ? 'material-symbols:star-rounded' : 'material-symbols:star-outline-rounded'} width={32} />
      </Box>
    ))}
  </Stack>
);

const FeedbackSection = ({ restaurantId, toast }) => {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [consent, setConsent] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Snapshot once on mount so the "what's included" list matches what actually
  // gets sent, rather than re-reading at submit time.
  const diagnostics = useMemo(() => collectDiagnostics({ route: 'Goresto Feedback' }), []);
  const summary = useMemo(() => summarizeDiagnostics(diagnostics), [diagnostics]);

  const loadHistory = () => {
    if (!restaurantId) return;
    setLoadingHistory(true);
    feedbackService.mine(restaurantId)
      .then((d) => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  };

  useEffect(loadHistory, [restaurantId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) { toast?.warning('Please give a rating'); return; }
    setSubmitting(true);
    try {
      await feedbackService.submit(restaurantId, {
        rating,
        category,
        title: title.trim(),
        details: details.trim(),
        consentGiven: consent,
        // Re-collected at submit so the error list includes anything that
        // happened while the form was open.
        diagnostics: consent ? collectDiagnostics({ route: 'Goresto Feedback' }) : null,
      });
      toast?.success('Thank you — your feedback has been sent to the Goresto team');
      setRating(0); setCategory('general'); setTitle(''); setDetails('');
      loadHistory();
    } catch (err) {
      toast?.error('Could not send feedback: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700}>Goresto Feedback</Typography>
      <Typography variant="body2" color="text.secondary" mb={2.5}>
        Tell us what is working and what is not. This goes straight to the team that
        builds Goresto.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ p: 2.5 }}>
            <Box component="form" onSubmit={submit}>
              <Typography variant="body2" fontWeight={600} mb={1}>
                How is Goresto working for you?
              </Typography>
              <Stars value={rating} onChange={setRating} />

              <TextField
                label="What is this about?"
                select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                sx={{ mt: 2.5, mb: 2 }}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                placeholder="Short summary"
                sx={{ mb: 2 }}
                slotProps={{ htmlInput: { maxLength: 200 } }}
              />

              <TextField
                label="Tell us more"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                fullWidth
                required
                multiline
                minRows={5}
                placeholder="What happened? What did you expect instead?"
                sx={{ mb: 2 }}
                slotProps={{ htmlInput: { maxLength: 5000 } }}
              />

              <Box sx={{ p: 1.5, mb: 2, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                <Box component="label" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{ accentColor: '#3385F0', marginTop: 3 }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Include my browser and device details, and any recent errors
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Helps us reproduce problems instead of guessing. No location is
                      collected, and passwords and tokens are removed before sending.
                    </Typography>
                  </Box>
                </Box>

                <Button
                  size="small"
                  onClick={() => setShowDetails((v) => !v)}
                  endIcon={<Icon icon={showDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={16} />}
                  sx={{ mt: 0.5, ml: 3, textTransform: 'none' }}
                >
                  {showDetails ? 'Hide' : 'See exactly what is included'}
                </Button>

                <Collapse in={showDetails}>
                  <Box sx={{ ml: 3, mt: 1 }}>
                    {summary.map(([label, value]) => (
                      <Stack key={label} direction="row" spacing={1} sx={{ py: 0.25 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 150 }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>{value}</Typography>
                      </Stack>
                    ))}
                    {diagnostics.errorCount > 0 && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        {diagnostics.errorCount} recent error
                        {diagnostics.errorCount === 1 ? '' : 's'} from this session will be
                        attached. This is what helps us fix bugs fastest.
                      </Alert>
                    )}
                  </Box>
                </Collapse>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || !title.trim() || !details.trim()}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Icon icon="mdi:send-outline" width={18} />}
              >
                {submitting ? 'Sending…' : 'Send feedback'}
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Your previous feedback</Typography>
          {loadingHistory ? (
            <Typography variant="body2" color="text.secondary">Loading…</Typography>
          ) : history.length === 0 ? (
            <Card variant="outlined" sx={{ p: 2.5, textAlign: 'center', color: 'text.secondary' }}>
              <Icon icon="mdi:message-text-outline" width={32} style={{ opacity: 0.4 }} />
              <Typography variant="body2" sx={{ mt: 0.5 }}>Nothing sent yet.</Typography>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {history.map((f) => (
                <Card key={f.id} variant="outlined" sx={{ p: 1.75 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 0 }}>{f.title}</Typography>
                    <Chip
                      size="small"
                      label={STATUS_META[f.status]?.label || f.status}
                      color={STATUS_META[f.status]?.color || 'default'}
                      variant={f.status === 'resolved' ? 'filled' : 'outlined'}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {new Date(f.createdAt).toLocaleDateString()} · {f.rating}★
                  </Typography>
                  {f.adminNotes && (
                    <Alert severity="success" sx={{ mt: 1, py: 0.25 }}>
                      <Typography variant="caption">{f.adminNotes}</Typography>
                    </Alert>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackSection;
