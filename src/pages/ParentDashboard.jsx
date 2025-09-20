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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <h1 className="text-4xl font-extrabold text-gray-900">
            Panel del Apoderado
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            Hola, {userProfile?.name || 'Apoderado'}
          </p>
        </div>
        <button
          onClick={authService.signOutUser}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-300"
        >
          Cerrar Sesión
        </button>
      </div>

      {students.length === 0 ? (
        // No hay estudiantes asociados
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No hay estudiantes asociados
          </h3>
          <p className="text-gray-600 mb-4">
            No se encontraron estudiantes asociados a tu cuenta ({userProfile?.email}).
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>¿Qué hacer?</strong><br/>
              Contacta al administrador del colegio para que asocie a tu hijo(a) con tu correo electrónico.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selector de Estudiantes (si hay múltiples) */}
          {students.length > 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Selecciona un estudiante
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedStudent?.id === student.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.photoUrl || '/api/placeholder/48/48'}
                        alt={student.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-500">
                          {student.courseIds?.length || 0} cursos
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Información del Estudiante Seleccionado */}
          {selectedStudent && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={selectedStudent.photoUrl || '/api/placeholder/64/64'}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-gray-600">
                    Inscrito en {selectedStudent.courseIds?.length || 0} curso(s)
                  </p>
                </div>
              </div>

              {/* Lista de Cursos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Cursos Inscritos</h3>
                {selectedStudent.courseIds && selectedStudent.courseIds.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedStudent.courseIds.map((courseId) => {
                      const courseInfo = getCourseInfo(courseId);
                      return (
                        <div key={courseId} className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900">{courseInfo.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">ID: {courseId}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No hay cursos asignados</p>
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
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Información de la Cuenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Detalles del Apoderado</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Nombre:</strong> {userProfile?.name || 'No especificado'}</p>
              <p><strong>Correo:</strong> {userProfile?.email || 'No especificado'}</p>
              <p><strong>ID de Usuario:</strong> 
                <span className="font-mono text-xs bg-gray-100 rounded px-2 py-1 ml-2">
                  {user?.uid}
                </span>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Estadísticas Generales</h4>
            <div className="space-y-2 text-sm">
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