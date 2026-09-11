import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import './PhotoViewer.css';

const SWIPE_THRESHOLD = 50;

/**
 * Full-screen photo viewer for the public menu's restaurant gallery.
 * Touch-first: swipe left/right, tap anywhere outside the image to close.
 */
export const PhotoViewer = ({ photos = [], startIndex = 0, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef(null);

  const count = photos.length;
  const go = (delta) => setIndex((i) => (i + delta + count) % count);

  // Escape to close, arrows to navigate — desktop customers scan the QR too.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count]);

  // Freeze the menu behind the viewer so swiping doesn't scroll it.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (count === 0) return null;
  const photo = photos[index];

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="photo-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Restaurant photos"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button type="button" className="photo-viewer-close" onClick={onClose} aria-label="Close photos">
        <Icon icon="mdi:close" width={24} />
      </button>

      <span className="photo-viewer-counter">{index + 1} / {count}</span>

      <img
        src={photo.url}
        alt={photo.caption || `Photo ${index + 1}`}
        className="photo-viewer-image"
        onClick={(e) => e.stopPropagation()}
      />

      {photo.caption && (
        <p className="photo-viewer-caption" onClick={(e) => e.stopPropagation()}>{photo.caption}</p>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            className="photo-viewer-nav photo-viewer-nav--prev"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            aria-label="Previous photo"
          >
            <Icon icon="mdi:chevron-left" width={28} />
          </button>
          <button
            type="button"
            className="photo-viewer-nav photo-viewer-nav--next"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            aria-label="Next photo"
          >
            <Icon icon="mdi:chevron-right" width={28} />
          </button>
        </>
      )}
    </div>
  );
};

export default PhotoViewer;
