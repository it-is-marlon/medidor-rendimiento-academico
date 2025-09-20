import { useState, useEffect } from "react";
import { firestoreService } from "../services/firestoreService";

// Hook personalizado para gestionar registros de rendimiento
export function useRecords(courseId = null, studentId = null) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId && !studentId) {
      setLoading(false);
      return;
    }

    let unsubscribe;

    try {
      if (courseId && studentId) {
        // Registros específicos de un estudiante en un curso
        unsubscribe = firestoreService.getRecordsByStudentAndCourse(
          studentId,
          courseId,
          (fetchedRecords) => {
            setRecords(fetchedRecords);
            setLoading(false);
          }
        );
      } else if (courseId) {
        // Todos los registros de un curso
        unsubscribe = firestoreService.getRecordsByCourse(
          courseId,
          (fetchedRecords) => {
            setRecords(fetchedRecords);
            setLoading(false);
          }
        );
      } else if (studentId) {
        // Todos los registros de un estudiante
        unsubscribe = firestoreService.getRecordsByStudent(
          studentId,
          (fetchedRecords) => {
            setRecords(fetchedRecords);
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
  }, [courseId, studentId]);

  // Función para crear un nuevo registro
  const createRecord = async (recordData) => {
    try {
      await firestoreService.createRecord(
        recordData.studentId,
        recordData.courseId,
        recordData.teacherId,
        recordData.type,
        recordData.value,
        recordData.note
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Función para crear registros por lotes
  const createBulkRecords = async (studentIds, recordData) => {
    try {
      await firestoreService.createBulkRecords(
        studentIds,
        recordData.courseId,
        recordData.teacherId,
        recordData.type,
        recordData.value,
        recordData.note
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Función para obtener estadísticas
  const getStats = () => {
    const stats = {
      participacion: { total: 0, count: 0, average: 0 },
      comportamiento: { total: 0, count: 0, average: 0 },
      puntualidad: { total: 0, count: 0, average: 0 },
    };

    records.forEach((record) => {
      if (stats[record.type]) {
        stats[record.type].total += record.value;
        stats[record.type].count += 1;
      }
    });

    // Calcular promedios
    Object.keys(stats).forEach((type) => {
      if (stats[type].count > 0) {
        stats[type].average = stats[type].total / stats[type].count;
      }
    });

    return stats;
  };

  return {
    records,
    loading,
    error,
    createRecord,
    createBulkRecords,
    getStats,
  };
}
