import React from 'react';
import {
  Clock,
  Thermometer,
  Battery,
  Lock,
  LockOpen,
  AlertTriangle,
  HeartPulse,
  Syringe,
  MapPin,
  TrendingUp,
  TrendingDown,
  FastForward,
} from 'lucide-react';
import { MonitoredSpecimen, EvaluationResult } from '../types/coldChain';
import { formatMinutes, getPreservationTimePercent } from '../utils/alertEngine';

interface SpecimenCardProps {
  specimen: MonitoredSpecimen;
  evaluation: EvaluationResult;
  onAdvanceTime: (specimenId: string, minutes: number) => void;
  onShiftTemp: (specimenId: string, deltaCelsius: number) => void;
}

export const SpecimenCard: React.FC<SpecimenCardProps> = ({
  specimen,
  evaluation,
  onAdvanceTime,
  onShiftTemp,
}) => {
  const { rule, latestTelemetry } = specimen;
  const isExpired = evaluation.isTimeExpired;
  const isTimeWarning = evaluation.isTimeWarning;
  const isTempBreached = evaluation.isTempBreached;

  const progressPercent = getPreservationTimePercent(
    evaluation.elapsedMinutes,
    rule.maxPreservationMinutes
  );

  // Dynamic card border and glow styling
  const cardBorderClass = isExpired
    ? 'border-red-500 bg-red-950/20 animate-alert-ring'
    : isTempBreached
    ? 'border-amber-500 bg-amber-950/20'
    : isTimeWarning
    ? 'border-yellow-500/70 bg-yellow-950/10'
    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700';

  const isOrgan = rule.category === 'ORGAN' || rule.category === 'TISSUE';

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-xl backdrop-blur relative overflow-hidden ${cardBorderClass}`}
    >
      {/* Top Banner Alert if preservation breached */}
      {isExpired && (
        <div className="mb-4 -mx-5 -mt-5 bg-red-600/90 text-white px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>Cold Ischemia Time Exceeded — Viability Compromised!</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isOrgan
                ? 'bg-rose-950/60 border-rose-500/30 text-rose-400'
                : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400'
            }`}
          >
            {isOrgan ? <HeartPulse className="w-5 h-5" /> : <Syringe className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {specimen.trackingCode}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  rule.category === 'ORGAN'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {rule.category}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{specimen.specimenName}</h3>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {isExpired ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              EXPIRED
            </span>
          ) : isTempBreached ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              TEMP BREACH
            </span>
          ) : isTimeWarning ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              URGENT SLA
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              OPTIMAL
            </span>
          )}
        </div>
      </div>

      {/* Transit Locations */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="truncate">{specimen.originFacility}</span>
        <span className="text-slate-600">→</span>
        <span className="truncate font-medium text-slate-300">
          {specimen.destinationFacility}
        </span>
      </div>

      {/* Telemetry Core Grid: Temp & Preservation Time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* 1. Temperature Gauge */}
        <div
          className={`p-3 rounded-xl border ${
            isTempBreached
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-slate-950/50 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              Cooler Temp
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Limit: {rule.tempMinCelsius}° to {rule.tempMaxCelsius}°C
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-white font-mono">
              {latestTelemetry.temperatureCelsius.toFixed(1)}°C
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Ambient: {latestTelemetry.ambientTemperatureCelsius.toFixed(1)}°C
          </p>
        </div>

        {/* 2. Preservation Time Countdown */}
        <div
          className={`p-3 rounded-xl border ${
            isExpired
              ? 'bg-red-950/40 border-red-500/40 text-red-200'
              : isTimeWarning
              ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-200'
              : 'bg-slate-950/50 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {isExpired ? 'Time Expired By' : 'CIT Remaining'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Max: {formatMinutes(rule.maxPreservationMinutes)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black tracking-tight font-mono ${
                isExpired ? 'text-red-400' : isTimeWarning ? 'text-yellow-400' : 'text-white'
              }`}
            >
              {isExpired
                ? `+${formatMinutes(Math.abs(evaluation.remainingMinutes))}`
                : formatMinutes(evaluation.remainingMinutes)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Elapsed: {formatMinutes(evaluation.elapsedMinutes)}
          </p>
        </div>
      </div>

      {/* Progress Bar (Time Consumed) */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5 font-medium">
          <span>Preservation Time Consumed</span>
          <span className="font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isExpired
                ? 'bg-red-500'
                : isTimeWarning
                ? 'bg-yellow-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cooler Sub-Telemetry (Battery & Lid) */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
        <div className="flex items-center gap-1.5">
          <Battery className="w-3.5 h-3.5 text-slate-400" />
          <span>Battery:</span>
          <span className="font-mono text-slate-200">{latestTelemetry.batteryLevelPercent}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          {latestTelemetry.coolerLidClosed ? (
            <>
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Lid Sealed</span>
            </>
          ) : (
            <>
              <LockOpen className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-amber-400 font-medium">Lid Open!</span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Simulation Trigger Bar (For Judge / Test Demonstrations) */}
      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Simulate:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAdvanceTime(specimen.id, 60)}
            title="Advance Cold Ischemia Time by 1 hour"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
          >
            <FastForward className="w-3 h-3 text-indigo-400" />
            +1h CIT
          </button>
          <button
            onClick={() => onShiftTemp(specimen.id, 2.5)}
            title="Increase cooler temperature by 2.5°C"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
          >
            <TrendingUp className="w-3 h-3 text-red-400" />
            +2.5°C
          </button>
          <button
            onClick={() => onShiftTemp(specimen.id, -2.5)}
            title="Decrease cooler temperature by 2.5°C"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
          >
            <TrendingDown className="w-3 h-3 text-cyan-400" />
            -2.5°C
          </button>
        </div>
      </div>
    </div>
  );
};

