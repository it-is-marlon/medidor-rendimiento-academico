import React, { useMemo } from 'react';

export function PerformanceChart({ records }) {
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return null;

    // Agrupar registros por fecha y tipo
    const groupedByDate = {};
    
    records.forEach(record => {
      const date = record.timestamp?.toDate?.()?.toLocaleDateString() || 'Fecha desconocida';
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = {
          participacion: [],
          comportamiento: [],
          puntualidad: []
        };
      }
      
      if (groupedByDate[date][record.type]) {
        groupedByDate[date][record.type].push(record.value);
      }
    });

    // Convertir a formato para el gráfico
    const chartEntries = Object.entries(groupedByDate)
      .map(([date, types]) => {
        const entry = { date };
        
        Object.keys(types).forEach(type => {
          if (types[type].length > 0) {
            entry[type] = types[type].reduce((sum, val) => sum + val, 0) / types[type].length;
          }
        });
        
        return entry;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10); // Últimos 10 días con datos

    return chartEntries;
  }, [records]);

  const getTypeColor = (type) => {
    const colors = {
      participacion: '#3b82f6', // blue-500
      comportamiento: '#10b981', // emerald-500
      puntualidad: '#f59e0b' // amber-500
    };
    return colors[type] || '#6b7280';
  };

  const getTypeLabel = (type) => {
    const labels = {
      participacion: 'Participación',
      comportamiento: 'Comportamiento',
      puntualidad: 'Puntualidad'
    };
    return labels[type] || type;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tendencia de Rendimiento
        </h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6zM9 3a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V3z" />
          </svg>
          <p className="text-gray-600">No hay datos suficientes para generar el gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Tendencia de Rendimiento (Últimos 10 días)
      </h3>
      
      <div className="space-y-4">
        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 text-sm">
          {['participacion', 'comportamiento', 'puntualidad'].map(type => (
            <div key={type} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getTypeColor(type) }}
              ></div>
              <span>{getTypeLabel(type)}</span>
            </div>
          ))}
        </div>

        {/* Gráfico Simple con CSS */}
        <div className="relative">
          <div className="h-64 border border-gray-200 rounded-lg p-4">
            {/* Líneas de referencia horizontales */}
            <div className="relative h-full">
              {[1, 2, 3, 4, 5].map(level => (
                <div 
                  key={level}
                  className="absolute w-full border-t border-gray-100"
                  style={{ 
                    bottom: `${((level - 1) / 4) * 100}%`,
                    left: 0
                  }}
                >
                  <span className="text-xs text-gray-400 -mt-2 inline-block">
                    {level}
                  </span>
                </div>
              ))}

              {/* Puntos de datos */}
              <div className="relative h-full flex items-end justify-between px-2">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex flex-col items-center space-y-1">
                    {/* Puntos para cada tipo */}
                    <div className="relative h-48 flex items-end justify-center space-x-1">
                      {['participacion', 'comportamiento', 'puntualidad'].map(type => {
                        const value = entry[type];
                        if (!value) return null;
                        
                        return (
                          <div
                            key={type}
                            className="w-2 rounded-t-sm transition-all duration-300 hover:opacity-75"
                            style={{ 
                              height: `${(value / 5) * 100}%`,
                              backgroundColor: getTypeColor(type)
                            }}
                            title={`${getTypeLabel(type)}: ${value.toFixed(1)}`}
                          ></div>
                        );
                      })}
                    </div>
                    
                    {/* Etiqueta de fecha */}
                    <span className="text-xs text-gray-500 text-center transform -rotate-45 whitespace-nowrap">
                      {entry.date.split('/').slice(0, 2).join('/')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen estadístico */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {['participacion', 'comportamiento', 'puntualidad'].map(type => {
            const values = chartData
              .map(entry => entry[type])
              .filter(val => val !== undefined);
            
            const average = values.length > 0 
              ? values.reduce((sum, val) => sum + val, 0) / values.length
              : 0;

            return (
              <div key={type} className="text-center">
                <div 
                  className="text-lg font-semibold"
                  style={{ color: getTypeColor(type) }}
                >
                  {average.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">
                  Promedio {getTypeLabel(type)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}