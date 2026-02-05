import './Rating.css';

export const Rating = ({
  value = 0,
  maxValue = 5,
  size = 'default',
  showCount = false,
  reviewCount = 0,
  interactive = false,
  onChange,
}) => {
  const handleClick = (rating) => {
    if (interactive && onChange) {
      onChange(rating === value ? 0 : rating);
    }
  };

  const renderStar = (index) => {
    const filled = index < Math.floor(value);
    const halfFilled = index === Math.floor(value) && value % 1 >= 0.5;

    return (
      <button
        key={index}
        type={interactive ? 'button' : undefined}
        className={`rating-star ${filled ? 'filled' : ''} ${halfFilled ? 'half' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={() => handleClick(index + 1)}
        disabled={!interactive}
        aria-label={`Rate ${index + 1} star${index !== 0 ? 's' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {halfFilled && (
          <svg className="half-star" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" />
          </svg>
        )}
      </button>
    );
  };

  return (
    <div className={`rating rating-${size}`}>
      <div className="rating-stars">
        {Array.from({ length: maxValue }, (_, i) => renderStar(i))}
      </div>
      {showCount && (
        <span className="rating-info">
          <span className="rating-value">{value.toFixed(1)}</span>
          {reviewCount > 0 && (
            <span className="rating-count">({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
};

// Compact Rating Display
export const RatingDisplay = ({ value = 0, reviewCount = 0 }) => {
  if (!value) return null;

  return (
    <div className="rating-display">
      <svg className="rating-display-star" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="rating-display-value">{value.toFixed(1)}</span>
      {reviewCount > 0 && (
        <span className="rating-display-count">({reviewCount})</span>
      )}
    </div>
  );
};
