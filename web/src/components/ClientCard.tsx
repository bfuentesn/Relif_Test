import React from 'react';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onViewDetail: (clientId: number) => void;
}

export function ClientCard({ client, onViewDetail }: ClientCardProps) {
  return (
    <div className="client-card">
      <div className="client-info">
        <h3 className="client-name">{client.name}</h3>
        <p className="client-rut">RUT: {client.rut}</p>
      </div>
      <button 
        className="btn btn-primary"
        onClick={() => onViewDetail(client.id)}
      >
        Ver detalle
      </button>
    </div>
  );
}
