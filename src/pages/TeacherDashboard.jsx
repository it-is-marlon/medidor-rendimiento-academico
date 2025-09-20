import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';
import { StudentManagement } from './StudentManagement';

export function TeacherDashboard({ user, userProfile }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStats, setCourseStats] = useState({});

  // Escucha los cursos asignados a este docente en tiempo real
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = firestoreService.getTeacherCourses(user.uid, async (fetchedCourses) => {
        setCourses(fetchedCourses);
        setLoading(false);
        
        // Cargar estadísticas para cada curso
        const stats = {};
        for (const course of fetchedCourses) {
          try {
            const courseStats = await firestoreService.getCourseStats(course.id);
            stats[course.id] = courseStats;
          } catch (error) {
            console.error(`Error cargando estadísticas para curso ${course.id}:`, error);
            stats[course.id] = null;
          }
        }
        setCourseStats(stats);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleManageStudents = (course) => {
    setSelectedCourse(course);
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
  };

  const getOverallAverage = (stats) => {
    if (!stats) return 0;
    
    const averages = Object.values(stats)
      .filter(stat => stat.count > 0)
      .map(stat => stat.average);
    
    if (averages.length === 0) return 0;
    return averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
  };

  const getStatsColor = (average) => {
    if (average >= 4) return 'text-green-600';
    if (average >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Si hay un curso seleccionado, mostrar la gestión de estudiantes
  if (selectedCourse) {
    return (
      <StudentManagement
        courseId={selectedCourse.id}
        courseName={selectedCourse.name}
        teacherId={user.uid}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Encabezado y botón de cierre de sesión */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Hola, {userProfile?.name || 'Docente'}
        </h1>
        <button
          onClick={authService.signOutUser}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-300"
        >
          Cerrar Sesión
        </button>
      </div>

      <p className="text-lg text-gray-600 mb-8">
        ID del docente: <span className="font-mono text-sm bg-gray-200 rounded-md px-2 py-1">{user?.uid}</span>
      </p>

      {/* Cursos del docente */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tus Cursos</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes cursos asignados</h3>
            <p className="mt-1 text-sm text-gray-500">
              Pídele al administrador que cree un curso y te lo asigne.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const stats = courseStats[course.id];
              const overallAverage = getOverallAverage(stats);
              
              return (
                <div
                  key={course.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {course.name}
                    </h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                      {course.studentIds?.length || 0} estudiantes
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">ID del Curso:</p>
                    <p className="font-mono text-xs bg-gray-100 rounded px-2 py-1 break-all">
                      {course.id}
                    </p>
                  </div>

                  {/* Estadísticas del curso */}
                  {stats && (
                    <div className="mb-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Estadísticas:</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className={`font-semibold ${getStatsColor(stats.participacion?.average || 0)}`}>
                            {stats.participacion?.average?.toFixed(1) || '0.0'}
                          </div>
                          <div className="text-gray-500">Participación</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-semibold ${getStatsColor(stats.comportamiento?.average || 0)}`}>
                            {stats.comportamiento?.average?.toFixed(1) || '0.0'}
                          </div>
                          <div className="text-gray-500">Comportamiento</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-semibold ${getStatsColor(stats.puntualidad?.average || 0)}`}>
                            {stats.puntualidad?.average?.toFixed(1) || '0.0'}
                          </div>
                          <div className="text-gray-500">Puntualidad</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-gray-50 rounded text-center">
                        <div className={`text-lg font-bold ${getStatsColor(overallAverage)}`}>
                          {overallAverage.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Promedio General</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleManageStudents(course)}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 font-medium"
                    >
                      Gestionar Estudiantes
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm">
                      Ver Reportes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel de Acciones Rápidas */}
      {courses.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Registros Recientes</h4>
              <p className="text-sm text-blue-700">
                Revisa los últimos registros de rendimiento en todos tus cursos.
              </p>
              <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                Ver todos →
              </button>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Estudiantes Destacados</h4>
              <p className="text-sm text-green-700">
                Identifica a los estudiantes con mejor rendimiento.
              </p>
              <button className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium">
                Ver lista →
              </button>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Estudiantes que Necesitan Apoyo</h4>
              <p className="text-sm text-yellow-700">
                Revisa estudiantes que requieren atención adicional.
              </p>
              <button className="mt-2 text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                Ver lista →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}