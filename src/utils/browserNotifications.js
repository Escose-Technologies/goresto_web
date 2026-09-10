// Desktop/browser notifications via the Notification API.
//
// Deliberately per-device rather than restaurant-level: permission is granted
// by the browser on this machine, so a preference stored on the restaurant
// could claim "on" for a device that never granted it.

const PREF_KEY = 'goresto_desktop_alerts';

export const isSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const getPermission = () => (isSupported() ? Notification.permission : 'unsupported');

/** Whether the user turned alerts on for THIS device (independent of permission). */
export const isEnabled = () => {
  try {
    return localStorage.getItem(PREF_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setEnabled = (value) => {
  try {
    localStorage.setItem(PREF_KEY, value ? 'true' : 'false');
  } catch {
    // Private mode / blocked storage — the toggle simply won't persist.
  }
};

/**
 * Must be called from a user gesture; browsers ignore permission prompts
 * that aren't tied to a click.
 */
export const requestPermission = async () => {
  if (!isSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') setEnabled(true);
    return result;
  } catch {
    return 'denied';
  }
};

/**
 * Show a notification. No-ops unless supported, permitted and enabled here.
 * `tag` collapses repeats so ten orders don't stack ten banners.
 */
export const showNotification = (title, { body, tag, onClick } = {}) => {
  if (!isSupported() || Notification.permission !== 'granted' || !isEnabled()) return null;
  try {
    const n = new Notification(title, {
      body,
      tag,
      icon: '/logo.png',
      badge: '/logo.png',
      renotify: Boolean(tag),
    });
    n.onclick = () => {
      try {
        window.focus();
        onClick?.();
        n.close();
      } catch {
        // window may be gone
      }
    };
    return n;
  } catch {
    return null;
  }
};
