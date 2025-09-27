import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';
import { StudentProgress } from '../components/student/StudentProgress';

export function ParentDashboard({ user, userProfile }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (userProfile?.email) {
      // Obtener estudiantes asociados al apoderado
      const unsubscribeStudents = firestoreService.getStudentsByParentEmail(
        userProfile.email, 
        (fetchedStudents) => {
          setStudents(fetchedStudents);
          if (fetchedStudents.length > 0 && !selectedStudent) {
            setSelectedStudent(fetchedStudents[0]);
          }
          setLoading(false);
        }
      );

      // Obtener todos los cursos para mostrar nombres
      const unsubscribeCourses = firestoreService.getCoursesListener((fetchedCourses) => {
        setCourses(fetchedCourses);
      });

      return () => {
        unsubscribeStudents();
        unsubscribeCourses();
      };
    }
  }, [userProfile, selectedStudent]);

  const getCourseInfo = (courseId) => {
    return courses.find(course => course.id === courseId) || { name: 'Curso desconocido', id: courseId };
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
        <h1>
          Panel del Apoderado
        </h1>
        <p>
          Hola, {userProfile?.name || 'Apoderado'}
        </p>
        <button onClick={authService.signOutUser}>
          Cerrar Sesión
        </button>
      </div>

      {students.length === 0 ? (
        // No hay estudiantes asociados
        <div>
          <h3>
            No hay estudiantes asociados
          </h3>
          <p>
            No se encontraron estudiantes asociados a tu cuenta ({userProfile?.email}).
          </p>
          <div>
            <p>
              <strong>¿Qué hacer?</strong><br/>
              Contacta al administrador del colegio para que asocie a tu hijo(a) con tu correo electrónico.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {/* Selector de Estudiantes (si hay múltiples) */}
          {students.length > 1 && (
            <div>
              <h2>
                Selecciona un estudiante
              </h2>
              <div>
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <span>{student.name}</span>
                    <span>
                      {student.courseIds?.length || 0} cursos
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Información del Estudiante Seleccionado */}
          {selectedStudent && (
            <div>
              <h2>
                {selectedStudent.name}
              </h2>
              <p>
                Inscrito en {selectedStudent.courseIds?.length || 0} curso(s)
              </p>

              {/* Lista de Cursos */}
              <div>
                <h3>Cursos Inscritos</h3>
                {selectedStudent.courseIds && selectedStudent.courseIds.length > 0 ? (
                  <div>
                    {selectedStudent.courseIds.map((courseId) => {
                      const courseInfo = getCourseInfo(courseId);
                      return (
                        <div key={courseId}>
                          <span>{courseInfo.name}</span>
                          <span>ID: {courseId}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <p>No hay cursos asignados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Componente de Progreso del Estudiante */}
          {selectedStudent && (
            <StudentProgress
              student={selectedStudent}
              courses={courses}
            />
          )}
        </div>
      )}

      {/* Panel de Información Adicional */}
      <div>
        <h3>Información de la Cuenta</h3>
        <div>
          <div>
            <h4>Detalles del Apoderado</h4>
            <div>
              <p><strong>Nombre:</strong> {userProfile?.name || 'No especificado'}</p>
              <p><strong>Correo:</strong> {userProfile?.email || 'No especificado'}</p>
              <p><strong>ID de Usuario:</strong> {user?.uid}</p>
            </div>
          </div>
          <div>
            <h4>Estadísticas Generales</h4>
            <div>
              <p><strong>Estudiantes asociados:</strong> {students.length}</p>
              <p><strong>Total de cursos:</strong> {
                students.reduce((total, student) => total + (student.courseIds?.length || 0), 0)
              }</p>
              <p><strong>Última actualización:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}