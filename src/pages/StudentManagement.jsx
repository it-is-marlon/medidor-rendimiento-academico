import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';

export function StudentManagement({ courseId, courseName, teacherId }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('students'); // 'students' o 'records'
  
  // Estados para el formulario de registro
  const [recordType, setRecordType] = useState('participacion');
  const [recordValue, setRecordValue] = useState(3);
  const [recordNote, setRecordNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!courseId) return;

    // Escuchar cambios en los estudiantes del curso
    const unsubscribeStudents = firestoreService.getStudentsByCourse(courseId, (fetchedStudents) => {
      setStudents(fetchedStudents);
      setLoading(false);
    });

    // Escuchar cambios en los registros del curso
    const unsubscribeRecords = firestoreService.getRecordsByCourse(courseId, (fetchedRecords) => {
      setRecords(fetchedRecords);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeRecords();
    };
  }, [courseId]);

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(students.map(student => student.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      alert('Por favor selecciona al menos un estudiante.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedStudents.length === 1) {
        // Registro individual
        await firestoreService.createRecord(
          selectedStudents[0],
          courseId,
          teacherId,
          recordType,
          recordValue,
          recordNote
        );
      } else {
        // Registro por lotes
        await firestoreService.createBulkRecords(
          selectedStudents,
          courseId,
          teacherId,
          recordType,
          recordValue,
          recordNote
        );
      }

      // Limpiar formulario y mostrar éxito
      setSelectedStudents([]);
      setRecordNote('');
      setSuccessMessage(`Registro guardado exitosamente para ${selectedStudents.length} estudiante(s).`);
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error al guardar el registro:', error);
      alert('Error al guardar el registro. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Estudiante desconocido';
  };

  if (loading) {
    return (
      <div>
        Cargando...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div>
        <div>
          <button onClick={() => navigate(-1)}>
            Volver al Dashboard
          </button>
          <h1>
            Gestión de Estudiantes - {courseName}
          </h1>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div>
          {successMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div>
        <button onClick={() => setActiveView('students')}>
          Registro de Datos
        </button>
        <button onClick={() => setActiveView('records')}>
          Historial de Registros
        </button>
      </div>

      {activeView === 'students' ? (
        <div>
          {/* Panel de Estudiantes */}
          <div>
            <div>
              <h2>
                Estudiantes ({students.length})
              </h2>
              <div>
                <button onClick={selectAllStudents}>
                  Seleccionar todos
                </button>
                <button onClick={clearSelection}>
                  Limpiar selección
                </button>
              </div>
            </div>

            {students.length === 0 ? (
              <p>
                No hay estudiantes registrados en este curso.
              </p>
            ) : (
              <div>
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentSelection(student.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                    />
                    <span>{student.name}</span>
                    <span>{student.parentEmail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel de Registro */}
          <div>
            <h2>
              Registrar Datos de Rendimiento
            </h2>
            <form onSubmit={handleSubmitRecord}>
              {/* Tipo de Registro */}
              <div>
                <label>
                  Tipo de Registro
                </label>
                <div>
                  {['participacion', 'comportamiento', 'puntualidad'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRecordType(type)}
                    >
                      {getRecordTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor del Registro */}
              <div>
                <label>
                  Evaluación: {getValueLabel(recordValue)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={recordValue}
                  onChange={(e) => setRecordValue(parseInt(e.target.value))}
                />
                <div>
                  <span>Necesita apoyo</span>
                  <span>En desarrollo</span>
                  <span>Satisfactorio</span>
                  <span>Destacado</span>
                  <span>Excelente</span>
                </div>
              </div>

              {/* Nota Personalizada */}
              <div>
                <label>
                  Nota Personalizada (Opcional)
                </label>
                <textarea
                  value={recordNote}
                  onChange={(e) => setRecordNote(e.target.value)}
                  rows="3"
                  placeholder="Escribe una observación específica..."
                />
              </div>

              {/* Resumen de Selección */}
              <div>
                <p>
                  <strong>Estudiantes seleccionados:</strong> {selectedStudents.length}
                </p>
                <p>
                  <strong>Registro:</strong> {getRecordTypeLabel(recordType)} - {getValueLabel(recordValue)}
                </p>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={selectedStudents.length === 0 || isSubmitting}
              >
                {isSubmitting 
                  ? 'Guardando...' 
                  : `Registrar para ${selectedStudents.length} estudiante(s)`
                }
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Panel de Historial de Registros */
        <div>
          <h2>
            Historial de Registros - Últimos 50
          </h2>
          {records.length === 0 ? (
            <p>
              No hay registros guardados para este curso.
            </p>
          ) : (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Tipo</th>
                    <th>Evaluación</th>
                    <th>Nota</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 50).map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span>{getStudentName(record.studentId)}</span>
                      </td>
                      <td>
                        <span>{getRecordTypeLabel(record.type)}</span>
                      </td>
                      <td>
                        <span>{getValueLabel(record.value)}</span>
                      </td>
                      <td>
                        <span>{record.note || '-'}</span>
                      </td>
                      <td>
                        <span>{record.timestamp?.toDate?.()?.toLocaleString() || 'Fecha no disponible'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}