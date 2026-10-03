import React, { useState } from 'react';
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
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNACKNOWLEDGED' | 'ACKNOWLEDGED'>('ALL');

  if (!isOpen) return null;

  const unacknowledgedCount = notifications.filter((n) => !n.acknowledged).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterMode === 'UNACKNOWLEDGED') return !n.acknowledged;
    if (filterMode === 'ACKNOWLEDGED') return n.acknowledged;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-400 shadow-lg shadow-red-950/40">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Preservation Alarms & Incidents
                </h3>
                <p className="text-xs text-slate-400">
                  {unacknowledgedCount} unacknowledged incident
                  {unacknowledgedCount !== 1 ? 's' : ''} requiring review
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar & Clear Actions */}
          <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterMode === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilterMode('UNACKNOWLEDGED')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterMode === 'UNACKNOWLEDGED'
                    ? 'bg-red-950 text-red-300 border border-red-800/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active ({unacknowledgedCount})
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Incident List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-950/50">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Preservation Baseline Nominal</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  No active Cold Ischemia Time violations or temperature breaches recorded in this view.
                </p>
              </div>
            ) : (
              filteredNotifications.map((record) => {
                const isTimeExpired = record.severity === 'CRITICAL_TIME_EXPIRED';
                const isTempBreached = record.severity === 'CRITICAL_TEMP';

                return (
                  <div
                    key={record.id}
                    className={`rounded-2xl border p-4 text-xs transition-all shadow-md ${
                      record.acknowledged
                        ? 'bg-slate-950/40 border-slate-800/70 opacity-60'
                        : isTimeExpired
                        ? 'bg-gradient-to-b from-red-950/40 to-slate-950/80 border-red-500/60 shadow-lg shadow-red-950/30'
                        : isTempBreached
                        ? 'bg-gradient-to-b from-amber-950/30 to-slate-950/80 border-amber-500/60 shadow-lg shadow-amber-950/30'
                        : 'bg-gradient-to-b from-yellow-950/20 to-slate-950/80 border-yellow-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {isTimeExpired ? (
                          <div className="p-1 rounded bg-red-500/20 text-red-400">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        ) : isTempBreached ? (
                          <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                            <Thermometer className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded bg-yellow-500/20 text-yellow-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="font-mono font-bold text-slate-200">
                          {record.trackingCode}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed mb-3.5 font-medium pl-1">
                      {record.message}
                    </p>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded font-mono ${
                          isTimeExpired
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : isTempBreached
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        }`}
                      >
                        {record.severity.replace(/_/g, ' ')}
                      </span>

                      {!record.acknowledged ? (
                        <button
                          onClick={() => onAcknowledge(record.id)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-cyan-950 border border-slate-700/80 hover:border-cyan-700 transition-all active:scale-95 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Logged
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
