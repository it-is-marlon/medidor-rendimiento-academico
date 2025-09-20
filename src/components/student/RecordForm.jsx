import React, { useState } from 'react';

export function RecordForm({ 
  onSubmit, 
  selectedStudents = [], 
  isSubmitting = false, 
  showBulkMode = true 
}) {
  const [recordType, setRecordType] = useState('participacion');
  const [recordValue, setRecordValue] = useState(3);
  const [recordNote, setRecordNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recordData = {
      type: recordType,
      value: recordValue,
      note: recordNote.trim()
    };
    
    onSubmit(recordData);
    
    // Limpiar solo la nota después del envío
    setRecordNote('');
  };

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

  const getValueColor = (value) => {
    const colors = {
      1: 'text-red-600',
      2: 'text-orange-600',
      3: 'text-yellow-600',
      4: 'text-blue-600',
      5: 'text-green-600'
    };
    return colors[value] || 'text-gray-600';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Nuevo Registro de Rendimiento
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Completa la información para registrar el rendimiento de los estudiantes seleccionados.
        </p>
      </div>

      {/* Tipo de Registro */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Registro
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['participacion', 'comportamiento', 'puntualidad'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setRecordType(type)}
              className={`relative p-4 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                recordType === type
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {/* Iconos para cada tipo */}
                {type === 'participacion' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7m5 5.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                )}
                {type === 'comportamiento' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                {type === 'puntualidad' && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{getRecordTypeLabel(type)}</span>
              </div>
              {recordType === type && (
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Valor del Registro */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Evaluación: <span className={`font-semibold ${getValueColor(recordValue)}`}>
            {getValueLabel(recordValue)}
          </span>
        </label>
        
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="1"
            max="5"
            value={recordValue}
            onChange={(e) => setRecordValue(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, 
                #ef4444 0%, #ef4444 20%, 
                #f97316 20%, #f97316 40%, 
                #eab308 40%, #eab308 60%, 
                #3b82f6 60%, #3b82f6 80%, 
                #10b981 80%, #10b981 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
            <span className="text-red-600">1</span>
            <span className="text-orange-600">2</span>
            <span className="text-yellow-600">3</span>
            <span className="text-blue-600">4</span>
            <span className="text-green-600">5</span>
          </div>
        </div>

        {/* Descripción del valor actual */}
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <p className={`text-sm font-medium ${getValueColor(recordValue)}`}>
            {recordValue === 1 && "El estudiante necesita apoyo adicional para alcanzar los objetivos."}
            {recordValue === 2 && "El estudiante está en proceso de desarrollo, mostrando progreso gradual."}
            {recordValue === 3 && "El estudiante cumple satisfactoriamente con las expectativas."}
            {recordValue === 4 && "El estudiante demuestra un rendimiento destacado y sobresaliente."}
            {recordValue === 5 && "El estudiante alcanza un nivel excelente, superando las expectativas."}
          </p>
        </div>
      </div>

      {/* Nota Personalizada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones Específicas
          <span className="text-gray-400 font-normal ml-1">(Opcional)</span>
        </label>
        <textarea
          value={recordNote}
          onChange={(e) => setRecordNote(e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          placeholder="Escribe observaciones específicas sobre el desempeño del estudiante..."
          maxLength="500"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Máximo 500 caracteres
          </p>
          <p className="text-xs text-gray-400">
            {recordNote.length}/500
          </p>
        </div>
      </div>

      {/* Resumen de Selección */}
      {showBulkMode && selectedStudents.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-indigo-900 mb-2">
            Resumen del Registro
          </h4>
          <div className="space-y-1 text-sm text-indigo-700">
            <p><strong>Estudiantes seleccionados:</strong> {selectedStudents.length}</p>
            <p><strong>Tipo de registro:</strong> {getRecordTypeLabel(recordType)}</p>
            <p><strong>Evaluación:</strong> {getValueLabel(recordValue)}</p>
            {recordNote.trim() && (
              <p><strong>Observación:</strong> {recordNote.trim().substring(0, 50)}{recordNote.length > 50 ? '...' : ''}</p>
            )}
          </div>
        </div>
      )}

      {/* Botón de Envío */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={(!showBulkMode || selectedStudents.length === 0) || isSubmitting}
          className={`w-full flex justify-center items-center px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
            (!showBulkMode || selectedStudents.length === 0) || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando registro...
            </>
          ) : showBulkMode ? (
            `Registrar para ${selectedStudents.length} estudiante${selectedStudents.length !== 1 ? 's' : ''}`
          ) : (
            'Registrar Datos'
          )}
        </button>
      </div>
    </form>
  );
}