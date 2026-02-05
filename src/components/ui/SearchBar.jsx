import { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  autoFocus = false,
  showFilters = false,
  onFilterClick,
  filterCount = 0,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar">
      <div className="search-bar-input-wrapper">
        <span className="search-bar-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          className="search-bar-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {value && (
          <button
            type="button"
            className="search-bar-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      {showFilters && (
        <button
          type="button"
          className={`search-bar-filter-btn ${filterCount > 0 ? 'has-filters' : ''}`}
          onClick={onFilterClick}
          aria-label="Filters"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {filterCount > 0 && (
            <span className="filter-count">{filterCount}</span>
          )}
        </button>
      )}
    </div>
  );
};

// Filter Pills Component
export const FilterPills = ({
  filters,
  activeFilters,
  onFilterToggle,
  onClearAll,
}) => {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="filter-pills">
      <div className="filter-pills-scroll">
        {hasActiveFilters && (
          <button
            className="filter-pill filter-pill-clear"
            onClick={onClearAll}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Clear
          </button>
        )}
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-pill ${activeFilters.includes(filter.id) ? 'active' : ''}`}
            onClick={() => onFilterToggle(filter.id)}
          >
            {filter.icon && <span className="filter-pill-icon">{filter.icon}</span>}
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Price Range Filter
export const PriceRangeFilter = ({
  minPrice,
  maxPrice,
  value,
  onChange,
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e) => {
    const newValue = [localValue[0], parseInt(e.target.value, 10)];
    setLocalValue(newValue);
  };

  const handleMouseUp = () => {
    onChange(localValue);
  };

  return (
    <div className="price-range-filter">
      <div className="price-range-header">
        <span>Price Range</span>
        <span className="price-range-value">
          Up to {localValue[1]}
        </span>
      </div>
      <input
        type="range"
        min={minPrice}
        max={maxPrice}
        value={localValue[1]}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="price-range-slider"
      />
      <div className="price-range-labels">
        <span>{minPrice}</span>
        <span>{maxPrice}</span>
      </div>
    </div>
  );
};
