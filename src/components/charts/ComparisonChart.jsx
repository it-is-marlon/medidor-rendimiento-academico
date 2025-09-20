import React from 'react';

export function ComparisonChart({ studentStats, courseStats, courseName }) {
  const categories = ['participacion', 'comportamiento', 'puntualidad'];
  
  const getTypeLabel = (type) => {
    const labels = {
      participacion: 'Participación',
      comportamiento: 'Comportamiento',
      puntualidad: 'Puntualidad'
    };
    return labels[type] || type;
  };

  const getColor = (studentAvg, courseAvg) => {
    if (!studentAvg || !courseAvg) return 'bg-gray-400';
    
    const difference = studentAvg - courseAvg;
    if (Math.abs(difference) < 0.2) return 'bg-blue-500';
    if (difference > 0) return 'bg-green-500';
    return 'bg-orange-500';
  };

  const getTextColor = (studentAvg, courseAvg) => {
    if (!studentAvg || !courseAvg) return 'text-gray-600';
    
    const difference = studentAvg - courseAvg;
    if (Math.abs(difference) < 0.2) return 'text-blue-600';
    if (difference > 0) return 'text-green-600';
    return 'text-orange-600';
  };

  const getComparisonText = (studentAvg, courseAvg) => {
    if (!studentAvg || !courseAvg) return 'Sin datos';
    
    const difference = studentAvg - courseAvg;
    if (Math.abs(difference) < 0.2) return 'En línea con el promedio';
    if (difference > 0) return 'Sobre el promedio';
    return 'Necesita apoyo adicional';
  };

  const hasData = studentStats && courseStats && 
    Object.values(studentStats).some(stat => stat.count > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Comparación con el Promedio del Curso
        </h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6zM9 3a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V3z" />
          </svg>
          <p className="text-gray-600">No hay datos para comparar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Comparación con el Promedio del Curso
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        {courseName}
      </p>

      <div className="space-y-6">
        {categories.map(category => {
          const studentAvg = studentStats[category]?.average || 0;
          const courseAvg = courseStats[category]?.average || 0;
          const studentCount = studentStats[category]?.count || 0;
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">
                  {getTypeLabel(category)}
                </h4>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">
                    Mi hijo(a): <strong>{studentAvg.toFixed(1)}</strong>
                  </span>
                  <span className="text-gray-600">
                    Curso: <strong>{courseAvg.toFixed(1)}</strong>
                  </span>
                </div>
              </div>

              {/* Gráfico de barras comparativo */}
              <div className="space-y-2">
                {/* Barra del estudiante */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 w-16">Mi hijo(a)</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${getColor(studentAvg, courseAvg)}`}
                      style={{ width: `${(studentAvg / 5) * 100}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {studentAvg.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Barra del curso */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 w-16">Promedio</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div
                      className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(courseAvg / 5) * 100}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {courseAvg.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interpretación */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getTextColor(studentAvg, courseAvg)}`}>
                  {getComparisonText(studentAvg, courseAvg)}
                </span>
                <span className="text-xs text-gray-500">
                  {studentCount} registro(s)
                </span>
              </div>

              {/* Separador */}
              {category !== categories[categories.length - 1] && (
                <div className="border-b border-gray-100"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumen general */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Interpretación General</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Sobre el promedio: Rendimiento destacado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>En línea con el promedio: Rendimiento esperado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Necesita apoyo: Oportunidad de mejora</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}