import './TouchButton.css';

export const TouchButton = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'default', // small, default, large
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const classes = [
    'touch-button',
    `touch-button-${variant}`,
    `touch-button-${size}`,
    fullWidth && 'touch-button-full',
    disabled && 'touch-button-disabled',
    loading && 'touch-button-loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="touch-button-spinner">
          <svg className="spinner-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" />
          </svg>
        </span>
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="touch-button-icon">{icon}</span>
      )}
      <span className="touch-button-text">{children}</span>
      {icon && iconPosition === 'right' && !loading && (
        <span className="touch-button-icon">{icon}</span>
      )}
    </button>
  );
};

// Icon-only button variant
export const IconButton = ({
  icon,
  size = 'default',
  variant = 'ghost',
  label,
  onClick,
  className = '',
  ...props
}) => {
  const classes = [
    'icon-button',
    `icon-button-${variant}`,
    `icon-button-${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
};
