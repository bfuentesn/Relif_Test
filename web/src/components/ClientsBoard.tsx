import { useState } from 'react';
import { Client } from '../types';
import { ClientCard } from './ClientCard';
import { ClientDetail } from './ClientDetail';
import { useClients, useClient } from '../hooks/useClients';

export function ClientsBoard() {
  const { clients, clientsToFollowUp, loading, error, generateMessage } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const { client: selectedClient } = useClient(selectedClientId);

  const handleViewDetail = (clientId: number) => {
    setSelectedClientId(clientId);
  };

  const handleCloseDetail = () => {
    setSelectedClientId(null);
  };

  const handleGenerateMessage = async (clientId: number): Promise<string> => {
    return await generateMessage(clientId);
  };

  // Filtrar clientes activos (excluir los que están en seguimiento)
  const activeClients = clients.filter((client: Client) => !clientsToFollowUp.some((followUpClient: Client) => followUpClient.id === client.id));

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="clients-board">
      <div className="board-header">
        <h1>🚗 Automotora CRM</h1>
        <p>Gestiona tus clientes y genera mensajes de seguimiento</p>
      </div>

      <div className="board-content">
        <div className="clients-column">
          <h2 className="column-title follow-up">
            📋 Requieren Seguimiento ({clientsToFollowUp.length})
          </h2>
          <div className="clients-list">
            {clientsToFollowUp.length > 0 ? (
              clientsToFollowUp.map((client: Client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onViewDetail={handleViewDetail}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>✅ Todos los clientes están al día</p>
              </div>
            )}
          </div>
        </div>

        <div className="clients-column">
          <h2 className="column-title active">
            👥 Clientes Activos ({activeClients.length})
          </h2>
          <div className="clients-list">
            {activeClients.length > 0 ? (
              activeClients.map((client: Client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onViewDetail={handleViewDetail}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No hay clientes activos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={handleCloseDetail}
          onGenerateMessage={handleGenerateMessage}
        />
      )}
    </div>
  );
}
