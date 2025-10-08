import { useState, useEffect } from 'react';
import { api } from '../api';
import { AssistantConfig, UpdateAssistantConfig } from '../types/assistant';

/**
 * Componente para configurar el asistente de IA
 * Permite personalizar el tono, idioma, catálogo de vehículos y otras opciones
 */
export function AssistantSettings() {
  // Estados del componente
  const [config, setConfig] = useState<AssistantConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<AssistantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Estados para modales
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [selectedBrandForModel, setSelectedBrandForModel] = useState<string>('');

  /**
   * Carga la configuración actual del asistente desde el servidor
   */
  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.getAssistantConfig();
      
      if (response.success) {
        setConfig(response.data ?? null);
        setOriginalConfig(response.data ?? null);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando configuración');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda las actualizaciones de configuración en el servidor
   */
  const saveConfig = async (updates: UpdateAssistantConfig) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await api.updateAssistantConfig(updates);
      
      if (response.success) {
        setConfig(response.data ?? null);
        setOriginalConfig(response.data ?? null);
        setHasUnsavedChanges(false);
        setSuccess('✅ Configuración guardada exitosamente');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadConfig();
  }, []);

  /**
   * Actualiza un campo específico de la configuración
   */
  const handleInputChange = (field: keyof AssistantConfig, value: any) => {
    setConfig((prev: any) => prev ? { ...prev, [field]: value } : null);
    setHasUnsavedChanges(true);
  };

  /**
   * Guarda todos los cambios realizados
   */
  const handleSave = () => {
    if (config) {
      const updates: UpdateAssistantConfig = {
        name: config.name,
        tone: config.tone,
        language: config.language,
        brands: config.brands,
        models: config.models,
        branches: config.branches,
        messageLength: { ...config.messageLength },
        signature: config.signature,
        useEmojis: config.useEmojis,
        additionalInstructions: config.additionalInstructions || ''
      };
      saveConfig(updates);
    }
  };

  // Handlers para gestionar marcas
  const handleAddBrand = () => {
    setShowAddBrandModal(true);
  };

  const confirmAddBrand = async (brandName: string) => {
    if (brandName && config) {
      const newBrands = [...config.brands, brandName];
      const newConfig = { ...config, brands: newBrands };
      setConfig(newConfig);
      setShowAddBrandModal(false);
      
      // Guardar automáticamente
      await saveConfig({
        ...config,
        brands: newBrands
      });
    }
  };

  const handleRemoveBrand = async (brandToRemove: string) => {
    if (config && window.confirm(`¿Eliminar la marca "${brandToRemove}" y todos sus modelos?`)) {
      const newBrands = config.brands.filter(brand => brand !== brandToRemove);
      const newModels = { ...config.models };
      delete newModels[brandToRemove];
      
      const newConfig = { ...config, brands: newBrands, models: newModels };
      setConfig(newConfig);
      
      // Guardar automáticamente
      await saveConfig({
        ...config,
        brands: newBrands,
        models: newModels
      });
    }
  };

  // Handlers para gestionar modelos
  const handleAddModel = (brand: string) => {
    setSelectedBrandForModel(brand);
    setShowAddModelModal(true);
  };

  const confirmAddModel = async (modelName: string) => {
    if (modelName && config && selectedBrandForModel) {
      const newModels = {
        ...config.models,
        [selectedBrandForModel]: [...(config.models[selectedBrandForModel] || []), modelName]
      };
      
      setConfig({ ...config, models: newModels });
      setShowAddModelModal(false);
      setSelectedBrandForModel('');
      
      // Guardar automáticamente
      await saveConfig({
        ...config,
        models: newModels
      });
    }
  };

  const handleRemoveModel = async (brand: string, modelToRemove: string) => {
    if (config && window.confirm(`¿Eliminar el modelo "${modelToRemove}"?`)) {
      const newModels = {
        ...config.models,
        [brand]: config.models[brand].filter(model => model !== modelToRemove)
      };
      
      setConfig({ ...config, models: newModels });
      
      // Guardar automáticamente
      await saveConfig({
        ...config,
        models: newModels
      });
    }
  };

  // Handlers para gestionar sucursales
  const handleAddBranch = () => {
    setShowAddBranchModal(true);
  };

  const confirmAddBranch = async (branchName: string) => {
    if (branchName && config) {
      const newBranches = [...config.branches, branchName];
      setConfig({ ...config, branches: newBranches });
      setShowAddBranchModal(false);
      
      // Guardar automáticamente
      await saveConfig({
        ...config,
        branches: newBranches
      });
    }
  };

  const handleRemoveBranch = async (branchToRemove: string) => {
    if (config && window.confirm(`¿Eliminar la sucursal "${branchToRemove}"?`)) {
      const newBranches = config.branches.filter(branch => branch !== branchToRemove);
      setConfig({ ...config, branches: newBranches });
      
      // Guardar automáticamente
      await saveConfig({
        ...config,
        branches: newBranches
      });
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando configuración...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="error">
        <h2>❌ Error</h2>
        <p>No se pudo cargar la configuración</p>
      </div>
    );
  }

  return (
    <div className="assistant-settings">
      <div className="settings-header">
        <h1>⚙️ Configuración del Asistente</h1>
        <p>Estas opciones ajustan el prompt que usa la IA al generar mensajes de seguimiento.</p>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          ✅ {success}
        </div>
      )}

      <div className="settings-form">
        <div className="form-section">
          <h3>👤 Identidad del Asistente</h3>
          
          <div className="form-group">
            <label htmlFor="name">Nombre del Asistente</label>
            <input
              type="text"
              id="name"
              value={config.name}
              onChange={(e: any) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Carla"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signature">Firma</label>
            <input
              type="text"
              id="signature"
              value={config.signature}
              onChange={(e: any) => handleInputChange('signature', e.target.value)}
              placeholder="Ej: Carla — Automotora"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tone">Tono de Voz</label>
            <select
              id="tone"
              value={config.tone}
              onChange={(e: any) => handleInputChange('tone', e.target.value)}
            >
              <option value="profesional">Profesional</option>
              <option value="cercano">Cercano</option>
              <option value="formal">Formal</option>
              <option value="amigable">Amigable</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language">Idioma</label>
            <select
              id="language"
              value={config.language}
              onChange={(e: any) => handleInputChange('language', e.target.value)}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>🚗 Marcas y Modelos</h3>
          
          <div className="brands-section">
            <div className="section-header">
              <h4>Marcas Disponibles</h4>
              <button className="btn btn-secondary" onClick={handleAddBrand}>
                ➕ Agregar Marca
              </button>
            </div>
            
            <div className="brands-list">
              {config.brands.map((brand) => (
                <div key={brand} className="brand-item">
                  <div className="brand-header">
                    <h5>{brand}</h5>
                    <button 
                      className="btn btn-danger-small"
                      onClick={() => handleRemoveBrand(brand)}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="models-section">
                    <div className="models-header">
                      <span>Modelos:</span>
                      <button 
                        className="btn btn-secondary-small"
                        onClick={() => handleAddModel(brand)}
                      >
                        ➕ Modelo
                      </button>
                    </div>
                    
                    <div className="models-list">
                      {config.models[brand]?.map((model) => (
                        <span key={model} className="model-tag">
                          {model}
                          <button 
                            className="remove-model"
                            onClick={() => handleRemoveModel(brand, model)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>🏢 Sucursales</h3>
          
          <div className="branches-section">
            <div className="section-header">
              <h4>Sucursales Disponibles</h4>
              <button className="btn btn-secondary" onClick={handleAddBranch}>
                ➕ Agregar Sucursal
              </button>
            </div>
            
            <div className="branches-list">
              {config.branches.map((branch) => (
                <div key={branch} className="branch-item">
                  <span>{branch}</span>
                  <button 
                    className="btn btn-danger-small"
                    onClick={() => handleRemoveBranch(branch)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📝 Configuración de Mensajes</h3>
          
          <div className="message-length">
            <div className="form-group">
              <label htmlFor="minLength">Longitud Mínima (palabras)</label>
              <input
                type="number"
                id="minLength"
                value={config.messageLength.min}
                onChange={(e: any) => handleInputChange('messageLength', {
                  ...config.messageLength,
                  min: parseInt(e.target.value)
                })}
                min="50"
                max="500"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxLength">Longitud Máxima (palabras)</label>
              <input
                type="number"
                id="maxLength"
                value={config.messageLength.max}
                onChange={(e: any) => handleInputChange('messageLength', {
                  ...config.messageLength,
                  max: parseInt(e.target.value)
                })}
                min="100"
                max="500"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="useEmojis">Usar Emojis</label>
            <select
              id="useEmojis"
              value={config.useEmojis ? 'true' : 'false'}
              onChange={(e: any) => handleInputChange('useEmojis', e.target.value === 'true')}
            >
              <option value="true">Sí, permitir emojis</option>
              <option value="false">No, sin emojis</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="additionalInstructions">Instrucciones Adicionales</label>
            <textarea
              id="additionalInstructions"
              value={config.additionalInstructions || ''}
              onChange={(e: any) => handleInputChange('additionalInstructions', e.target.value)}
              placeholder="Ej: Prioriza modelos híbridos cuando el cliente mencione eficiencia."
              rows={4}
            />
            <small style={{ color: 'var(--text-light)' }}>
              Se incluirán como guía adicional en el System Prompt del backend.
            </small>
          </div>
        </div>

      </div>

      {/* Footer sticky con acciones */}
      {hasUnsavedChanges && (
        <div className="settings-footer">
          <div className="footer-content">
            <div className="footer-info">
              <span className="unsaved-indicator">⚠️ Cambios sin guardar</span>
              <span className="footer-description">
                Guarda los cambios para aplicar la nueva configuración
              </span>
            </div>
            <div className="footer-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  if (window.confirm('¿Descartar los cambios realizados?')) {
                    setConfig(originalConfig);
                    setHasUnsavedChanges(false);
                  }
                }}
                disabled={saving}
              >
                Descartar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar marca */}
      <AddItemModal
        isOpen={showAddBrandModal}
        title="Agregar Nueva Marca"
        placeholder="Ej: Toyota"
        onConfirm={confirmAddBrand}
        onClose={() => setShowAddBrandModal(false)}
      />

      {/* Modal para agregar modelo */}
      <AddItemModal
        isOpen={showAddModelModal}
        title={`Agregar Modelo para ${selectedBrandForModel}`}
        placeholder="Ej: Corolla"
        onConfirm={confirmAddModel}
        onClose={() => {
          setShowAddModelModal(false);
          setSelectedBrandForModel('');
        }}
      />

      {/* Modal para agregar sucursal */}
      <AddItemModal
        isOpen={showAddBranchModal}
        title="Agregar Nueva Sucursal"
        placeholder="Ej: Santiago Centro"
        onConfirm={confirmAddBranch}
        onClose={() => setShowAddBranchModal(false)}
      />
    </div>
  );
}

/**
 * Modal reutilizable para agregar items (marcas, modelos, sucursales)
 */
interface AddItemModalProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

function AddItemModal({ isOpen, title, placeholder, onConfirm, onClose }: AddItemModalProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  const handleClose = () => {
    setValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-small">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-secondary" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="itemName">Nombre</label>
            <input
              type="text"
              id="itemName"
              value={value}
              onChange={(e: any) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              required
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!value.trim()}
            >
              ➕ Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
