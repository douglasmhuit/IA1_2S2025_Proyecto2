import React, { useState, useEffect } from 'react';
import { FaSave, FaDownload, FaCamera, FaRobot, FaTelegram, FaMagic, FaCog } from 'react-icons/fa';
import type { Config } from '../types';

interface ConfigPanelProps {
  config: Config | null;
  onSave: (config: Partial<Config>) => void;
  onLoad: () => void;
  isLoading: boolean;
  isSaving: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onSave,
  onLoad,
  isLoading,
  isSaving
}) => {
  const [formData, setFormData] = useState<Partial<Config>>({
    sensitivity: 0.08,
    min_seconds_between_slides: 2,
    capture_fps: 5,
    enable_annotation: true,
    max_caption_chars: 900,
    tesseract_lang: 'spa',
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleChange = (key: keyof Config, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const sections = [
    {
      title: 'Captura de Video',
      icon: <FaCamera className="text-blue-500" />,
      fields: [
        {
          key: 'camera_index' as keyof Config,
          label: 'Índice de Cámara',
          type: 'number',
          min: 0,
          max: 10,
          step: 1
        },
        {
          key: 'capture_fps' as keyof Config,
          label: 'FPS de Captura',
          type: 'number',
          min: 1,
          max: 30,
          step: 1
        },
      ]
    },
    {
      title: 'Detección',
      icon: <FaRobot className="text-green-500" />,
      fields: [
        {
          key: 'sensitivity' as keyof Config,
          label: 'Sensibilidad (0.01-0.5)',
          type: 'range',
          min: 0.01,
          max: 0.5,
          step: 0.01
        },
        {
          key: 'min_seconds_between_slides' as keyof Config,
          label: 'Segundos mínimos entre diapositivas',
          type: 'number',
          min: 1,
          max: 10,
          step: 1
        },
      ]
    },
    {
      title: 'Telegram',
      icon: <FaTelegram className="text-blue-400" />,
      fields: [
        {
          key: 'telegram_chat_id' as keyof Config,
          label: 'Chat ID',
          type: 'text',
          placeholder: '-1001234567890'
        },
      ]
    },
    {
      title: 'Procesamiento',
      icon: <FaMagic className="text-purple-500" />,
      fields: [
        {
          key: 'tesseract_lang' as keyof Config,
          label: 'Idioma OCR',
          type: 'select',
          options: [
            { value: 'spa', label: 'Español' },
            { value: 'eng', label: 'Inglés' },
            { value: 'spa+eng', label: 'Español+Inglés' },
          ]
        },
        {
          key: 'enable_annotation' as keyof Config,
          label: 'Habilitar anotaciones',
          type: 'checkbox'
        },
        {
          key: 'max_caption_chars' as keyof Config,
          label: 'Máximo caracteres en resumen',
          type: 'number',
          min: 100,
          max: 2000,
          step: 50
        },
      ]
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCog className="text-blue-500" />
          Configuración del Sistema
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onLoad}
            disabled={isLoading}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FaDownload />
            Cargar Actual
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FaSave />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                {section.icon}
                <h3 className="text-lg font-semibold text-gray-700">{section.title}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    
                    {field.type === 'range' && 'min' in field && 'max' in field && 'step' in field && (
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={formData[field.key] as number || 0}
                          onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{field.min}</span>
                          <span className="font-bold">{formData[field.key]}</span>
                          <span>{field.max}</span>
                        </div>
                      </div>
                    )}
                    
                    {field.type === 'number' && 'min' in field && 'max' in field && 'step' in field && (
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={formData[field.key] as number || 0}
                        onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                    
                    {field.type === 'text' && 'placeholder' in field && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.key] as string || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                    
                    {field.type === 'select' && 'options' in field && field.options && (
                      <select
                        value={formData[field.key] as string || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!formData[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.checked)}
                          className="h-5 w-5 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">Activar esta funcionalidad</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default ConfigPanel;