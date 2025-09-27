import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';
import { CreateStudentModal } from '../components/admin/CreateStudentModal';
import { ImportStudents } from '../components/admin/ImportStudents';

export function AdministradorDashboard({ user, userProfile }) {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para la gestión de usuarios
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('docente');

  // Estados para la gestión de cursos
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseTeacher, setNewCourseTeacher] = useState('');

  // Estados para la gestión de alumnos
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentParentEmail, setNewStudentParentEmail] = useState('');
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [isImportingStudents, setIsImportingStudents] = useState(false);

  // Escucha los cambios en los datos en tiempo real
  useEffect(() => {
    const unsubscribeUsers = firestoreService.getUsersListener((fetchedUsers) => {
      setUsers(fetchedUsers);
      setLoading(false);
    });
    const unsubscribeCourses = firestoreService.getCoursesListener((fetchedCourses) => {
      setCourses(fetchedCourses);
    });
    const unsubscribeStudents = firestoreService.getStudentsListener((fetchedStudents) => {
      setStudents(fetchedStudents);
    });

    // Limpia los listeners al desmontar el componente
    return () => {
      unsubscribeUsers();
      unsubscribeCourses();
      unsubscribeStudents();
    };
  }, []);

  const teachers = users.filter(user => user.role === 'docente');

  // --- Lógica para la Gestión de Usuarios ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      console.error("Faltan datos para crear el usuario.");
      return;
    }
    try {
      await authService.createUser(newUserEmail, newUserPassword, newUserName, newUserRole);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setIsCreatingUser(false);
      console.log("Usuario creado con éxito.");
    } catch (error) {
      console.error("Error al crear el usuario:", error);
    }
  };

  const handleEditUser = (user) => {
    setIsEditingUser(true);
    setEditingUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserRole.trim()) {
      console.error("Faltan datos para actualizar el usuario.");
      return;
    }
    // Implementar un modal o una confirmación visual en lugar de window.confirm
    if (window.confirm(`¿Estás seguro de que quieres actualizar el perfil de '${editingUser.name}'?`)) {
      try {
        await firestoreService.updateUserProfile(editingUser.userId, { name: newUserName, role: newUserRole });
        setIsEditingUser(false);
        setEditingUser(null);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserRole('docente');
        console.log("Perfil de usuario actualizado con éxito.");
      } catch (error) {
        console.error("Error al actualizar el perfil:", error);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    // Implementar un modal o una confirmación visual en lugar de window.confirm
    if (window.confirm("¿Estás seguro de que quieres eliminar a este usuario de forma permanente? Esta acción es irreversible.")) {
      try {
        await firestoreService.deleteUserProfile(userId);
        console.log("Perfil de usuario eliminado de Firestore.");
      } catch (error) {
        console.error("Error al eliminar el perfil del usuario:", error);
      }
    }
  };

  // --- Lógica para la Gestión de Cursos ---
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseTeacher) return;
    try {
      await firestoreService.createCourse(newCourseName, newCourseTeacher);
      setNewCourseName('');
      console.log("Curso creado con éxito.");
    } catch (error) {
      console.error("Error al crear el curso:", error);
    }
  };

  const handleEditCourse = (course) => {
    setIsEditingCourse(true);
    setEditingCourse(course);
    setNewCourseName(course.name);
    setNewCourseTeacher(course.teacherId);
  };
  
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseTeacher) return;
    try {
      await firestoreService.updateCourse(editingCourse.id, { name: newCourseName, teacherId: newCourseTeacher });
      setIsEditingCourse(false);
      setEditingCourse(null);
      setNewCourseName('');
      setNewCourseTeacher('');
      console.log("Curso actualizado con éxito.");
    } catch (error) {
      console.error("Error al actualizar el curso:", error);
    }
  };
  
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este curso?")) {
      try {
        await firestoreService.deleteCourse(courseId);
        console.log("Curso eliminado de Firestore.");
      } catch (error) {
        console.error("Error al eliminar el curso:", error);
      }
    }
  };

  // --- Lógica para la Gestión de Alumnos ---
  const handleCreateStudent = () => {
    setIsCreatingStudent(true);
  };

  const handleStudentCreated = () => {
    console.log("Estudiante creado exitosamente");
    setIsCreatingStudent(false);
  };

  const handleImportStudents = () => {
    setIsImportingStudents(true);
  };

  const handleStudentsImported = (results) => {
    console.log("Estudiantes importados:", results);
    setIsImportingStudents(false);
  };

  const handleEditStudent = (student) => {
    setIsEditingStudent(true);
    setEditingStudent(student);
    setNewStudentName(student.name);
    setNewStudentParentEmail(student.parentEmail);
  };
  
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentParentEmail.trim()) return;
    try {
      await firestoreService.updateStudentProfile(editingStudent.id, { name: newStudentName, parentEmail: newStudentParentEmail });
      setIsEditingStudent(false);
      setEditingStudent(null);
      setNewStudentName('');
      setNewStudentParentEmail('');
      console.log("Alumno actualizado con éxito.");
    } catch (error) {
      console.error("Error al actualizar el alumno:", error);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar a este alumno?")) {
      try {
        await firestoreService.deleteStudentProfile(studentId);
        console.log("Alumno eliminado de Firestore.");
      } catch (error) {
        console.error("Error al eliminar el alumno:", error);
      }
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Desconocido';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Encabezado y botón de cierre de sesión */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Panel de Administrador
        </h1>
        <button
          onClick={authService.signOutUser}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-300"
        >
          Cerrar Sesión
        </button>
      </div>

      <p className="text-lg text-gray-600 mb-8">
        ID del administrador: <span className="font-mono text-sm bg-gray-200 rounded-md px-2 py-1">{user?.uid}</span>
      </p>

      {/* Navegación de pestañas */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`py-2 px-4 font-medium text-lg rounded-t-lg transition-colors duration-200 ${activeTab === 'usuarios' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Gestión de Usuarios
        </button>
        <button
          onClick={() => setActiveTab('cursos')}
          className={`py-2 px-4 font-medium text-lg rounded-t-lg transition-colors duration-200 ${activeTab === 'cursos' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Gestión de Cursos
        </button>
        <button
          onClick={() => setActiveTab('alumnos')}
          className={`py-2 px-4 font-medium text-lg rounded-t-lg transition-colors duration-200 ${activeTab === 'alumnos' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Gestión de Alumnos
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Contenido de la pestaña de Usuarios */}
          {activeTab === 'usuarios' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {isCreatingUser ? 'Crear Nuevo Usuario' : isEditingUser ? 'Editar Usuario' : 'Lista de Usuarios'}
              </h2>
              {isCreatingUser || isEditingUser ? (
                <form onSubmit={isCreatingUser ? handleCreateUser : handleUpdateUser} className="mb-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  {!isEditingUser && (
                    <>
                      <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md"
                      />
                      <input
                        type="password"
                        placeholder="Contraseña"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md"
                      />
                    </>
                  )}
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="docente">Docente</option>
                    <option value="apoderado">Apoderado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                    >
                      {isCreatingUser ? 'Crear Usuario' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingUser(false);
                        setIsEditingUser(false);
                        setEditingUser(null);
                      }}
                      className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <button
                    onClick={() => setIsCreatingUser(true)}
                    className="px-4 py-2 mb-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
                  >
                    Crear Nuevo Usuario
                  </button>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID de Usuario</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{user.userId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.userId)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Contenido de la pestaña de Cursos */}
          {activeTab === 'cursos' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {isEditingCourse ? 'Editar Curso' : 'Gestión de Cursos'}
              </h2>
              {isEditingCourse ? (
                <form onSubmit={handleUpdateCourse} className="mb-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre del curso"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  <select
                    value={newCourseTeacher}
                    onChange={(e) => setNewCourseTeacher(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="" disabled>Selecciona un docente</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCourse(false)}
                      className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <form onSubmit={handleCreateCourse} className="mb-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700">Crear Nuevo Curso</h3>
                    <input
                      type="text"
                      placeholder="Nombre del curso"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                    />
                    <select
                      value={newCourseTeacher}
                      onChange={(e) => setNewCourseTeacher(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                    >
                      <option value="" disabled>Selecciona un docente</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                    >
                      Crear Curso
                    </button>
                  </form>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Lista de Cursos</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Curso</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docente Asignado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID del Curso</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map((course) => (
                          <tr key={course.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getTeacherName(course.teacherId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{course.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditCourse(course)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Contenido de la pestaña de Alumnos */}
          {activeTab === 'alumnos' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {isEditingStudent ? 'Editar Alumno' : 'Gestión de Alumnos'}
              </h2>
              {isEditingStudent ? (
                <form onSubmit={handleUpdateStudent} className="mb-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre del alumno"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  <input
                    type="email"
                    placeholder="Correo del Apoderado"
                    value={newStudentParentEmail}
                    onChange={(e) => setNewStudentParentEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingStudent(false)}
                      className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      onClick={handleCreateStudent}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Registrar Estudiante
                    </button>
                    <button
                      onClick={handleImportStudents}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Importar desde Archivo
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email del Apoderado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cursos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID de Alumno</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img className="h-10 w-10 rounded-full object-cover" src={student.photoUrl} alt={student.name} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.parentEmail}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {student.courseIds?.length || 0} curso(s)
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{student.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditStudent(student)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal para crear estudiante */}
      <CreateStudentModal
        isOpen={isCreatingStudent}
        onClose={() => setIsCreatingStudent(false)}
        onSuccess={handleStudentCreated}
        courses={courses}
      />

      {/* Modal para importar estudiantes */}
      <ImportStudents
        isOpen={isImportingStudents}
        onClose={() => setIsImportingStudents(false)}
        onSuccess={handleStudentsImported}
        courses={courses}
      />
    </div>
  );
}