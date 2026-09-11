// Nginx in front of the API refuses request bodies over 1MB, and its 413 carries
// no CORS header — so the browser surfaces it as an opaque "Failed to fetch"
// rather than a size error. Shrink every upload well under that before sending.
const MAX_BYTES = 800 * 1024;
const MAX_EDGE = 1600;
const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55];

const loadBitmap = (blob) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image')); };
  img.src = url;
});

const toBlob = (canvas, quality) => new Promise((resolve) => {
  canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
});

/**
 * Re-encode an image blob as a JPEG that fits comfortably inside the upload
 * limit. Returns the original blob untouched if it is already small enough.
 */
export const compressImage = async (blob, { maxBytes = MAX_BYTES, maxEdge = MAX_EDGE } = {}) => {
  if (blob.size <= maxBytes && blob.type === 'image/jpeg') return blob;

  const img = await loadBitmap(blob);
  let { width, height } = img;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  let out = null;
  for (const q of QUALITY_STEPS) {
    out = await toBlob(canvas, q);
    if (out && out.size <= maxBytes) return out;
  }

  // Still too big at the lowest quality — halve the dimensions once and retry.
  canvas.width = Math.round(width / 2);
  canvas.height = Math.round(height / 2);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  const last = await toBlob(canvas, 0.7);
  return last && (!out || last.size < out.size) ? last : out;
};

export default compressImage;
