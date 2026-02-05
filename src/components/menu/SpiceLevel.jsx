import './SpiceLevel.css';

export const SpiceLevel = ({
  level = 0,
  maxLevel = 3,
  size = 'default',
  showLabel = false,
  interactive = false,
  onChange,
}) => {
  const spiceLabels = {
    0: 'Mild',
    1: 'Light',
    2: 'Medium',
    3: 'Hot',
  };

  const handleClick = (newLevel) => {
    if (interactive && onChange) {
      onChange(newLevel === level ? 0 : newLevel);
    }
  };

  return (
    <div className={`spice-level spice-level-${size}`}>
      <div className="spice-icons">
        {Array.from({ length: maxLevel }, (_, i) => (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            className={`spice-icon ${i < level ? 'active' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => handleClick(i + 1)}
            disabled={!interactive}
            aria-label={`Spice level ${i + 1}`}
          >
            🌶️
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="spice-label">{spiceLabels[level] || spiceLabels[0]}</span>
      )}
    </div>
  );
};

// Compact Spice Indicator
export const SpiceIndicator = ({ level = 0 }) => {
  if (level === 0) return null;

  return (
    <span className="spice-indicator" title={`Spice Level: ${level}/3`}>
      <span className="spice-text">{level > 0 ? '🌶️'.repeat(level) : ''}</span>
    </span>
  );
};
