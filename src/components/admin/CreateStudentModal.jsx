import React, { useState } from 'react';
import { firestoreService } from '../../services/firestoreService';

export function CreateStudentModal({ isOpen, onClose, onSuccess, courses = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    parentEmail: '',
    photoUrl: '',
    selectedCourses: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empieza a escribir
    if (error) {
      setError('');
    }
  };

  const handleCourseToggle = (courseId) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre del estudiante es requerido');
      return false;
    }
    
    if (!formData.parentEmail.trim()) {
      setError('El correo del apoderado es requerido');
      return false;
    }
    
    if (!formData.parentEmail.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const studentData = {
        name: formData.name.trim(),
        parentEmail: formData.parentEmail.trim().toLowerCase(),
        photoUrl: formData.photoUrl.trim() || 'https://via.placeholder.com/150?text=Estudiante',
        courseIds: formData.selectedCourses,
        createdAt: new Date(),
        reconocible: "si"
      };

      await firestoreService.createStudent(studentData);
      
      // Limpiar formulario
      setFormData({
        name: '',
        parentEmail: '',
        photoUrl: '',
        selectedCourses: []
      });
      
      onSuccess && onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      setError('Error al crear el estudiante. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        parentEmail: '',
        photoUrl: '',
        selectedCourses: []
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Registrar Nuevo Estudiante
          </h3>
          <button
            onClick={handleClose}
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
          {/* Error message */}
          {error && (
            <div className="p-3 text-red-500 text-sm bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Nombre del estudiante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo del Estudiante *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="Ej: Juan Pérez García"
              maxLength={100}
            />
          </div>

          {/* Correo del apoderado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico del Apoderado *
            </label>
            <input
              type="email"
              value={formData.parentEmail}
              onChange={(e) => handleInputChange('parentEmail', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="correo@ejemplo.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este correo se usará para asociar al estudiante con su apoderado
            </p>
          </div>

          {/* URL de la foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la Foto del Estudiante (Opcional)
            </label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => handleInputChange('photoUrl', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="https://ejemplo.com/foto-estudiante.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no se proporciona, se usará una imagen placeholder
            </p>
          </div>

          {/* Selección de cursos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cursos a Inscribir (Opcional)
            </label>
            {courses.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                No hay cursos disponibles. Puedes crear cursos desde la pestaña de gestión de cursos.
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={`course-${course.id}`}
                      checked={formData.selectedCourses.includes(course.id)}
                      onChange={() => handleCourseToggle(course.id)}
                      disabled={isLoading}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label
                      htmlFor={`course-${course.id}`}
                      className="ml-3 text-sm text-gray-900 cursor-pointer"
                    >
                      {course.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Seleccionados: {formData.selectedCourses.length} curso(s)
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nombre:</strong> {formData.name || 'Sin especificar'}</p>
              <p><strong>Apoderado:</strong> {formData.parentEmail || 'Sin especificar'}</p>
              <p><strong>Cursos:</strong> {formData.selectedCourses.length} seleccionado(s)</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim() || !formData.parentEmail.trim()}
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
                Creando...
              </>
            ) : (
              'Crear Estudiante'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}