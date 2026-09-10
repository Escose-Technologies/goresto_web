// Rolling buffer of recent client-side errors, attached to product feedback so
// "the billing page broke" arrives with an actual stack trace.
//
// Nothing leaves the browser here. The buffer is read only when the user
// submits feedback AND ticks the consent box.

const MAX_ENTRIES = 25;
const MAX_TEXT = 1000;

const buffer = [];
let installed = false;

// Errors routinely contain tokens — a failed request logs its Authorization
// header, a validation error echoes a password field. Redact before storing,
// so a secret is never sitting in memory waiting to be uploaded.
const REDACTIONS = [
  [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[jwt]'],
  [/(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, '$1[redacted]'],
  [/("?(?:password|token|secret|authorization|apiKey|refreshToken)"?\s*[:=]\s*")([^"]*)(")/gi, '$1[redacted]$3'],
  [/([?&](?:token|key|password|secret)=)[^&\s]+/gi, '$1[redacted]'],
];

export const sanitize = (text) => {
  let out = String(text ?? '');
  REDACTIONS.forEach(([re, rep]) => { out = out.replace(re, rep); });
  return out.length > MAX_TEXT ? `${out.slice(0, MAX_TEXT)}…[truncated]` : out;
};

const push = (entry) => {
  buffer.push({ ...entry, at: new Date().toISOString() });
  while (buffer.length > MAX_ENTRIES) buffer.shift();
};

const describe = (arg) => {
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
};

/**
 * Start capturing. Safe to call more than once; only the first takes effect.
 * Wraps console.error rather than replacing it, so existing logging is intact.
 */
export const installErrorLogger = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (e) => {
    push({
      kind: 'error',
      message: sanitize(e.message),
      source: sanitize(`${e.filename || ''}:${e.lineno || 0}:${e.colno || 0}`),
      stack: sanitize(e.error?.stack || ''),
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    push({
      kind: 'unhandledrejection',
      message: sanitize(describe(reason)),
      stack: sanitize(reason?.stack || ''),
    });
  });

  const originalError = console.error;
  console.error = (...args) => {
    try {
      push({ kind: 'console.error', message: sanitize(args.map(describe).join(' ')) });
    } catch {
      // Capturing must never break logging.
    }
    originalError.apply(console, args);
  };
};

/** Snapshot of what's been captured, newest last. */
export const getErrorLog = () => buffer.slice();

export const clearErrorLog = () => { buffer.length = 0; };
