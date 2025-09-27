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

  // El color de las estadísticas ya no se usa porque se eliminan los estilos
  const getStatsColor = (average) => '';

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
    <div>
      {/* Encabezado y botón de cierre de sesión */}
      <div>
        <h1>
          Hola, {userProfile?.name || 'Docente'}
        </h1>
        <button onClick={authService.signOutUser}>
          Cerrar Sesión
        </button>
      </div>

      <p>
        ID del docente: <span>{user?.uid}</span>
      </p>

      {/* Cursos del docente */}
      <div>
        <h2>Tus Cursos</h2>
        {loading ? (
          <div>
            Cargando cursos...
          </div>
        ) : courses.length === 0 ? (
          <div>
            <div>No tienes cursos asignados</div>
            <p>
              Pídele al administrador que cree un curso y te lo asigne.
            </p>
          </div>
        ) : (
          <div>
            {courses.map((course) => {
              const stats = courseStats[course.id];
              const overallAverage = getOverallAverage(stats);
              
              return (
                <div key={course.id}>
                  <div>
                    <h3>{course.name}</h3>
                    <span>
                      {course.studentIds?.length || 0} estudiantes
                    </span>
                  </div>
                  <div>
                    <p>ID del Curso:</p>
                    <p>{course.id}</p>
                  </div>

                  {/* Estadísticas del curso */}
                  {stats && (
                    <div>
                      <h4>Estadísticas:</h4>
                      <div>
                        <div>
                          <div>
                            {stats.participacion?.average?.toFixed(1) || '0.0'}
                          </div>
                          <div>Participación</div>
                        </div>
                        <div>
                          <div>
                            {stats.comportamiento?.average?.toFixed(1) || '0.0'}
                          </div>
                          <div>Comportamiento</div>
                        </div>
                        <div>
                          <div>
                            {stats.puntualidad?.average?.toFixed(1) || '0.0'}
                          </div>
                          <div>Puntualidad</div>
                        </div>
                      </div>
                      <div>
                        <div>
                          {overallAverage.toFixed(1)}
                        </div>
                        <div>Promedio General</div>
                      </div>
                    </div>
                  )}
                  <div>
                    <button onClick={() => handleManageStudents(course)}>
                      Gestionar Estudiantes
                    </button>
                    <button>
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
        <div>
          <h3>Acciones Rápidas</h3>
          <div>
            <div>
              <h4>Registros Recientes</h4>
              <p>
                Revisa los últimos registros de rendimiento en todos tus cursos.
              </p>
              <button>
                Ver todos →
              </button>
            </div>
            <div>
              <h4>Estudiantes Destacados</h4>
              <p>
                Identifica a los estudiantes con mejor rendimiento.
              </p>
              <button>
                Ver lista →
              </button>
            </div>
            <div>
              <h4>Estudiantes que Necesitan Apoyo</h4>
              <p>
                Revisa estudiantes que requieren atención adicional.
              </p>
              <button>
                Ver lista →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}