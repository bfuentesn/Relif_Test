import { useState } from 'react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClient: (clientData: any) => Promise<void>;
}

export function CreateClientModal({ isOpen, onClose, onCreateClient }: CreateClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    email: '',
    phone: '',
    initialMessage: '',
    debtInstitution: '',
    debtAmount: '',
    debtDueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Preparar deudas si hay datos
      const debts = [];
      if (formData.debtInstitution && formData.debtAmount && formData.debtDueDate) {
        debts.push({
          institution: formData.debtInstitution,
          amount: parseFloat(formData.debtAmount),
          dueDate: new Date(formData.debtDueDate).toISOString()
        });
      }

      const clientData = {
        name: formData.name,
        rut: formData.rut,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        messages: formData.initialMessage ? [{
          text: formData.initialMessage,
          role: 'client' as const
        }] : [],
        debts: debts
      };

      await onCreateClient(clientData);
      
      // Reset form
      setFormData({
        name: '',
        rut: '',
        email: '',
        phone: '',
        initialMessage: '',
        debtInstitution: '',
        debtAmount: '',
        debtDueDate: ''
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>➕ Crear Nuevo Cliente</h2>
          <button className="btn btn-secondary" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rut">RUT *</label>
            <input
              type="text"
              id="rut"
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              required
              placeholder="Ej: 12345678-9"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: juan@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: +56912345678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="initialMessage">Mensaje inicial (opcional)</label>
            <textarea
              id="initialMessage"
              name="initialMessage"
              value={formData.initialMessage}
              onChange={handleChange}
              placeholder="Primer mensaje del cliente..."
              rows={3}
            />
          </div>

          <div className="form-section">
            <h3>💳 Información de Deuda (opcional)</h3>
            
            <div className="form-group">
              <label htmlFor="debtInstitution">Institución</label>
              <input
                type="text"
                id="debtInstitution"
                name="debtInstitution"
                value={formData.debtInstitution}
                onChange={handleChange}
                placeholder="Ej: Banco Estado"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="debtAmount">Monto</label>
                <input
                  type="number"
                  id="debtAmount"
                  name="debtAmount"
                  value={formData.debtAmount}
                  onChange={handleChange}
                  placeholder="Ej: 1500000"
                  min="0"
                  step="1000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="debtDueDate">Fecha de Vencimiento</label>
                <input
                  type="date"
                  id="debtDueDate"
                  name="debtDueDate"
                  value={formData.debtDueDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
