import React from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';
import { NotificationRecord } from '../types/coldChain';

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationRecord[];
  onAcknowledge: (id: string) => void;
  onClearAll: () => void;
}

export const AlertDrawer: React.FC<AlertDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onAcknowledge,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const unacknowledgedCount = notifications.filter((n) => !n.acknowledged).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Active Alarm & Incident Log</h3>
                <p className="text-xs text-slate-400">
                  {unacknowledgedCount} unacknowledged preservation breach
                  {unacknowledgedCount !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Toolbar */}
          {notifications.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Total logged incidents: {notifications.length}
              </span>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Log
              </button>
            </div>
          )}

          {/* Incident List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">All Coolers Secure</h4>
                <p className="text-xs text-slate-400">
                  No active preservation SLA breaches or temperature excursions detected.
                </p>
              </div>
            ) : (
              notifications.map((record) => {
                const isTimeExpired = record.severity === 'CRITICAL_TIME_EXPIRED';
                const isTempBreached = record.severity === 'CRITICAL_TEMP';

                return (
                  <div
                    key={record.id}
                    className={`rounded-xl border p-4 text-xs transition-all ${
                      record.acknowledged
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : isTimeExpired
                        ? 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-950/30'
                        : isTempBreached
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/30'
                        : 'bg-yellow-950/20 border-yellow-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {isTimeExpired ? (
                          <Clock className="w-4 h-4 text-red-400 shrink-0" />
                        ) : isTempBreached ? (
                          <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                        )}
                        <span className="font-mono font-bold text-slate-200">
                          {record.trackingCode}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed mb-3 font-medium">
                      {record.message}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isTimeExpired
                            ? 'bg-red-500/20 text-red-300'
                            : isTempBreached
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {record.severity.replace(/_/g, ' ')}
                      </span>

                      {!record.acknowledged ? (
                        <button
                          onClick={() => onAcknowledge(record.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
