import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Settings } from 'lucide-react';

export const MaintenanceMode: React.FC = () => {
  const { settings } = useSettings();

  if (!settings?.maintenanceMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings className="text-[#FF8C00]" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Under Maintenance</h1>
        <p className="text-gray-600 mb-6">
          {settings.storeName || 'Pujnam Store'} is currently undergoing maintenance.
          We'll be back soon!
        </p>
        <p className="text-sm text-gray-500">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
};
