import { Client } from '../types';

interface ClientCardNewProps {
  client: Client;
  status: 'follow-up' | 'active';
  onViewDetail: (clientId: number) => void;
}

export function ClientCardNew({ client, status, onViewDetail }: ClientCardNewProps) {
  return (
    <div className={`client-card-new ${status}`}>
      <div className="client-status-tag">
        {status === 'follow-up' ? (
          <span className="tag follow-up">📋 Seguimiento</span>
        ) : (
          <span className="tag active">✅ Activo</span>
        )}
      </div>
      
      <div className="client-info">
        <h3 className="client-name">{client.name}</h3>
        <p className="client-rut">RUT: {client.rut}</p>
        {client.email && <p className="client-email">📧 {client.email}</p>}
        {client.phone && <p className="client-phone">📞 {client.phone}</p>}
      </div>
      
      <div className="client-actions">
        <button 
          className="btn btn-primary"
          onClick={() => onViewDetail(client.id)}
        >
          Ver detalle
        </button>
      </div>
    </div>
  );
}
