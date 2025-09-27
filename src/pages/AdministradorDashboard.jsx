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
    <div>
      {/* Encabezado y botón de cierre de sesión */}
      <div>
        <h1>Panel de Administrador</h1>
        <button onClick={authService.signOutUser}>
          Cerrar Sesión
        </button>
      </div>

      <p>
        ID del administrador: <span>{user?.uid}</span>
      </p>

      {/* Navegación de pestañas */}
      <div>
        <button onClick={() => setActiveTab('usuarios')}>
          Gestión de Usuarios
        </button>
        <button onClick={() => setActiveTab('cursos')}>
          Gestión de Cursos
        </button>
        <button onClick={() => setActiveTab('alumnos')}>
          Gestión de Alumnos
        </button>
      </div>

      {loading ? (
        <div>
          Cargando datos...
        </div>
      ) : (
        <>
          {/* Contenido de la pestaña de Usuarios */}
          {activeTab === 'usuarios' && (
            <div>
              <h2>
                {isCreatingUser ? 'Crear Nuevo Usuario' : isEditingUser ? 'Editar Usuario' : 'Lista de Usuarios'}
              </h2>
              {isCreatingUser || isEditingUser ? (
                <form onSubmit={isCreatingUser ? handleCreateUser : handleUpdateUser}>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                  {!isEditingUser && (
                    <>
                      <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                      <input
                        type="password"
                        placeholder="Contraseña"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                    </>
                  )}
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <option value="docente">Docente</option>
                    <option value="apoderado">Apoderado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                  <div>
                    <button type="submit">
                      {isCreatingUser ? 'Crear Usuario' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingUser(false);
                        setIsEditingUser(false);
                        setEditingUser(null);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <button onClick={() => setIsCreatingUser(true)}>
                    Crear Nuevo Usuario
                  </button>
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>ID de Usuario</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.userId}</td>
                            <td>
                              <button onClick={() => handleEditUser(user)}>
                                Editar
                              </button>
                              <button onClick={() => handleDeleteUser(user.userId)}>
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
            <div>
              <h2>
                {isEditingCourse ? 'Editar Curso' : 'Gestión de Cursos'}
              </h2>
              {isEditingCourse ? (
                <form onSubmit={handleUpdateCourse}>
                  <input
                    type="text"
                    placeholder="Nombre del curso"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                  />
                  <select
                    value={newCourseTeacher}
                    onChange={(e) => setNewCourseTeacher(e.target.value)}
                  >
                    <option value="" disabled>Selecciona un docente</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                  <div>
                    <button type="submit">
                      Guardar Cambios
                    </button>
                    <button type="button" onClick={() => setIsEditingCourse(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <form onSubmit={handleCreateCourse}>
                    <h3>Crear Nuevo Curso</h3>
                    <input
                      type="text"
                      placeholder="Nombre del curso"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                    />
                    <select
                      value={newCourseTeacher}
                      onChange={(e) => setNewCourseTeacher(e.target.value)}
                    >
                      <option value="" disabled>Selecciona un docente</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                      ))}
                    </select>
                    <button type="submit">
                      Crear Curso
                    </button>
                  </form>
                  <h3>Lista de Cursos</h3>
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre del Curso</th>
                          <th>Docente Asignado</th>
                          <th>ID del Curso</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.id}>
                            <td>{course.name}</td>
                            <td>{getTeacherName(course.teacherId)}</td>
                            <td>{course.id}</td>
                            <td>
                              <button onClick={() => handleEditCourse(course)}>
                                Editar
                              </button>
                              <button onClick={() => handleDeleteCourse(course.id)}>
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
            <div>
              <h2>
                {isEditingStudent ? 'Editar Alumno' : 'Gestión de Alumnos'}
              </h2>
              {isEditingStudent ? (
                <form onSubmit={handleUpdateStudent}>
                  <input
                    type="text"
                    placeholder="Nombre del alumno"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Correo del Apoderado"
                    value={newStudentParentEmail}
                    onChange={(e) => setNewStudentParentEmail(e.target.value)}
                  />
                  <div>
                    <button type="submit">
                      Guardar Cambios
                    </button>
                    <button type="button" onClick={() => setIsEditingStudent(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Botones de acción */}
                  <div>
                    <button onClick={handleCreateStudent}>
                      Registrar Estudiante
                    </button>
                    <button onClick={handleImportStudents}>
                      Importar desde Archivo
                    </button>
                  </div>
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>Foto</th>
                          <th>Nombre</th>
                          <th>Email del Apoderado</th>
                          <th>Cursos</th>
                          <th>ID de Alumno</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td></td>
                            <td>{student.name}</td>
                            <td>{student.parentEmail}</td>
                            <td>
                              {student.courseIds?.length || 0} curso(s)
                            </td>
                            <td>{student.id}</td>
                            <td>
                              <button onClick={() => handleEditStudent(student)}>
                                Editar
                              </button>
                              <button onClick={() => handleDeleteStudent(student.id)}>
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