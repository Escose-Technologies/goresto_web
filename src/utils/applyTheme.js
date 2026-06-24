// Applies a restaurant's admin-chosen brand colours to CSS custom properties at
// runtime. Falls back to the Goresto defaults baked into global.css when colours
// are missing or invalid. Drives all CSS-variable-based UI (customer menu + the
// custom parts of the internal app); MUI-themed components stay on the default brand.

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const isHex = (v) => typeof v === 'string' && HEX_RE.test(v);

// Mix a hex colour toward white (amount > 0) or black (amount < 0), 0..1.
const shade = (hex, amount) => {
  const toward = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const num = parseInt(hex.slice(1), 16);
  const r = Math.round(((num >> 16) & 0xff) * (1 - p) + toward * p);
  const g = Math.round(((num >> 8) & 0xff) * (1 - p) + toward * p);
  const b = Math.round((num & 0xff) * (1 - p) + toward * p);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

/**
 * @param {string|null} primaryColor   admin-set primary hex (e.g. "#3385F0")
 * @param {string|null} secondaryColor admin-set secondary hex
 * @param {HTMLElement} [target]       element to scope vars to (default :root)
 */
export const applyRestaurantTheme = (primaryColor, secondaryColor, target) => {
  const el = target || document.documentElement;

  // Missing/invalid → remove overrides so global.css defaults win.
  if (!isHex(primaryColor)) {
    [
      '--color-primary',
      '--color-primary-light',
      '--color-primary-dark',
      '--gradient-primary',
    ].forEach((v) => el.style.removeProperty(v));
    return;
  }

  const primary = primaryColor;
  const light = isHex(secondaryColor) ? secondaryColor : shade(primary, 0.18);
  const dark = shade(primary, -0.16);

  el.style.setProperty('--color-primary', primary);
  el.style.setProperty('--color-primary-light', light);
  el.style.setProperty('--color-primary-dark', dark);
  el.style.setProperty('--gradient-primary', `linear-gradient(180deg, ${light} 0%, ${primary} 100%)`);
};
