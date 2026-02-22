import './DietaryBadges.css';

// Main Dietary Type Badge (Veg/Non-Veg/Egg indicator)
export const DietaryBadge = ({ type, size = 'default', showLabel = false }) => {
  if (!type) return null;

  const labels = {
    veg: 'Vegetarian',
    'non-veg': 'Non-Vegetarian',
    nonVeg: 'Non-Vegetarian',
    egg: 'Contains Egg',
    vegan: 'Vegan',
  };

  const normalizedType = type === 'nonVeg' ? 'non-veg' : type;

  return (
    <div className={`dietary-badge dietary-badge-${normalizedType} dietary-badge-${size}`}>
      <span className="dietary-badge-symbol">
        <span className="dietary-dot" />
      </span>
      {showLabel && <span className="dietary-badge-label">{labels[type] || type}</span>}
    </div>
  );
};

// Allergen Labels Component
export const AllergenLabels = ({ allergens = [], size = 'default' }) => {
  if (!allergens || allergens.length === 0) return null;

  const allergenIcons = {
    nuts: '🥜',
    dairy: '🥛',
    gluten: '🌾',
    shellfish: '🦐',
    soy: '🫘',
    eggs: '🥚',
    fish: '🐟',
    sesame: '🌱',
    peanuts: '🥜',
  };

  return (
    <div className={`allergen-labels allergen-labels-${size}`}>
      <span className="allergen-title">Contains:</span>
      <div className="allergen-tags">
        {allergens.map((allergen) => (
          <span key={allergen} className="allergen-tag">
            {allergenIcons[allergen] && <span className="allergen-icon">{allergenIcons[allergen]}</span>}
            {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
};

// Optional Labels (Organic, Gluten-Free, etc.)
export const DietaryLabels = ({ labels = [], size = 'default' }) => {
  if (!labels || labels.length === 0) return null;

  const labelConfig = {
    'gluten-free': { icon: '🌾', label: 'Gluten Free', color: '#10B981' },
    vegan: { icon: '🌱', label: 'Vegan', color: '#22C55E' },
    organic: { icon: '🌿', label: 'Organic', color: '#16A34A' },
    'sugar-free': { icon: '🚫', label: 'Sugar Free', color: '#3B82F6' },
    keto: { icon: '🥑', label: 'Keto', color: '#8B5CF6' },
    'low-calorie': { icon: '🔥', label: 'Low Cal', color: '#F59E0B' },
    spicy: { icon: '🌶️', label: 'Spicy', color: '#EF4444' },
    'chef-special': { icon: '👨‍🍳', label: 'Chef Special', color: '#3385F0' },
    popular: { icon: '⭐', label: 'Popular', color: '#F59E0B' },
    'new': { icon: '✨', label: 'New', color: '#10B981' },
  };

  return (
    <div className={`dietary-labels dietary-labels-${size}`}>
      {labels.map((label) => {
        const config = labelConfig[label] || { icon: '', label, color: '#6B7280' };
        return (
          <span
            key={label}
            className="dietary-label"
            style={{ '--label-color': config.color }}
          >
            {config.icon && <span className="dietary-label-icon">{config.icon}</span>}
            {config.label}
          </span>
        );
      })}
    </div>
  );
};

// Combined Dietary Info Component
export const DietaryInfo = ({
  dietary,
  size = 'default',
  showLabels = true,
  compact = false,
}) => {
  if (!dietary) return null;

  const { type, allergens, labels } = dietary;

  if (compact) {
    return (
      <div className="dietary-info dietary-info-compact">
        <DietaryBadge type={type} size={size} />
        {allergens && allergens.length > 0 && (
          <span className="dietary-info-warning">Contains allergens</span>
        )}
      </div>
    );
  }

  return (
    <div className="dietary-info">
      <DietaryBadge type={type} size={size} showLabel />
      {showLabels && labels && labels.length > 0 && (
        <DietaryLabels labels={labels} size={size} />
      )}
      <AllergenLabels allergens={allergens} size={size} />
    </div>
  );
};
