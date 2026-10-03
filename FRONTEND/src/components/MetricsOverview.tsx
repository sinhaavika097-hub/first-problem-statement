import React from 'react';
import {
  Clock,
  ThermometerSnowflake,
  ShieldCheck,
  Boxes,
} from 'lucide-react';
import { MonitoredSpecimen, EvaluationResult } from '../types/coldChain';

interface MetricsOverviewProps {
  specimens: MonitoredSpecimen[];
  evaluations: Record<string, EvaluationResult>;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  specimens,
  evaluations,
}) => {
  const total = specimens.length;

  let timeExpiredCount = 0;
  let tempBreachCount = 0;
  let warningCount = 0;
  let optimalCount = 0;

  specimens.forEach((s) => {
    const ev = evaluations[s.id];
    if (!ev) return;
    if (ev.isTimeExpired) {
      timeExpiredCount++;
    } else if (ev.isTempBreached) {
      tempBreachCount++;
    } else if (ev.isTimeWarning) {
      warningCount++;
    } else {
      optimalCount++;
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Transits */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur shadow-lg flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">Monitored Coolers</p>
          <p className="text-2xl font-black text-white font-mono mt-1">{total}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active transit containers</p>
        </div>
        <div className="p-3 bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 rounded-xl">
          <Boxes className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Cold Ischemia Time Expirations */}
      <div
        className={`border rounded-xl p-4 backdrop-blur shadow-lg flex items-center justify-between transition-colors ${
          timeExpiredCount > 0
            ? 'bg-red-950/40 border-red-500/50 shadow-red-950/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div>
          <p className="text-xs text-slate-400 font-medium">CIT Preservation Exceeded</p>
          <p
            className={`text-2xl font-black font-mono mt-1 ${
              timeExpiredCount > 0 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {timeExpiredCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Critical graft viability risk</p>
        </div>
        <div
          className={`p-3 rounded-xl border ${
            timeExpiredCount > 0
              ? 'bg-red-600 text-white border-red-500 animate-bounce'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Temperature Excursions */}
      <div
        className={`border rounded-xl p-4 backdrop-blur shadow-lg flex items-center justify-between transition-colors ${
          tempBreachCount > 0
            ? 'bg-amber-950/40 border-amber-500/50 shadow-amber-950/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div>
          <p className="text-xs text-slate-400 font-medium">Temperature Excursions</p>
          <p
            className={`text-2xl font-black font-mono mt-1 ${
              tempBreachCount > 0 ? 'text-amber-400' : 'text-white'
            }`}
          >
            {tempBreachCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Outside prescribed limits</p>
        </div>
        <div
          className={`p-3 rounded-xl border ${
            tempBreachCount > 0
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <ThermometerSnowflake className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Compliant Transits */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur shadow-lg flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">Compliant Coolers</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{optimalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {warningCount > 0 ? `${warningCount} nearing warning SLA` : 'Within safe parameters'}
          </p>
        </div>
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
