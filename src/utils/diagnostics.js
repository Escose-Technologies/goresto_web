// Environment details attached to product feedback, collected only with the
// submitter's consent. Everything here is readable without a permission prompt.
//
// Deliberately NOT collected: geolocation (always prompts, and the restaurant's
// address is already on file), contacts, clipboard, or anything requiring a
// browser permission.

import { getErrorLog } from './errorLog';

const parseBrowser = (ua = '') => {
  const tests = [
    [/Edg\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/Chrome\/([\d.]+)/, 'Chrome'],
    [/Version\/([\d.]+).*Safari/, 'Safari'],
    [/Firefox\/([\d.]+)/, 'Firefox'],
  ];
  for (const [re, name] of tests) {
    const m = ua.match(re);
    if (m) return { name, version: m[1] };
  }
  return { name: 'Unknown', version: '' };
};

const parseOS = (ua = '') => {
  if (/Windows NT ([\d.]+)/.test(ua)) return `Windows ${ua.match(/Windows NT ([\d.]+)/)[1]}`;
  if (/iPhone OS ([\d_]+)/.test(ua)) return `iOS ${ua.match(/iPhone OS ([\d_]+)/)[1].replace(/_/g, '.')}`;
  if (/iPad.*OS ([\d_]+)/.test(ua)) return `iPadOS ${ua.match(/OS ([\d_]+)/)[1].replace(/_/g, '.')}`;
  if (/Mac OS X ([\d_]+)/.test(ua)) return `macOS ${ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g, '.')}`;
  if (/Android ([\d.]+)/.test(ua)) return `Android ${ua.match(/Android ([\d.]+)/)[1]}`;
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
};

/**
 * Snapshot of the current environment. `route` is passed in by the caller so
 * the report says which screen the person was on.
 */
export const collectDiagnostics = ({ route } = {}) => {
  try {
    const ua = navigator.userAgent || '';
    const browser = parseBrowser(ua);
    const errors = getErrorLog();
    return {
      app: {
        version: import.meta.env.VITE_APP_VERSION || 'unknown',
        route: route || (typeof window !== 'undefined' ? window.location.pathname : ''),
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
      browser: { ...browser, userAgent: ua },
      os: parseOS(ua),
      device: {
        screen: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
        pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
        touch: typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false,
        memoryGb: navigator.deviceMemory || null,
        cores: navigator.hardwareConcurrency || null,
      },
      locale: {
        language: navigator.language || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        // Reported because date-window bugs are timezone-shaped, and the
        // offset is what actually determines a "today" boundary.
        utcOffsetMinutes: -new Date().getTimezoneOffset(),
      },
      network: {
        online: navigator.onLine,
        effectiveType: navigator.connection?.effectiveType || null,
      },
      errors,
      errorCount: errors.length,
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return { capturedAt: new Date().toISOString(), incomplete: true };
  }
};

/** Human-readable summary shown in the "what's included" expander. */
export const summarizeDiagnostics = (d) => {
  if (!d) return [];
  return [
    ['App version', d.app?.version],
    ['Screen you were on', d.app?.route],
    ['Browser', d.browser ? `${d.browser.name} ${d.browser.version}` : ''],
    ['Operating system', d.os],
    ['Screen / window size', `${d.device?.screen || '?'} / ${d.device?.viewport || '?'}`],
    ['Language & timezone', `${d.locale?.language || '?'}, ${d.locale?.timezone || '?'}`],
    ['Connection', d.network?.online ? (d.network.effectiveType || 'online') : 'offline'],
    ['Recent errors captured', String(d.errorCount ?? 0)],
  ].filter(([, v]) => v !== undefined && v !== '' && v !== null);
};
