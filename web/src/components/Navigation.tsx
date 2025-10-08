import { Logo } from './Logo';

interface NavigationProps {
  activeView: 'dashboard' | 'clients' | 'settings';
  onViewChange: (view: 'dashboard' | 'clients' | 'settings') => void;
}

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <Logo size="medium" showText={true} variant="sidebar" />
      </div>
      
      <div className="nav-menu">
        <button 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-item ${activeView === 'clients' ? 'active' : ''}`}
          onClick={() => onViewChange('clients')}
        >
          👥 Clientes
        </button>
        <button 
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => onViewChange('settings')}
        >
          ⚙️ Configuración
        </button>
      </div>
    </nav>
  );
}
