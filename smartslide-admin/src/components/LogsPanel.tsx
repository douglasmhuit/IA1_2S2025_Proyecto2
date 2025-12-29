import React, { useState } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaTrash, 
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
}

interface LogsPanelProps {
  logs: LogEntry[];
  isLoading: boolean;
  onRefresh: () => void;
  onClear: () => void;
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs, isLoading, onRefresh, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARN': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'DEBUG': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'INFO': return <FaInfoCircle className="text-blue-500" />;
      case 'WARN': return <FaExclamationCircle className="text-yellow-500" />;
      case 'ERROR': return <FaTimesCircle className="text-red-500" />;
      case 'DEBUG': return <FaCheckCircle className="text-gray-500" />;
      default: return <FaInfoCircle className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaFilter className="text-blue-500" />
          Logs del Sistema
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Auto-refresh
            </label>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FaDownload />
            Actualizar
          </button>
          <button
            onClick={onClear}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <FaTrash />
            Limpiar
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterLevel === level
                    ? level === 'ALL' 
                      ? 'bg-gray-800 text-white'
                      : getLevelColor(level)
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Mostrando {filteredLogs.length} de {logs.length} logs
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-blue-500 rounded"></div>
              <span>INFO</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-yellow-500 rounded"></div>
              <span>WARN</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded"></div>
              <span>ERROR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="bg-gray-50 rounded-lg overflow-hidden border">
        <div className="overflow-y-auto max-h-[500px]">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay logs para mostrar con los filtros actuales
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nivel</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha/Hora</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fuente</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString('es-GT')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.source}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="font-mono whitespace-pre-wrap break-words">
                        {log.message}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Logs de ejemplo */}
      {logs.length === 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Logs de Ejemplo</h3>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-2">
            <div className="text-blue-600">[2024-01-15 10:30:15] INFO: Sistema SmartSlide iniciado correctamente</div>
            <div className="text-green-600">[2024-01-15 10:30:20] DEBUG: Cámara configurada en índice 0, resolución 1280x720</div>
            <div className="text-blue-600">[2024-01-15 10:31:05] INFO: Diapositiva #1 detectada (cambio: 0.45)</div>
            <div className="text-blue-600">[2024-01-15 10:31:07] INFO: OCR completado - 245 caracteres extraídos</div>
            <div className="text-green-600">[2024-01-15 10:31:08] DEBUG: Resumen generado con 3 puntos clave</div>
            <div className="text-green-600">[2024-01-15 10:31:09] DEBUG: Imagen enviada a Telegram exitosamente</div>
            <div className="text-yellow-600">[2024-01-15 10:32:15] WARN: Alto brillo detectado, ajustando exposición</div>
            <div className="text-blue-600">[2024-01-15 10:33:20] INFO: Diapositiva #2 detectada (cambio: 0.38)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPanel;