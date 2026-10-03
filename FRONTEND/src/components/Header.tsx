import React from 'react';
import {
  Bell,
  Play,
  Pause,
  ThermometerSnowflake,
  Volume2,
} from 'lucide-react';
import { NotificationRecord } from '../types/coldChain';

interface HeaderProps {
  notifications: NotificationRecord[];
  isSimulatingDrift: boolean;
  toggleSimulation: () => void;
  onRequestNotificationPermission: () => Promise<boolean>;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  isSimulatingDrift,
  toggleSimulation,
  onRequestNotificationPermission,
  onOpenAlerts,
}) => {
  const unreadAlertsCount = notifications.filter((n) => !n.acknowledged).length;
  const hasCritical = notifications.some(
    (n) => !n.acknowledged && (n.severity === 'CRITICAL_TIME_EXPIRED' || n.severity === 'CRITICAL_TEMP')
  );

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Clinical System Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-lg shadow-cyan-950/50">
            <ThermometerSnowflake className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                ColdChain <span className="text-cyan-400">Guardian</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Lab Specimen, Vaccine & Organ Preservation SLA Engine
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simulation Toggle */}
          <button
            onClick={toggleSimulation}
            title={isSimulatingDrift ? 'Pause Sensor Drift' : 'Resume Sensor Drift'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {isSimulatingDrift ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Drift: ON</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Drift: OFF</span>
              </>
            )}
          </button>

          {/* Sound / Notification Enable Button */}
          <button
            onClick={onRequestNotificationPermission}
            title="Enable Desktop Alerts & Audio Alarm"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/40 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enable Audio/Alarms</span>
          </button>

          {/* Alert Notification Drawer Trigger */}
          <button
            onClick={onOpenAlerts}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              hasCritical
                ? 'bg-red-950/80 text-red-200 border-red-500/60 shadow-lg shadow-red-950/50 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Bell className={`w-4 h-4 ${hasCritical ? 'text-red-400 animate-bounce' : 'text-slate-400'}`} />
            <span>Incidents</span>
            {unreadAlertsCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  hasCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
