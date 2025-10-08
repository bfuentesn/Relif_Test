import { useState } from 'react';
import { useClients, useClient } from '../hooks/useClients';
import { ClientDetail } from './ClientDetail';
import { CreateClientModal } from './CreateClientModal';
import { api } from '../api';
import type { CreateClientData, Client } from '../types';

export function ClientsView() {
  const { clients, clientsToFollowUp, loading, error, refetch, generateMessage } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { client: selectedClient, refetch: refetchClient } = useClient(selectedClientId);

  const handleViewDetail = (clientId: number) => {
    setSelectedClientId(clientId);
  };

  const handleCloseDetail = () => {
    setSelectedClientId(null);
  };

  const handleGenerateMessage = async (clientId: number): Promise<string> => {
    const message = await generateMessage(clientId);
    // Refrescar el cliente actual en el modal para mostrar el nuevo mensaje
    await refetchClient();
    return message;
  };

  const handleCreateClient = async (clientData: CreateClientData) => {
    setCreateLoading(true);
    try {
      await api.createClient(clientData);
      await refetch();
    } finally {
      setCreateLoading(false);
    }
  };

  // Filtrar clientes activos
  const activeClients = clients.filter((client: Client) => !clientsToFollowUp.some((followUpClient: Client) => followUpClient.id === client.id));

  // Ordenar: primero los que requieren seguimiento, luego los activos
  const sortedClients = [
    ...clientsToFollowUp.map((client: Client) => ({ ...client, status: 'follow-up' as const })),
    ...activeClients.map((client: Client) => ({ ...client, status: 'active' as const }))
  ];

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
    <div className="clients-view">
      <div className="clients-header">
        <div className="header-info">
          <h1>👥 Gestión de Clientes</h1>
          <p>
            {clientsToFollowUp.length} requieren seguimiento • {activeClients.length} activos
          </p>
        </div>
        <button 
          className="btn btn-primary create-client-btn"
          onClick={() => setShowCreateModal(true)}
          disabled={createLoading}
        >
          ➕ Nuevo Cliente
        </button>
      </div>

      <div className="clients-filters">
        <div className="filter-summary">
          <span className="filter-item follow-up">
            📋 {clientsToFollowUp.length} Requieren Seguimiento
          </span>
          <span className="filter-item active">
            ✅ {activeClients.length} Clientes Activos
          </span>
        </div>
      </div>

      <div className="clients-table-container">
        {sortedClients.length > 0 ? (
          <table className="clients-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cliente</th>
                <th>RUT</th>
                <th>Ver Detalles</th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((client) => (
                <tr 
                  key={client.id} 
                  className={`client-row ${client.status}`}
                  onClick={() => handleViewDetail(client.id)}
                >
                  <td>
                    <span className={`status-badge ${client.status}`}>
                      {client.status === 'follow-up' ? '📋 Seguimiento' : '✅ Activo'}
                    </span>
                  </td>
                  <td className="client-name">{client.name}</td>
                  <td className="client-rut">{client.rut}</td>
                  <td className="client-actions">
                    <button 
                      className="btn btn-details"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleViewDetail(client.id);
                      }}
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay clientes registrados</h3>
            <p>Comienza creando tu primer cliente</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              disabled={createLoading}
            >
              ➕ Crear Primer Cliente
            </button>
          </div>
        )}
      </div>

      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={handleCloseDetail}
          onGenerateMessage={handleGenerateMessage}
        />
      )}

      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateClient={handleCreateClient}
      />
    </div>
  );
}
