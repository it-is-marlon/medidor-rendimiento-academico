import React, { useState } from 'react';

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Eliminar Registro",
  message = "¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.",
  record = null,
  isLoading = false 
}) {
  const [confirmText, setConfirmText] = useState('');

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

  const handleConfirm = () => {
    onConfirm();
    setConfirmText('');
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center p-6">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {message}
            </p>
          </div>

          {/* Información del registro a eliminar */}
          {record && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-900 mb-2">Registro a eliminar:</h4>
              <div className="text-sm text-red-800 space-y-1">
                <p><strong>Tipo:</strong> {getRecordTypeLabel(record.type)}</p>
                <p><strong>Evaluación:</strong> {getValueLabel(record.value)} ({record.value}/5)</p>
                <p><strong>Fecha:</strong> {record.timestamp?.toDate?.()?.toLocaleString() || 'No disponible'}</p>
                {record.note && (
                  <p><strong>Nota:</strong> {record.note}</p>
                )}
              </div>
            </div>
          )}

          {/* Campo de confirmación */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar, escribe <span className="font-mono bg-gray-100 px-1 rounded">ELIMINAR</span>:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="Escribe ELIMINAR para confirmar"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> Esta acción eliminará permanentemente el registro de la base de datos. 
                  No podrá recuperarse una vez eliminado.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || confirmText !== 'ELIMINAR'}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Eliminando...
                </>
              ) : (
                'Eliminar Definitivamente'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}