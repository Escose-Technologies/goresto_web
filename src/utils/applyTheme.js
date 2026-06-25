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
 * @param {object} opts
 * @param {string|null} opts.primaryColor
 * @param {string|null} opts.secondaryColor
 * @param {string|null} [opts.fontColor]
 * @param {number|null} [opts.fontSize]
 * @param {HTMLElement}  [opts.target]
 */
export const applyRestaurantTheme = (primaryOrOpts, secondaryColor, target) => {
  let primary, secondary, fontColor, fontSize, el;

  if (typeof primaryOrOpts === 'object' && primaryOrOpts !== null) {
    ({ primaryColor: primary, secondaryColor: secondary, fontColor, fontSize, target: el } = primaryOrOpts);
    el = el || document.documentElement;
  } else {
    primary = primaryOrOpts;
    secondary = secondaryColor;
    el = target || document.documentElement;
  }

  if (!isHex(primary)) {
    [
      '--color-primary',
      '--color-primary-light',
      '--color-primary-dark',
      '--gradient-primary',
    ].forEach((v) => el.style.removeProperty(v));
  } else {
    const light = isHex(secondary) ? secondary : shade(primary, 0.18);
    const dark = shade(primary, -0.16);
    el.style.setProperty('--color-primary', primary);
    el.style.setProperty('--color-primary-light', light);
    el.style.setProperty('--color-primary-dark', dark);
    el.style.setProperty('--gradient-primary', `linear-gradient(180deg, ${light} 0%, ${primary} 100%)`);
  }

  if (isHex(fontColor)) {
    el.style.setProperty('--pm-font-color', fontColor);
  } else {
    el.style.removeProperty('--pm-font-color');
  }

  const fs = typeof fontSize === 'number' && fontSize >= 12 && fontSize <= 22 ? fontSize : null;
  if (fs) {
    el.style.setProperty('--pm-font-size', `${fs}px`);
  } else {
    el.style.removeProperty('--pm-font-size');
  }
};
