import React, { useState, useEffect } from 'react';

export function EditRecordModal({ 
  isOpen, 
  onClose, 
  record, 
  onSave, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    type: '',
    value: 3,
    note: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setFormData({
        type: record.type || '',
        value: record.value || 3,
        note: record.note || ''
      });
    }
  }, [record]);

  const getRecordTypeLabel = (type) => {
    const labels = {
      'participacion': 'Participación',
      'comportamiento': 'Comportamiento',
      'puntualidad': 'Puntualidad'
    };
    return labels[type] || type;
  };

  const getValueLabel = (value) => {
    const labels = {
      1: 'Necesita apoyo',
      2: 'En desarrollo',
      3: 'Satisfactorio',
      4: 'Destacado',
      5: 'Excelente'
    };
    return labels[value] || value;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'El tipo de registro es requerido';
    }

    if (!formData.value || formData.value < 1 || formData.value > 5) {
      newErrors.value = 'El valor debe estar entre 1 y 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(record.id, formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar el registro:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Registro de Rendimiento
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Información del registro */}
          {record && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Información del Registro</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Fecha:</span>
                  <br />
                  {record.timestamp?.toDate?.()?.toLocaleString() || 'No disponible'}
                </div>
                <div>
                  <span className="font-medium">ID:</span>
                  <br />
                  <span className="font-mono text-xs break-all">{record.id}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tipo de Registro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Registro *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['participacion', 'comportamiento', 'puntualidad'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('type', type)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 ${
                    formData.type === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getRecordTypeLabel(type)}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {/* Valor del Registro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evaluación: {getValueLabel(formData.value)} *
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.value}
              onChange={(e) => handleInputChange('value', parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Necesita apoyo</span>
              <span>En desarrollo</span>
              <span>Satisfactorio</span>
              <span>Destacado</span>
              <span>Excelente</span>
            </div>
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value}</p>
            )}
          </div>

          {/* Nota Personalizada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota Personalizada
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              disabled={isLoading}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="Escribe una observación específica..."
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.note.length}/500 caracteres
            </div>
          </div>

          {/* Resumen de cambios */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen de Cambios</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Tipo:</strong> {getRecordTypeLabel(formData.type)}</p>
              <p><strong>Evaluación:</strong> {getValueLabel(formData.value)} ({formData.value}/5)</p>
              <p><strong>Nota:</strong> {formData.note || 'Sin nota'}</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}