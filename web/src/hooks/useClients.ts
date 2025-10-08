import { useState, useEffect } from 'react';
import { api } from '../api';
import { Client, ClientWithRelations } from '../types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsToFollowUp, setClientsToFollowUp] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [clientsResponse, followUpResponse] = await Promise.all([
        api.getClients(),
        api.getClientsToDoFollowUp()
      ]);

      if (clientsResponse.success) {
        setClients((clientsResponse.data || []) as Client[]);
      }

      if (followUpResponse.success) {
        setClientsToFollowUp((followUpResponse.data || []) as Client[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando clientes');
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = async (clientId: number): Promise<string> => {
    try {
      const response = await api.generateMessage(clientId);
      if (response.success && response.data) {
        // Refrescar la lista para mover el cliente de seguimiento a activos
        await fetchClients();
        return response.data.message;
      }
      throw new Error('No se pudo generar el mensaje');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error generando mensaje');
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    clientsToFollowUp,
    loading,
    error,
    refetch: fetchClients,
    generateMessage,
  };
}

export function useClient(clientId: number | null) {
  const [client, setClient] = useState<ClientWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getClient(id);
      if (response.success && response.data) {
        setClient(response.data);
      } else {
        setError('Cliente no encontrado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClient(clientId);
    } else {
      setClient(null);
    }
  }, [clientId]);

  return {
    client,
    loading,
    error,
    refetch: clientId ? () => fetchClient(clientId) : () => {},
  };
}
