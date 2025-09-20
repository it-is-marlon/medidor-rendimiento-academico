import { useState, useEffect } from "react";
import { firestoreService } from "../services/firestoreService";

// Hook personalizado para gestionar estudiantes
export function useStudents(courseId = null, parentEmail = null) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId && !parentEmail) {
      setLoading(false);
      return;
    }

    let unsubscribe;

    try {
      if (courseId) {
        // Estudiantes de un curso específico
        unsubscribe = firestoreService.getStudentsByCourse(
          courseId,
          (fetchedStudents) => {
            setStudents(fetchedStudents);
            setLoading(false);
          }
        );
      } else if (parentEmail) {
        // Estudiantes asociados a un apoderado
        unsubscribe = firestoreService.getStudentsByParentEmail(
          parentEmail,
          (fetchedStudents) => {
            setStudents(fetchedStudents);
            setLoading(false);
          }
        );
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [courseId, parentEmail]);

  // Función para actualizar un estudiante
  const updateStudent = async (studentId, updateData) => {
    try {
      await firestoreService.updateStudentProfile(studentId, updateData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Función para obtener estadísticas de estudiantes
  const getStudentStats = async (studentId, courseId) => {
    try {
      return await firestoreService.getStudentStats(studentId, courseId);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return {
    students,
    loading,
    error,
    updateStudent,
    getStudentStats,
  };
}
