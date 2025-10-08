import { useState, useEffect } from 'react';
import { ClientWithRelations } from '../types';

interface ClientDetailProps {
  client: ClientWithRelations;
  onClose: () => void;
  onGenerateMessage: (clientId: number) => Promise<string>;
}

export function ClientDetail({ client, onClose, onGenerateMessage }: ClientDetailProps) {
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpiar el mensaje generado cuando cambie el cliente
  useEffect(() => {
    setGeneratedMessage('');
    setError(null);
  }, [client.id]);

  const handleGenerateMessage = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const message = await onGenerateMessage(client.id);
      setGeneratedMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando mensaje');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <div className="client-detail-overlay">
      <div className="client-detail">
        <div className="client-detail-header">
          <h2>� Información Completa del Cliente</h2>
          <button className="btn btn-close-light" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="client-detail-content">
          <div className="client-basic-info">
            <h3>{client.name}</h3>
            <p><strong>RUT:</strong> {client.rut}</p>
            {client.email && <p><strong>📧 Email:</strong> {client.email}</p>}
            {client.phone && <p><strong>📱 Teléfono:</strong> {client.phone}</p>}
          </div>

          <div className="debts-section">
            <h3>💳 Deudas Registradas</h3>
            {client.debts.length > 0 ? (
              <div className="debts-table">
                <table>
                  <thead>
                    <tr>
                      <th>Institución</th>
                      <th>Monto</th>
                      <th>Fecha de Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.debts.map((debt) => (
                      <tr key={debt.id}>
                        <td>{debt.institution}</td>
                        <td>{formatCurrency(debt.amount)}</td>
                        <td>{formatDate(debt.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-debts">Sin deudas registradas</p>
            )}
          </div>

          <div className="messages-section">
            <h3>💬 Historial de Conversaciones</h3>
            {client.messages.length > 0 ? (
              <div className="messages-list">
                {client.messages.map((message) => (
                  <div key={message.id} className={`message ${message.role}`}>
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'client' ? '👤 Cliente' : '🤖 Agente'}
                      </span>
                      <span className="message-time">
                        {formatDateTime(message.sentAt)}
                      </span>
                    </div>
                    <div className="message-content">
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-messages">Sin mensajes registrados</p>
            )}
          </div>

          <div className="ai-section">
            <h3>🤖 Asistente de IA</h3>
            <button 
              className="btn btn-ai"
              onClick={handleGenerateMessage}
              disabled={isGenerating}
            >
              {isGenerating ? '⏳ Generando...' : '✨ Generar Mensaje'}
            </button>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            {generatedMessage && (
              <div className="generated-message">
                <h4>✨ Último mensaje generado:</h4>
                <div className="message-content ai-message">
                  {generatedMessage}
                </div>
                <p className="message-note">
                  ✅ Este mensaje se ha guardado automáticamente. Revisa el historial arriba para verlo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
