import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../services/firestoreService';
import { PerformanceChart } from '../charts/PerformanceChart';
import { ComparisonChart } from '../charts/ComparisonChart';

export function StudentProgress({ student, courses }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [records, setRecords] = useState([]);
  const [studentStats, setStudentStats] = useState({});
  const [courseStats, setCourseStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Obtener cursos del estudiante
  const studentCourses = courses.filter(course => 
    student.courseIds?.includes(course.id)
  );

  useEffect(() => {
    if (studentCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(studentCourses[0]);
    }
  }, [studentCourses, selectedCourse]);

  useEffect(() => {
    if (!selectedCourse || !student) {
      setLoading(false);
      return;
    }

    // Obtener registros del estudiante en el curso seleccionado
    const unsubscribeRecords = firestoreService.getRecordsByStudentAndCourse(
      student.id,
      selectedCourse.id,
      (fetchedRecords) => {
        setRecords(fetchedRecords);
        setLoading(false);
      }
    );

    // Obtener estadísticas del estudiante
    firestoreService.getStudentStats(student.id, selectedCourse.id)
      .then(stats => setStudentStats(stats))
      .catch(error => console.error('Error obteniendo estadísticas del estudiante:', error));

    // Obtener estadísticas del curso para comparación
    firestoreService.getCourseStats(selectedCourse.id)
      .then(stats => setCourseStats(stats))
      .catch(error => console.error('Error obteniendo estadísticas del curso:', error));

    return () => {
      unsubscribeRecords();
    };
  }, [selectedCourse, student]);

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

  const getComparisonText = (studentAvg, courseAvg) => {
    if (!studentAvg || !courseAvg) return 'Sin datos suficientes';
    
    const difference = studentAvg - courseAvg;
    if (Math.abs(difference) < 0.2) return 'En línea con el promedio';
    if (difference > 0) return 'Sobre el promedio';
    return 'Necesita apoyo adicional';
  };

  const getComparisonColor = (studentAvg, courseAvg) => {
    if (!studentAvg || !courseAvg) return 'text-gray-500';
    
    const difference = studentAvg - courseAvg;
    if (Math.abs(difference) < 0.2) return 'text-blue-600';
    if (difference > 0) return 'text-green-600';
    return 'text-orange-600';
  };

  if (studentCourses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Progreso Académico</h2>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600">El estudiante no está inscrito en ningún curso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Curso */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Progreso Académico</h2>
        
        {studentCourses.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Curso
            </label>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = studentCourses.find(c => c.id === e.target.value);
                setSelectedCourse(course);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {studentCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedCourse && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">
              Curso Seleccionado: {selectedCourse.name}
            </h3>
            <p className="text-sm text-gray-600">
              Total de registros: {records.length}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      ) : selectedCourse ? (
        <>
          {/* Resumen de Rendimiento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resumen de Rendimiento - {selectedCourse.name}
            </h3>
            
            {records.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">No hay registros de rendimiento para este curso.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['participacion', 'comportamiento', 'puntualidad'].map((type) => {
                  const studentTypeStats = studentStats[type] || { average: 0, count: 0 };
                  const courseTypeStats = courseStats[type] || { average: 0, count: 0 };
                  
                  return (
                    <div key={type} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {getRecordTypeLabel(type)}
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Mi hijo(a)</span>
                            <span className="font-semibold text-lg">
                              {studentTypeStats.average ? studentTypeStats.average.toFixed(1) : '0.0'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(studentTypeStats.average || 0) * 20}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Promedio del curso</span>
                            <span className="font-medium text-sm text-gray-700">
                              {courseTypeStats.average ? courseTypeStats.average.toFixed(1) : '0.0'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-gray-400 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${(courseTypeStats.average || 0) * 20}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <p className={`text-sm font-medium ${getComparisonColor(studentTypeStats.average, courseTypeStats.average)}`}>
                            {getComparisonText(studentTypeStats.average, courseTypeStats.average)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {studentTypeStats.count} registro(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gráficos */}
          {records.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart records={records} />
              <ComparisonChart 
                studentStats={studentStats} 
                courseStats={courseStats} 
                courseName={selectedCourse.name}
              />
            </div>
          )}

          {/* Historial Detallado */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Historial Detallado - Últimos 20 registros
            </h3>
            
            {records.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No hay registros para mostrar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evaluación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Observaciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.slice(0, 20).map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.timestamp?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getRecordTypeLabel(record.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">
                              {record.value}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getValueLabel(record.value)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate">
                            {record.note || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}