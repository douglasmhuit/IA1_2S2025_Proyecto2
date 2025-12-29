import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import Navbar from './components/Navbar';
import ControlPanel from './components/ControlPanel';
import MetricsPanel from './components/MetricsPanel';
import ConfigPanel from './components/ConfigPanel';
import LogsPanel from './components/LogsPanel';
import { systemAPI } from './services/api';
import type { SystemStatus, Config, MetricsData, LogEntry } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('control');
  const [status, setStatus] = useState<SystemStatus>({
    Status: 'stopped',
    StartedAt: '',
    LastSlideAt: '',
    SlidesCaptured: 0,
    LastError: ''
  });
  const [config, setConfig] = useState<Config | null>(null);
  const [metrics, setMetrics] = useState<MetricsData>({
    ocr_accuracy: 92.5,
    processing_time: 1.2,
    telegram_success_rate: 100,
    avg_change_score: 0.15,
    total_slides: 0,
    last_hour_slides: 0
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const data = await systemAPI.getStatus();
      setStatus(data);
      setMetrics(prev => ({
        ...prev,
        total_slides: data.SlidesCaptured,
        last_hour_slides: data.SlidesCaptured > 0 ? Math.floor(data.SlidesCaptured / 2) : 0
      }));
    } catch (error) {
      toast.error('Error al cargar estado del sistema');
    }
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await systemAPI.getConfig();
      setConfig(data);
      toast.success('Configuración cargada');
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSaveConfig = async (newConfig: Partial<Config>) => {
    try {
      setIsSaving(true);
      await systemAPI.updateConfig(newConfig);
      toast.success('Configuración guardada exitosamente');
      loadConfig();
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = async () => {
    try {
      await systemAPI.start();
      toast.success('Sistema iniciado');
      setTimeout(loadStatus, 1000);
    } catch (error) {
      toast.error('Error al iniciar sistema');
    }
  };

  const handlePause = async () => {
    try {
      await systemAPI.pause();
      toast.success('Sistema pausado');
      setTimeout(loadStatus, 1000);
    } catch (error) {
      toast.error('Error al pausar sistema');
    }
  };

  const handleStop = async () => {
    try {
      await systemAPI.stop();
      toast.success('Sistema detenido');
      setTimeout(loadStatus, 1000);
    } catch (error) {
      toast.error('Error al detener sistema');
    }
  };

  const loadLogs = useCallback(async () => {
    try {
      // Simulación - necesitarías implementar el endpoint
      const mockLogs: LogEntry[] = Array.from({ length: 20 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        level: ['INFO', 'WARN', 'ERROR', 'DEBUG'][Math.floor(Math.random() * 4)] as any,
        message: `Log entry ${i + 1}: System operation ${['started', 'completed', 'failed', 'warning'][Math.floor(Math.random() * 4)]}`,
        source: ['capture', 'ocr', 'telegram', 'system'][Math.floor(Math.random() * 4)]
      }));
      setLogs(mockLogs);
    } catch (error) {
      toast.error('Error al cargar logs');
    }
  }, []);

  const handleClearLogs = () => {
    setLogs([]);
    toast.success('Logs limpiados');
  };

  // Carga inicial
  useEffect(() => {
    loadStatus();
    loadConfig();
    loadLogs();

    // Auto-refresh cada 5 segundos
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, [loadStatus, loadConfig, loadLogs]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'control':
        return (
          <ControlPanel
            status={status}
            onStart={handleStart}
            onPause={handlePause}
            onStop={handleStop}
            onRefresh={loadStatus}
            isLoading={isLoading}
          />
        );
      case 'metrics':
        return (
          <MetricsPanel
            metrics={metrics}
            isLoading={isLoading}
            onRefresh={loadStatus}
          />
        );
      case 'config':
        return (
          <ConfigPanel
            config={config}
            onSave={handleSaveConfig}
            onLoad={loadConfig}
            isLoading={isLoading}
            isSaving={isSaving}
          />
        );
      case 'logs':
        return (
          <LogsPanel
            logs={logs}
            isLoading={isLoading}
            onRefresh={loadLogs}
            onClear={handleClearLogs}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <Navbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        status={status.Status}
      />

      <main className="container mx-auto px-4 py-8">
        {isLoading && activeTab !== 'control' ? (
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            SmartSlide Admin Panel © {new Date().getFullYear()} - Universidad San Carlos de Guatemala
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sistema de Captura Inteligente de Diapositivas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;