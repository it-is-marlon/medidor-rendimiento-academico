import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function PerformanceChart({ 
  data, 
  title = "Tendencia de Rendimiento",
  height = 300,
  showLegend = true,
  showGrid = true,
  animate = true
}) {
  
  if (!data || (!data.participacion && !data.comportamiento && !data.puntualidad)) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin datos para mostrar</h3>
        <p className="mt-1 text-sm text-gray-500">No hay suficientes registros para generar el gráfico</p>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const labels = data.participacion?.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  }) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Participación',
        data: data.participacion?.map(item => item.value) || [],
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Comportamiento',
        data: data.comportamiento?.map(item => item.value) || [],
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Puntualidad',
        data: data.puntualidad?.map(item => item.value) || [],
        borderColor: 'rgb(168, 85, 247)', // purple-500
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      }
    ].filter(dataset => dataset.data.length > 0) // Solo mostrar datasets con datos
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animate ? {
      duration: 1000,
      easing: 'easeInOutQuart'
    } : false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `Fecha: ${context[0].label}`;
          },
          label: function(context) {
            const value = context.parsed.y;
            const labels = {
              1: 'Necesita apoyo',
              2: 'En desarrollo', 
              3: 'Satisfactorio',
              4: 'Destacado',
              5: 'Excelente'
            };
            return `${context.dataset.label}: ${value.toFixed(1)} - ${labels[Math.round(value)] || 'Sin calificar'}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        min: 0,
        max: 5,
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          callback: function(value) {
            const labels = {
              0: '0',
              1: '1 - Necesita apoyo',
              2: '2 - En desarrollo', 
              3: '3 - Satisfactorio',
              4: '4 - Destacado',
              5: '5 - Excelente'
            };
            return labels[value] || value;
          }
        }
      }
    },
    elements: {
      line: {
        borderWidth: 3
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
      
      {/* Leyenda de valores */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Escala de Evaluación:</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {[
            { value: 1, label: 'Necesita apoyo', color: 'bg-red-100 text-red-800' },
            { value: 2, label: 'En desarrollo', color: 'bg-orange-100 text-orange-800' },
            { value: 3, label: 'Satisfactorio', color: 'bg-yellow-100 text-yellow-800' },
            { value: 4, label: 'Destacado', color: 'bg-blue-100 text-blue-800' },
            { value: 5, label: 'Excelente', color: 'bg-green-100 text-green-800' }
          ].map(item => (
            <div key={item.value} className={`px-2 py-1 rounded text-center ${item.color}`}>
              <span className="font-semibold">{item.value}</span>
              <br />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}