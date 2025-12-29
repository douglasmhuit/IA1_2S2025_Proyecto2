import React from 'react';
import { FaSlidersH, FaBell, FaCog, FaChartLine, FaFileAlt } from 'react-icons/fa';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  status: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const tabs = [
    { id: 'control', label: 'Control', icon: <FaSlidersH /> },
    { id: 'metrics', label: 'Métricas', icon: <FaChartLine /> },
    { id: 'config', label: 'Configuración', icon: <FaCog /> },
    { id: 'logs', label: 'Logs', icon: <FaFileAlt /> },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FaSlidersH className="h-8 w-8 text-blue-400 mr-3" />
              <span className="text-xl font-bold">SmartSlide Admin</span>
            </div>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Estado:</span>
              <div className={`h-3 w-3 rounded-full ${getStatusColor()}`} />
              <span className="text-sm font-medium capitalize">{status}</span>
            </div>
            
            <button className="p-2 rounded-full hover:bg-gray-700">
              <FaBell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;