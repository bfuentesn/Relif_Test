// React import not required due to JSX transform; shims provided in react-shim.d.ts

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'default' | 'sidebar';
}

export function Logo({ size = 'medium', showText = true, variant = 'default' }: LogoProps) {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  };

  const imageSizes = {
    small: 55,
    medium: 80,
    large: 120
  };

  const handleImageError = (e: any) => {
    // Fallback a emoji si la imagen no se carga
    e.currentTarget.style.display = 'none';
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div className={`logo-container ${sizeClasses[size]} ${variant === 'sidebar' ? 'logo--sidebar' : ''}`}>
      <img 
        src="/logo-carpe-diem.png" 
        alt="CARpe Diem" 
        className="logo-image"
        width={imageSizes[size]}
        height={imageSizes[size]}
        onError={handleImageError}
      />
      
      {/* Fallback emoji si la imagen no se carga */}
      <div className="logo-fallback" style={{ display: 'none' }}>
        🚗
      </div>
      
      {showText && (
        <div className="logo-text">
          <span className="logo-car">CARpe</span>
          <span className="logo-diem">Diem</span>
        </div>
      )}
    </div>
  );
}
