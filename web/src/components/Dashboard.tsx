/**
 * Componente Dashboard
 * Muestra estadísticas generales y resumen del CRM
 */
import { useClients } from '../hooks/useClients';
import type { Client } from '../types';

/**
 * Interface para estadísticas calculadas
 */
interface DashboardStats {
  total: number;
  followUp: number;
  active: number;
  followUpPercentage: number;
  activePercentage: number;
  efficiency: number;
}

/**
 * Calcula las estadísticas del dashboard
 */
const calculateStats = (clients: Client[], clientsToFollowUp: Client[]): DashboardStats => {
  const total = clients.length;
  const followUp = clientsToFollowUp.length;
  const active = total - followUp;
  
  const followUpPercentage = total > 0 ? Math.round((followUp / total) * 100) : 0;
  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
  const efficiency = activePercentage;

  return {
    total,
    followUp,
    active,
    followUpPercentage,
    activePercentage,
    efficiency
  };
};

/**
 * Componente para mostrar una tarjeta de estadística
 */
interface StatCardProps {
  icon: string;
  title: string;
  value: number | string;
  description: string;
  type: 'total' | 'follow-up' | 'active' | 'efficiency';
}

const StatCard = ({ icon, title, value, description, type }: StatCardProps) => (
  <div className={`stat-card ${type}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <div className="stat-number">{value}</div>
      <div className="stat-description">{description}</div>
    </div>
  </div>
);

/**
 * Componente para mostrar una barra de progreso en el gráfico
 */
interface ChartBarProps {
  label: string;
  percentage: number;
  type: 'active' | 'follow-up';
}

const ChartBar = ({ label, percentage, type }: ChartBarProps) => (
  <div className="chart-bar">
    <div className="chart-label">{label}</div>
    <div className="chart-progress">
      <div 
        className={`chart-fill ${type}`} 
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${percentage}%`}
      />
    </div>
    <div className="chart-percentage">{percentage}%</div>
  </div>
);

/**
 * Componente para mostrar actividad reciente
 */
interface ActivityItemProps {
  hasClientsToFollowUp: boolean;
  followUpCount: number;
}

const ActivityItem = ({ hasClientsToFollowUp, followUpCount }: ActivityItemProps) => {
  if (hasClientsToFollowUp) {
    return (
      <div className="activity-item warning">
        <div className="activity-icon">⚠️</div>
        <div className="activity-content">
          <div className="activity-title">
            {followUpCount} {followUpCount === 1 ? 'cliente requiere' : 'clientes requieren'} seguimiento
          </div>
          <div className="activity-description">
            Última actividad hace más de 7 días
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-item success">
      <div className="activity-icon">✅</div>
      <div className="activity-content">
        <div className="activity-title">
          Todos los clientes están al día
        </div>
        <div className="activity-description">
          ¡Excelente gestión del CRM!
        </div>
      </div>
    </div>
  );
};

/**
 * Componente principal del Dashboard
 */
export const Dashboard = () => {
  const { clients, clientsToFollowUp, loading, error } = useClients();

  // Estados de carga y error
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>❌ Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Calcular estadísticas
  const stats = calculateStats(clients, clientsToFollowUp);

  return (
    <div className="dashboard">
      {/* Header del Dashboard */}
      <header className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Resumen general de tu CRM automotriz</p>
      </header>

      {/* Tarjetas de Estadísticas */}
      <section className="stats-grid" aria-label="Estadísticas generales">
        <StatCard
          icon="👥"
          title="Total Clientes"
          value={stats.total}
          description="Clientes registrados"
          type="total"
        />
        
        <StatCard
          icon="📋"
          title="Requieren Seguimiento"
          value={stats.followUp}
          description={`${stats.followUpPercentage}% del total`}
          type="follow-up"
        />
        
        <StatCard
          icon="✅"
          title="Clientes Activos"
          value={stats.active}
          description={`${stats.activePercentage}% del total`}
          type="active"
        />
        
        <StatCard
          icon="📈"
          title="Eficiencia"
          value={`${stats.efficiency}%`}
          description="Clientes al día"
          type="efficiency"
        />
      </section>

      {/* Gráficos y Actividad */}
      <section className="dashboard-charts">
        {/* Distribución de Clientes */}
        <div className="chart-card">
          <h3>Distribución de Clientes</h3>
          <div className="chart-container" role="img" aria-label="Gráfico de distribución de clientes">
            <ChartBar
              label="Activos"
              percentage={stats.activePercentage}
              type="active"
            />
            <ChartBar
              label="Seguimiento"
              percentage={stats.followUpPercentage}
              type="follow-up"
            />
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="recent-activity">
          <h3>Actividad Reciente</h3>
          <div className="activity-list">
            <ActivityItem
              hasClientsToFollowUp={stats.followUp > 0}
              followUpCount={stats.followUp}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
