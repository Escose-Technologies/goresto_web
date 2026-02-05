export const Logo = ({ size = 'medium', showText = false, variant = 'default' }) => {
  const sizes = {
    small: { height: 60 },
    medium: { height: 80 },
    large: { height: 100 },
    xlarge: { height: 140 },
    hero: { height: 200 },
  };

  const { height } = sizes[size] || sizes.medium;

  return (
    <img
      src="/logo.png"
      alt="GoResto"
      style={{
        height: `${height}px`,
        width: 'auto',
        objectFit: 'contain',
      }}
    />
  );
};

// Icon-only version (just the logo without extra styling)
export const LogoIcon = ({ size = 60 }) => {
  return (
    <img
      src="/logo.png"
      alt="GoResto"
      style={{
        height: `${size}px`,
        width: 'auto',
        objectFit: 'contain',
      }}
    />
  );
};

export default Logo;
