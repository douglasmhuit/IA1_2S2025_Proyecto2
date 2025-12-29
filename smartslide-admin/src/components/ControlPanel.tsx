import React from 'react';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaSync, 
  FaHistory, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaRobot
} from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import type { SystemStatus } from '../types';

interface ControlPanelProps {
  status: SystemStatus;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  onStart,
  onPause,
  onStop,
  onRefresh,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('es-GT');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaRobot className="text-blue-500" />
          Control del Sistema
        </h2>
        <StatusBadge status={status.Status} size="lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Botones de Control */}
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Acciones</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={onStart}
              disabled={isLoading || status.Status === 'running'}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlay className="h-6 w-6" />
              <span>Iniciar</span>
            </button>
            
            <button
              onClick={onPause}
              disabled={isLoading || status.Status !== 'running'}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPause className="h-6 w-6" />
              <span>Pausar</span>
            </button>
            
            <button
              onClick={onStop}
              disabled={isLoading || status.Status === 'stopped'}
              className="bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaStop className="h-6 w-6" />
              <span>Detener</span>
            </button>
          </div>
          
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <FaSync className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar Estado
          </button>
        </div>

        {/* Información del Sistema */}
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Estado Actual</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <span className="text-gray-600">Iniciado:</span>
              </div>
              <span className="font-medium">
                {status.StartedAt ? formatDate(status.StartedAt) : 'No iniciado'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaHistory className="text-gray-400" />
                <span className="text-gray-600">Última diapositiva:</span>
              </div>
              <span className="font-medium">
                {formatDate(status.LastSlideAt)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaSync className="text-gray-400" />
                <span className="text-gray-600">Total capturadas:</span>
              </div>
              <span className="font-bold text-xl text-blue-600">
                {status.SlidesCaptured}
              </span>
            </div>
            
            {status.LastError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-red-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-red-700">Último Error:</h4>
                    <p className="text-sm text-red-600 mt-1">{status.LastError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;