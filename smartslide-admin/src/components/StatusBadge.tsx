import React from 'react';
import { FaPlay, FaPause, FaStop, FaExclamationTriangle } from 'react-icons/fa';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          color: 'bg-green-500',
          icon: <FaPlay className="text-white" />,
          text: 'En ejecución',
          bgColor: 'bg-green-100 text-green-800'
        };
      case 'paused':
        return {
          color: 'bg-yellow-500',
          icon: <FaPause className="text-white" />,
          text: 'Pausado',
          bgColor: 'bg-yellow-100 text-yellow-800'
        };
      case 'stopped':
        return {
          color: 'bg-red-500',
          icon: <FaStop className="text-white" />,
          text: 'Detenido',
          bgColor: 'bg-red-100 text-red-800'
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: <FaExclamationTriangle className="text-white" />,
          text: 'Desconocido',
          bgColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor}`}>
      <div className={`rounded-full ${sizeClasses[size]} flex items-center justify-center mr-2`}>
        {config.icon}
      </div>
      {config.text}
    </div>
  );
};

export default StatusBadge;