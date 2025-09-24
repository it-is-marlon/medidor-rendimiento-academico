import { useState, useEffect } from "react";
import { firestoreService } from "../services/firestoreService";

// Hook personalizado para gestionar registros de rendimiento
export function useRecords(courseId = null, studentId = null, filters = {}) {
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
            setRecords(applyFilters(fetchedRecords, filters));
            setLoading(false);
          }
        );
      } else if (courseId) {
        // Todos los registros de un curso
        unsubscribe = firestoreService.getRecordsByCourse(
          courseId,
          (fetchedRecords) => {
            setRecords(applyFilters(fetchedRecords, filters));
            setLoading(false);
          }
        );
      } else if (studentId) {
        // Todos los registros de un estudiante
        unsubscribe = firestoreService.getRecordsByStudent(
          studentId,
          (fetchedRecords) => {
            setRecords(applyFilters(fetchedRecords, filters));
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
  }, [courseId, studentId, filters]);

  // Aplica filtros a los registros
  const applyFilters = (recordsToFilter, filtersToApply) => {
    let filtered = [...recordsToFilter];

    // Filtro por tipo
    if (filtersToApply.type && filtersToApply.type !== "all") {
      filtered = filtered.filter(
        (record) => record.type === filtersToApply.type
      );
    }

    // Filtro por rango de fechas
    if (filtersToApply.dateFrom) {
      const fromDate = new Date(filtersToApply.dateFrom);
      filtered = filtered.filter((record) => {
        const recordDate =
          record.timestamp?.toDate?.() || new Date(record.timestamp);
        return recordDate >= fromDate;
      });
    }

    if (filtersToApply.dateTo) {
      const toDate = new Date(filtersToApply.dateTo);
      toDate.setHours(23, 59, 59, 999); // Final del día
      filtered = filtered.filter((record) => {
        const recordDate =
          record.timestamp?.toDate?.() || new Date(record.timestamp);
        return recordDate <= toDate;
      });
    }

    // Filtro por valor mínimo
    if (filtersToApply.minValue) {
      filtered = filtered.filter(
        (record) => record.value >= parseInt(filtersToApply.minValue)
      );
    }

    // Filtro por valor máximo
    if (filtersToApply.maxValue) {
      filtered = filtered.filter(
        (record) => record.value <= parseInt(filtersToApply.maxValue)
      );
    }

    return filtered;
  };

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
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
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
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Función para actualizar un registro
  const updateRecord = async (recordId, updateData) => {
    try {
      await firestoreService.updateRecord(recordId, {
        ...updateData,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Función para eliminar un registro
  const deleteRecord = async (recordId) => {
    try {
      await firestoreService.deleteRecord(recordId);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Función para obtener un registro específico por ID
  const getRecordById = (recordId) => {
    return records.find((record) => record.id === recordId) || null;
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

  // Función para obtener registros agrupados por fecha
  const getRecordsByDate = () => {
    const grouped = {};

    records.forEach((record) => {
      const date =
        record.timestamp?.toDate?.()?.toDateString() ||
        new Date(record.timestamp).toDateString();

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(record);
    });

    return grouped;
  };

  // Función para obtener tendencias (últimos N días)
  const getTrends = (days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentRecords = records.filter((record) => {
      const recordDate =
        record.timestamp?.toDate?.() || new Date(record.timestamp);
      return recordDate >= cutoffDate;
    });

    const trends = {
      participacion: [],
      comportamiento: [],
      puntualidad: [],
    };

    // Agrupar por día y calcular promedios
    const dailyStats = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();

      dailyStats[dateKey] = {
        participacion: { total: 0, count: 0 },
        comportamiento: { total: 0, count: 0 },
        puntualidad: { total: 0, count: 0 },
      };
    }

    recentRecords.forEach((record) => {
      const recordDate =
        record.timestamp?.toDate?.() || new Date(record.timestamp);
      const dateKey = recordDate.toDateString();

      if (dailyStats[dateKey] && dailyStats[dateKey][record.type]) {
        dailyStats[dateKey][record.type].total += record.value;
        dailyStats[dateKey][record.type].count += 1;
      }
    });

    // Convertir a arrays para gráficos
    Object.keys(dailyStats).forEach((dateKey) => {
      const date = new Date(dateKey);

      Object.keys(trends).forEach((type) => {
        const dayData = dailyStats[dateKey][type];
        const average = dayData.count > 0 ? dayData.total / dayData.count : 0;

        trends[type].push({
          date: date.toISOString().split("T")[0],
          value: average,
          count: dayData.count,
        });
      });
    });

    return trends;
  };

  return {
    records,
    loading,
    error,
    createRecord,
    createBulkRecords,
    updateRecord,
    deleteRecord,
    getRecordById,
    getStats,
    getRecordsByDate,
    getTrends,
    totalRecords: records.length,
    setError, // Para limpiar errores desde los componentes
  };
}
