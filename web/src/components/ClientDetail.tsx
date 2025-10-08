/**
 * Componente ClientDetail
 * Muestra información detallada de un cliente con sus mensajes, deudas y generación de IA
 */
import { useState, useEffect } from 'react';
import { ClientWithRelations } from '../types';
import { formatCurrency, formatDate, getTimeAgo, isOverdue } from '../utils/formatters';

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

  return (
    <div className="client-detail-overlay">
      <div className="client-detail">
        <div className="client-detail-header">
          <h2>👤 Información Completa del Cliente</h2>
          <button className="btn btn-close-light" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="client-detail-content">
          {/* Información Básica */}
          <div className="client-basic-info">
            <h3>{client.name}</h3>
            <p><strong>RUT:</strong> {client.rut}</p>
            {client.email && <p><strong>📧 Email:</strong> {client.email}</p>}
            {client.phone && <p><strong>📱 Teléfono:</strong> {client.phone}</p>}
            <p><strong>📅 Cliente desde:</strong> {formatDate(client.createdAt)}</p>
          </div>

          {/* Deudas */}
          <div className="debts-section">
            <h3>💳 Deudas Registradas</h3>
            {client.debts && client.debts.length > 0 ? (
              <div className="debts-table">
                <table>
                  <thead>
                    <tr>
                      <th>Institución</th>
                      <th>Monto</th>
                      <th>Vencimiento</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.debts.map((debt) => (
                      <tr key={debt.id}>
                        <td>{debt.institution}</td>
                        <td>{formatCurrency(debt.amount)}</td>
                        <td>{formatDate(debt.dueDate)}</td>
                        <td>
                          <span className={`status-badge ${isOverdue(debt.dueDate) ? 'danger' : 'active'}`}>
                            {isOverdue(debt.dueDate) ? '⚠️ Vencida' : '✅ Vigente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-debts">
                <p>✅ El cliente no tiene deudas registradas</p>
                <p><em>¡Candidato ideal para financiamiento!</em></p>
              </div>
            )}
          </div>

          {/* Mensajes */}
          <div className="messages-section">
            <h3>💬 Historial de Mensajes</h3>
            {client.messages && client.messages.length > 0 ? (
              <div className="messages-list">
                {client.messages.map((message) => (
                  <div key={message.id} className={`message ${message.role}`}>
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'client' ? '👤 Cliente' : '🤖 Agente'}
                      </span>
                      <span className="message-time">
                        {getTimeAgo(message.sentAt)}
                      </span>
                    </div>
                    <div className="message-content">
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-messages">
                <p>📝 No hay mensajes registrados</p>
                <p><em>¡Perfecto para iniciar un seguimiento!</em></p>
              </div>
            )}
          </div>

          {/* Sección de IA */}
          <div className="ai-section">
            <h3>🤖 Asistente de IA</h3>
            <p>Genera un mensaje personalizado de seguimiento para este cliente</p>
            
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
                <h4>📝 Mensaje Generado:</h4>
                <div className="ai-message">
                  {generatedMessage}
                </div>
                <div className="message-note">
                  <em>💡 Mensaje personalizado basado en el perfil y contexto del cliente</em>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
