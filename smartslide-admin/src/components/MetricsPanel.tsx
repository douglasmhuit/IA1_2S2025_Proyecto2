import React from 'react';
import { 
  FaChartLine, 
  FaClock, 
  FaCheckCircle, 
  FaPercentage, 
  FaImage,
  FaRocket,
  FaSync
} from 'react-icons/fa';

interface MetricsData {
  ocr_accuracy: number;
  processing_time: number;
  telegram_success_rate: number;
  avg_change_score: number;
  total_slides: number;
  last_hour_slides: number;
}

interface MetricsPanelProps {
  metrics: MetricsData;
  isLoading: boolean;
  onRefresh: () => void;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, isLoading, onRefresh }) => {
  const metricCards = [
    {
      title: 'Precisión OCR',
      value: `${metrics.ocr_accuracy}%`,
      icon: <FaPercentage className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
      description: 'Tasa de reconocimiento correcto'
    },
    {
      title: 'Tiempo Procesamiento',
      value: `${metrics.processing_time}s`,
      icon: <FaClock className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
      description: 'Promedio por diapositiva'
    },
    {
      title: 'Éxito Telegram',
      value: `${metrics.telegram_success_rate}%`,
      icon: <FaCheckCircle className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-50',
      description: 'Envios exitosos'
    },
    {
      title: 'Sensibilidad Cambio',
      value: metrics.avg_change_score.toFixed(3),
      icon: <FaChartLine className="h-6 w-6 text-orange-500" />,
      color: 'bg-orange-50',
      description: 'Promedio detección'
    },
    {
      title: 'Total Diapositivas',
      value: metrics.total_slides.toString(),
      icon: <FaImage className="h-6 w-6 text-indigo-500" />,
      color: 'bg-indigo-50',
      description: 'Acumulado total'
    },
    {
      title: 'Última Hora',
      value: metrics.last_hour_slides.toString(),
      icon: <FaRocket className="h-6 w-6 text-red-500" />,
      color: 'bg-red-50',
      description: 'Diapositivas/hora'
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaChartLine className="text-blue-500" />
          Métricas en Tiempo Real
        </h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <FaSync className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-xl p-5 border transition-transform hover:scale-105 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">{card.title}</h3>
              {card.icon}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{card.value}</div>
            <p className="text-sm text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Gráficos simulados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Actividad Reciente</h3>
          <div className="h-48 flex items-end gap-1">
            {[30, 45, 60, 35, 70, 55, 80, 65, 40, 75].map((height, index) => (
              <div
                key={index}
                className="flex-1 bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Últimas 10 diapositivas procesadas
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Distribución de Tiempos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Captura</span>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
              </div>
              <span className="font-medium">0.3s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">OCR</span>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }} />
              </div>
              <span className="font-medium">0.5s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Envío</span>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
              <span className="font-medium">0.2s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;