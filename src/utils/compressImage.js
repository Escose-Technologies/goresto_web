// Every image the app accepts is re-encoded before it goes anywhere. The raw
// file is never uploaded and never stored:
//   - uploads go through nginx, which refuses bodies over 1MB and answers with
//     a 413 that carries no CORS header (the browser then reports an opaque
//     "Failed to fetch"), so the body has to stay comfortably under that;
//   - logos, covers and staff photos are stored as base64 in Postgres text
//     columns and re-sent on every page load, where base64 costs a further 33%.
// Compression is what makes a large pick safe, so we accept up to 10MB in.
export const MAX_PICK_BYTES = 10 * 1024 * 1024;

// Sized by the job each image actually does, rather than one number for all.
export const IMAGE_PRESETS = {
  banner: { maxEdge: 1600, maxBytes: 800 * 1024 },   // storefront gallery / cover
  photo: { maxEdge: 1200, maxBytes: 500 * 1024 },    // menu item
  avatar: { maxEdge: 512, maxBytes: 150 * 1024 },    // logo, staff portrait
};

const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55, 0.45];

const loadBitmap = (blob) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    // Most often an iPhone HEIC opened on a browser that cannot decode it.
    reject(new Error('This image format could not be read. Try a JPG or PNG.'));
  };
  img.src = url;
});

const toBlob = (canvas, quality) => new Promise((resolve) => {
  canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
});

const draw = (img, width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * Re-encode an image blob as a JPEG that fits the given preset.
 * Throws rather than returning the original — an oversized raw file must never
 * reach the network or the database.
 */
export const compressImage = async (blob, preset = 'banner') => {
  const { maxEdge, maxBytes } = typeof preset === 'string'
    ? (IMAGE_PRESETS[preset] || IMAGE_PRESETS.banner)
    : { ...IMAGE_PRESETS.banner, ...preset };

  const img = await loadBitmap(blob);

  // Try progressively smaller dimensions, and within each, lower quality.
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  let width = img.width * scale;
  let height = img.height * scale;

  let best = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const canvas = draw(img, width, height);
    for (const q of QUALITY_STEPS) {
      const out = await toBlob(canvas, q);
      if (!out) continue;
      if (!best || out.size < best.size) best = out;
      if (out.size <= maxBytes) return out;
    }
    width /= 1.5;
    height /= 1.5;
  }

  if (best && best.size <= maxBytes * 1.25) return best;
  throw new Error('That image could not be reduced to a usable size. Please try a different one.');
};

/** Compress, then hand back a data URL — for the columns that store base64. */
export const compressToDataUrl = async (blob, preset = 'avatar') => {
  const out = await compressImage(blob, preset);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Error reading image file'));
    reader.readAsDataURL(out);
  });
};

export default compressImage;
