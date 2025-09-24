import React, { useState, useEffect } from 'react';
import { useRecords } from '../../hooks/useRecords';
import { EditRecordModal } from '../modals/EditRecordModal';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { PerformanceChart } from '../charts/PerformanceChart';
import { useAuth } from '../../hooks/useAuth';

export function StudentProgress({ student, courses }) {
  const { userProfile } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Hook de registros que se actualiza según el curso seleccionado
  const {
    records,
    loading,
    error,
    updateRecord,
    deleteRecord,
    getStats,
    getTrends
  } = useRecords(selectedCourse?.id || null, student.id);

  // Seleccionar el primer curso por defecto
  useEffect(() => {
    if (student.courseIds && student.courseIds.length > 0 && !selectedCourse) {
      const firstCourseId = student.courseIds[0];
      const courseInfo = courses.find(c => c.id === firstCourseId);
      if (courseInfo) {
        setSelectedCourse(courseInfo);
      }
    }
  }, [student.courseIds, courses, selectedCourse]);

  const getRecordTypeLabel = (type) => {
    const labels = {
      'participacion': 'Participación',
      'comportamiento': 'Comportamiento',
      'puntualidad': 'Puntualidad'
    };
    return labels[type] || type;
  };

  const getValueLabel = (value) => {
    const labels = {
      1: 'Necesita apoyo',
      2: 'En desarrollo',
      3: 'Satisfactorio',
      4: 'Destacado',
      5: 'Excelente'
    };
    return labels[value] || value;
  };

  const getValueColor = (value) => {
    const colors = {
      1: 'text-red-600 bg-red-50',
      2: 'text-orange-600 bg-orange-50',
      3: 'text-yellow-600 bg-yellow-50',
      4: 'text-blue-600 bg-blue-50',
      5: 'text-green-600 bg-green-50'
    };
    return colors[value] || 'text-gray-600 bg-gray-50';
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteRecord = (record) => {
    setDeletingRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async (recordId, updateData) => {
    setActionLoading(true);
    try {
      const result = await updateRecord(recordId, updateData);
      if (result.success) {
        setIsEditModalOpen(false);
        setEditingRecord(null);
      }
    } catch (error) {
      console.error('Error al actualizar registro:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    
    setActionLoading(true);
    try {
      const result = await deleteRecord(deletingRecord.id);
      if (result.success) {
        setIsDeleteModalOpen(false);
        setDeletingRecord(null);
      }
    } catch (error) {
      console.error('Error al eliminar registro:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const stats = getStats();
  const trends = getTrends(30); // Últimos 30 días

  const isTeacher = userProfile?.role === 'docente';
  const canEditRecords = isTeacher; // Solo los docentes pueden editar registros

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar datos</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Curso */}
      {student.courseIds && student.courseIds.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecciona un Curso</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {student.courseIds.map(courseId => {
              const courseInfo = courses.find(c => c.id === courseId);
              if (!courseInfo) return null;
              
              return (
                <button
                  key={courseId}
                  onClick={() => setSelectedCourse(courseInfo)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedCourse?.id === courseId
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{courseInfo.name}</h4>
                  <p className="text-sm text-gray-500">ID: {courseId}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Estadísticas Generales */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Rendimiento en {selectedCourse.name}
          </h3>

          {records.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="mt-2 text-lg font-medium text-gray-900">Sin registros aún</h4>
              <p className="mt-1 text-sm text-gray-500">
                No hay registros de rendimiento para este curso.
              </p>
            </div>
          ) : (
            <>
              {/* Tarjetas de Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {['participacion', 'comportamiento', 'puntualidad'].map(type => {
                  const stat = stats[type];
                  const average = stat?.average || 0;
                  
                  return (
                    <div key={type} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {getRecordTypeLabel(type)}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${getValueColor(Math.round(average)).split(' ')[0]}`}>
                          {average.toFixed(1)}
                        </span>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{getValueLabel(Math.round(average))}</p>
                          <p className="text-xs text-gray-500">{stat?.count || 0} registros</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gráfico de Rendimiento */}
              <div className="mb-6">
                <PerformanceChart
                  data={trends}
                  title="Tendencia de Rendimiento (Últimos 30 días)"
                />
              </div>

              {/* Lista de Registros */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Registros Recientes ({records.length})
                  </h4>
                  {canEditRecords && (
                    <span className="text-xs text-gray-500">
                      Puedes editar o eliminar registros
                    </span>
                  )}
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {records.slice(0, 20).map(record => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {getRecordTypeLabel(record.type)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getValueColor(record.value)}`}>
                              {getValueLabel(record.value)} ({record.value}/5)
                            </span>
                            <span className="text-xs text-gray-500">
                              {record.timestamp?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                            </span>
                          </div>
                          
                          {record.note && (
                            <p className="text-sm text-gray-700 mt-2">{record.note}</p>
                          )}
                        </div>

                        {canEditRecords && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded"
                              title="Editar registro"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                              title="Eliminar registro"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {records.length > 20 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      Mostrando los 20 registros más recientes de {records.length} total
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modales */}
      <EditRecordModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
        }}
        record={editingRecord}
        onSave={handleSaveEdit}
        isLoading={actionLoading}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRecord(null);
        }}
        onConfirm={handleConfirmDelete}
        record={deletingRecord}
        isLoading={actionLoading}
      />
    </div>
  );
}