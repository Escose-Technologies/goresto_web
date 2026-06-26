// Date-range helpers for billing filters/reports.
//
// IMPORTANT: ranges are computed from the user's LOCAL day boundaries and
// returned as absolute ISO instants. Do NOT use `new Date(y,m,d).toISOString()`
// and slice the date out — in any UTC+ timezone (e.g. IST +5:30) that yields
// the previous calendar day. Always send instants so the bill list and the
// summary query cover exactly the same window.

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const DAY_MS = 86400000;

// Returns { from, to } as ISO instants, or {} for "all" (no bounds).
export function presetRange(preset) {
  const now = new Date();
  const today = startOfDay(now);

  switch (preset) {
    case 'today':
      return { from: today.toISOString(), to: endOfDay(now).toISOString() };
    case 'yesterday': {
      const y = new Date(today.getTime() - DAY_MS);
      return { from: startOfDay(y).toISOString(), to: endOfDay(y).toISOString() };
    }
    case 'week': {
      const day = today.getDay();
      const monday = new Date(today.getTime() - ((day === 0 ? 6 : day - 1) * DAY_MS));
      return { from: monday.toISOString(), to: endOfDay(now).toISOString() };
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: first.toISOString(), to: endOfDay(now).toISOString() };
    }
    case 'all':
    default:
      return {};
  }
}

// Convert two <input type="date"> values ("YYYY-MM-DD") into local-day ISO instants.
export function customRange(fromStr, toStr) {
  if (!fromStr || !toStr) return {};
  const [fy, fm, fd] = fromStr.split('-').map(Number);
  const [ty, tm, td] = toStr.split('-').map(Number);
  return {
    from: new Date(fy, fm - 1, fd, 0, 0, 0, 0).toISOString(),
    to: new Date(ty, tm - 1, td, 23, 59, 59, 999).toISOString(),
  };
}

// Local YYYY-MM-DD (for filenames / labels), never UTC-shifted.
export function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
