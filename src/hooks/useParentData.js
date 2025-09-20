import { useState, useEffect } from "react";
import { firestoreService } from "../services/firestoreService";

// Hook especializado para datos de apoderados
export function useParentData(parentEmail) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!parentEmail) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = firestoreService.getStudentsByParentEmail(
        parentEmail,
        (fetchedStudents) => {
          setStudents(fetchedStudents);
          setLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [parentEmail]);

  // Función para obtener resumen de un estudiante
  const getStudentSummary = async (studentId) => {
    try {
      return await firestoreService.getStudentSummaryForParent(studentId);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Función para obtener estadísticas comparativas
  const getComparativeStats = async (studentId, courseId) => {
    try {
      return await firestoreService.getComparativeStats(studentId, courseId);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return {
    students,
    loading,
    error,
    getStudentSummary,
    getComparativeStats,
  };
}
