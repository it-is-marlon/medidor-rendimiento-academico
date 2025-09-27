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
    <div>
      <div>
        {/* Header */}
        <div>
          <h3>Registrar Nuevo Estudiante</h3>
          <button onClick={handleClose} disabled={isLoading}>
            Cerrar
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div>{error}</div>
          )}

          {/* Nombre del estudiante */}
          <div>
            <label>
              Nombre Completo del Estudiante *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
              placeholder="Ej: Juan Pérez García"
              maxLength={100}
            />
          </div>

          {/* Correo del apoderado */}
          <div>
            <label>
              Correo Electrónico del Apoderado *
            </label>
            <input
              type="email"
              value={formData.parentEmail}
              onChange={(e) => handleInputChange('parentEmail', e.target.value)}
              disabled={isLoading}
              placeholder="correo@ejemplo.com"
            />
            <p>
              Este correo se usará para asociar al estudiante con su apoderado
            </p>
          </div>

          {/* URL de la foto */}
          <div>
            <label>
              URL de la Foto del Estudiante (Opcional)
            </label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => handleInputChange('photoUrl', e.target.value)}
              disabled={isLoading}
              placeholder="https://ejemplo.com/foto-estudiante.jpg"
            />
            <p>
              Si no se proporciona, se usará una imagen placeholder
            </p>
          </div>

          {/* Selección de cursos */}
          <div>
            <label>
              Cursos a Inscribir (Opcional)
            </label>
            {courses.length === 0 ? (
              <p>
                No hay cursos disponibles. Puedes crear cursos desde la pestaña de gestión de cursos.
              </p>
            ) : (
              <div>
                {courses.map((course) => (
                  <div key={course.id}>
                    <input
                      type="checkbox"
                      id={`course-${course.id}`}
                      checked={formData.selectedCourses.includes(course.id)}
                      onChange={() => handleCourseToggle(course.id)}
                      disabled={isLoading}
                    />
                    <label htmlFor={`course-${course.id}`}>
                      {course.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
            <p>
              Seleccionados: {formData.selectedCourses.length} curso(s)
            </p>
          </div>

          {/* Resumen */}
          <div>
            <h4>Resumen:</h4>
            <div>
              <p><strong>Nombre:</strong> {formData.name || 'Sin especificar'}</p>
              <p><strong>Apoderado:</strong> {formData.parentEmail || 'Sin especificar'}</p>
              <p><strong>Cursos:</strong> {formData.selectedCourses.length} seleccionado(s)</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim() || !formData.parentEmail.trim()}
          >
            {isLoading ? 'Creando...' : 'Crear Estudiante'}
          </button>
        </div>
      </div>
    </div>
  );
}