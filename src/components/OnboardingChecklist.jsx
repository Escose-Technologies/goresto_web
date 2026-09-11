import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { onboardingService } from '../services/apiService';

const KEY = 'goresto_onboarding_collapsed';

/**
 * Setup progress, shown until it is complete.
 *
 * Collapsible but not dismissible: one of the steps is adding GST details,
 * without which bills cannot be proper tax invoices. Letting that be hidden
 * for good would quietly leave a restaurant non-compliant.
 */
const OnboardingChecklist = ({ restaurantId, onNavigate }) => {
  const [data, setData] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    if (!restaurantId) return;
    onboardingService.mine(restaurantId).then(setData).catch(() => {});
  }, [restaurantId]);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(KEY, String(next)); } catch { /* private mode */ }
      return next;
    });
  };

  // Once every step is done the card retires itself — an established
  // restaurant should never see setup instructions again.
  if (!data || data.complete) return null;

  const pct = data.total ? Math.round((data.done / data.total) * 100) : 0;

  return (
    <Card
      variant="outlined"
      sx={{ p: 2, mb: 2.5, borderColor: 'primary.light', bgcolor: 'primary.lighter', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
          <Icon icon="mdi:rocket-launch-outline" width={22} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Finish setting up your restaurant
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data.done} of {data.total} done · {data.remaining} {data.remaining === 1 ? 'step' : 'steps'} left
            </Typography>
          </Box>
        </Stack>
        <Button size="small" onClick={toggle} endIcon={<Icon icon={collapsed ? 'mdi:chevron-down' : 'mdi:chevron-up'} width={18} />}>
          {collapsed ? 'Show' : 'Hide'}
        </Button>
      </Stack>

      <LinearProgress variant="determinate" value={pct} sx={{ mt: 1.25, height: 6, borderRadius: 3 }} />

      <Collapse in={!collapsed}>
        <Stack spacing={0.5} sx={{ mt: 1.75 }}>
          {data.steps.map((step) => (
            <Stack
              key={step.id}
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ py: 0.75, opacity: step.done ? 0.6 : 1 }}
            >
              <Icon
                icon={step.done ? 'mdi:check-circle' : 'mdi:circle-outline'}
                width={20}
                style={{ color: step.done ? '#10B981' : '#9CA3AF', flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={step.done ? 400 : 600}
                  sx={{ textDecoration: step.done ? 'line-through' : 'none' }}
                >
                  {step.label}
                </Typography>
                {!step.done && (
                  <Typography variant="caption" color="text.secondary">{step.help}</Typography>
                )}
              </Box>
              {!step.done && (
                <Button size="small" variant="outlined" onClick={() => onNavigate?.(step.tab)}>
                  Open
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
      </Collapse>
    </Card>
  );
};

export default OnboardingChecklist;
