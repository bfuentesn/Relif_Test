import { useClients } from '../hooks/useClients';
import type { Client } from '../types';

export function Dashboard() {
  const { clients, clientsToFollowUp, loading, error } = useClients();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
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

  const activeClients = clients.filter((client: Client) => !clientsToFollowUp.some((followUpClient: Client) => followUpClient.id === client.id));

  const totalClients = clients.length;
  const followUpClients = clientsToFollowUp.length;
  const activeClientsCount = activeClients.length;

  const followUpPercentage = totalClients > 0 ? Math.round((followUpClients / totalClients) * 100) : 0;
  const activePercentage = totalClients > 0 ? Math.round((activeClientsCount / totalClients) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Resumen general de tu CRM automotriz</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Clientes</h3>
            <div className="stat-number">{totalClients}</div>
            <div className="stat-description">Clientes registrados</div>
          </div>
        </div>

        <div className="stat-card follow-up">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Requieren Seguimiento</h3>
            <div className="stat-number">{followUpClients}</div>
            <div className="stat-description">
              {followUpPercentage}% del total
            </div>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Clientes Activos</h3>
            <div className="stat-number">{activeClientsCount}</div>
            <div className="stat-description">
              {activePercentage}% del total
            </div>
          </div>
        </div>

        <div className="stat-card efficiency">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Eficiencia</h3>
            <div className="stat-number">
              {totalClients > 0 ? Math.round((activeClientsCount / totalClients) * 100) : 0}%
            </div>
            <div className="stat-description">
              Clientes al día
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Distribución de Clientes</h3>
          <div className="chart-container">
            <div className="chart-bar">
              <div className="chart-label">Activos</div>
              <div className="chart-progress">
                <div 
                  className="chart-fill active" 
                  style={{ width: `${activePercentage}%` }}
                ></div>
              </div>
              <div className="chart-percentage">{activePercentage}%</div>
            </div>
            <div className="chart-bar">
              <div className="chart-label">Seguimiento</div>
              <div className="chart-progress">
                <div 
                  className="chart-fill follow-up" 
                  style={{ width: `${followUpPercentage}%` }}
                ></div>
              </div>
              <div className="chart-percentage">{followUpPercentage}%</div>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Actividad Reciente</h3>
          <div className="activity-list">
            {followUpClients > 0 ? (
              <div className="activity-item warning">
                <div className="activity-icon">⚠️</div>
                <div className="activity-content">
                  <div className="activity-title">
                    {followUpClients} clientes requieren seguimiento
                  </div>
                  <div className="activity-description">
                    Última actividad hace más de 7 días
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
