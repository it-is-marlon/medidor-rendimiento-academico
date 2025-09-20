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
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-800 mb-2 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Estudiantes - {courseName}
          </h1>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveView('students')}
          className={`py-2 px-4 font-medium text-lg rounded-t-lg transition-colors duration-200 ${
            activeView === 'students' 
              ? 'border-b-4 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Registro de Datos
        </button>
        <button
          onClick={() => setActiveView('records')}
          className={`py-2 px-4 font-medium text-lg rounded-t-lg transition-colors duration-200 ${
            activeView === 'records' 
              ? 'border-b-4 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial de Registros
        </button>
      </div>

      {activeView === 'students' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Estudiantes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Estudiantes ({students.length})
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllStudents}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
                >
                  Seleccionar todos
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  Limpiar selección
                </button>
              </div>
            </div>

            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay estudiantes registrados en este curso.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedStudents.includes(student.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleStudentSelection(student.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                      className="mr-3"
                    />
                    <img
                      src={student.photoUrl || '/api/placeholder/40/40'}
                      alt={student.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.parentEmail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel de Registro */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Registrar Datos de Rendimiento
            </h2>
            
            <form onSubmit={handleSubmitRecord} className="space-y-4">
              {/* Tipo de Registro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Registro
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['participacion', 'comportamiento', 'puntualidad'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRecordType(type)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        recordType === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getRecordTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor del Registro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluación: {getValueLabel(recordValue)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={recordValue}
                  onChange={(e) => setRecordValue(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Necesita apoyo</span>
                  <span>En desarrollo</span>
                  <span>Satisfactorio</span>
                  <span>Destacado</span>
                  <span>Excelente</span>
                </div>
              </div>

              {/* Nota Personalizada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota Personalizada (Opcional)
                </label>
                <textarea
                  value={recordNote}
                  onChange={(e) => setRecordNote(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Escribe una observación específica..."
                />
              </div>

              {/* Resumen de Selección */}
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Estudiantes seleccionados:</strong> {selectedStudents.length}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Registro:</strong> {getRecordTypeLabel(recordType)} - {getValueLabel(recordValue)}
                </p>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={selectedStudents.length === 0 || isSubmitting}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Historial de Registros - Últimos 50
          </h2>
          
          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay registros guardados para este curso.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evaluación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.slice(0, 50).map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getStudentName(record.studentId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getRecordTypeLabel(record.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getValueLabel(record.value)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {record.note || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.timestamp?.toDate?.()?.toLocaleString() || 'Fecha no disponible'}
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