import React, { useState } from 'react';
import {
  Server,
  Zap,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Activity,
  Radio,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import {
  BackendTelemetryResponse,
  HealthCheckReport,
} from '../services/backendService';

interface BackendBridgeBarProps {
  isConnected: boolean;
  telemetry: BackendTelemetryResponse | null;
  latencyMs: number | null;
  isLinkedToSpecimen: boolean;
  onToggleLink: () => void;
  onTriggerBreakdown: () => Promise<void>;
  onResetCooler: () => Promise<void>;
  onRunTest: () => Promise<HealthCheckReport>;
}

export const BackendBridgeBar: React.FC<BackendBridgeBarProps> = ({
  isConnected,
  telemetry,
  latencyMs,
  isLinkedToSpecimen,
  onToggleLink,
  onTriggerBreakdown,
  onResetCooler,
  onRunTest,
}) => {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testReport, setTestReport] = useState<HealthCheckReport | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleTrigger = async () => {
    try {
      setIsTriggering(true);
      await onTriggerBreakdown();
    } finally {
      setIsTriggering(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await onResetCooler();
    } finally {
      setIsResetting(false);
    }
  };

  const handleExecuteHealthCheck = async () => {
    setIsRunningTest(true);
    try {
      const report = await onRunTest();
      setTestReport(report);
    } finally {
      setIsRunningTest(false);
    }
  };

  const isDanger = telemetry?.status === 'DANGER';

  return (
    <>
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Backend Identity & Status */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                isConnected
                  ? isDanger
                    ? 'bg-red-950/80 border-red-500/60 text-red-400 shadow-lg shadow-red-950/50'
                    : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <Server className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  C++ Hardware Backend
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    isConnected
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected
                        ? isDanger
                          ? 'bg-red-400 animate-ping'
                          : 'bg-emerald-400 animate-pulse'
                        : 'bg-slate-500'
                    }`}
                  />
                  {isConnected ? 'ONLINE (Port 8080)' : 'OFFLINE'}
                </span>

                {latencyMs !== null && isConnected && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {latencyMs}ms RTT
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Socket service (`backend.cpp`) streaming real-time cooler thermal telemetry
              </p>
            </div>
          </div>

          {/* Middle: Live Values from C++ */}
          {isConnected && telemetry && (
            <div className="flex items-center gap-3 bg-slate-950/70 px-3.5 py-2 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] text-slate-400">Stream:</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    isDanger ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {telemetry.temperature.toFixed(1)}°C
                </span>
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <span
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                  isDanger
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isDanger ? <Flame className="w-3 h-3 text-red-400" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                {telemetry.status}
              </span>
            </div>
          )}

          {/* Right: Interactive Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sync Toggle */}
            <label
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 cursor-pointer hover:border-slate-700 transition-all select-none"
              title="When checked, cooler CC-001 temperature will reflect the live C++ backend"
            >
              <input
                type="checkbox"
                checked={isLinkedToSpecimen}
                onChange={onToggleLink}
                className="w-3.5 h-3.5 accent-cyan-500 rounded bg-slate-800"
              />
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>Link to Cooler CC-001</span>
            </label>

            {/* Trigger Breakdown */}
            <button
              onClick={handleTrigger}
              disabled={!isConnected || isTriggering}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-200 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-sm shadow-red-950/50"
              title="Call GET /trigger on C++ backend to simulate hardware compressor failure"
            >
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span>Breakdown (/trigger)</span>
            </button>

            {/* Reset Cooler */}
            <button
              onClick={handleReset}
              disabled={!isConnected || isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-sm shadow-emerald-950/50"
              title="Call GET /reset on C++ backend to restore safe refrigeration"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reset (/reset)</span>
            </button>

            {/* Run Integration Test Modal Button */}
            <button
              onClick={() => {
                setIsTestModalOpen(true);
                handleExecuteHealthCheck();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all active:scale-95 shadow-md shadow-cyan-950/60"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Test Connection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Backend Test Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    C++ Backend Integration Test Suite
                  </h3>
                  <p className="text-xs text-slate-400">
                    Target: Socket HTTP Server on Port 8080 (`backend.cpp`)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTestModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Test Steps */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Test Execution Steps</span>
                <span className="font-mono">
                  {isRunningTest ? 'Running tests...' : testReport ? `${testReport.totalDurationMs}ms total` : ''}
                </span>
              </div>

              {isRunningTest && !testReport && (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Executing endpoint handshakes & state validations...</p>
                </div>
              )}

              {testReport && (
                <div className="space-y-3">
                  {testReport.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all text-xs ${
                        step.passed
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-red-950/20 border-red-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {step.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <span className="font-bold text-slate-200">
                            {idx + 1}. {step.name}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {step.latencyMs}ms
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400 pl-6">
                        <div>
                          <span className="text-slate-500">Expected:</span>{' '}
                          <span className="text-slate-300 font-mono">{step.expectedStatus}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Received:</span>{' '}
                          <span className="font-mono font-medium text-slate-200">
                            {step.data
                              ? `temp: ${step.data.temperature.toFixed(2)}°C, status: "${step.data.status}"`
                              : step.error}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary Banner */}
                  <div
                    className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
                      testReport.overallPassed
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-red-950/40 border-red-500/50 text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {testReport.overallPassed ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          {testReport.overallPassed
                            ? 'All 3 Integration Tests Passed (100%)'
                            : 'Integration Test Failed'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {testReport.overallPassed
                            ? 'C++ Socket Server, Breakdown Triggers, and Reset endpoints fully operational.'
                            : 'Ensure backend.exe is running on port 8080.'}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700">
                      {testReport.steps.filter((s) => s.passed).length} / {testReport.steps.length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={handleExecuteHealthCheck}
                disabled={isRunningTest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRunningTest ? 'animate-spin' : ''}`} />
                Re-run Tests
              </button>

              <button
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
