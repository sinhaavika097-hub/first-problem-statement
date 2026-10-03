import React, { useState } from 'react';
import { useColdChainMonitor } from './hooks/useColdChainMonitor';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { SpecimenCard } from './components/SpecimenCard';
import { PreservationReferenceTable } from './components/PreservationReferenceTable';
import { AlertDrawer } from './components/AlertDrawer';
import { BackendBridgeBar } from './components/BackendBridgeBar';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const {
    specimens,
    evaluations,
    notifications,
    isSimulatingDrift,
    toggleSimulation,
    simulateTimeAdvance,
    simulateTempExcursion,
    acknowledgeNotification,
    clearAllNotifications,
    requestNotificationPermission,
    // Backend properties
    isBackendConnected,
    backendTelemetry,
    backendLatencyMs,
    isLinkedToBackend,
    toggleBackendLink,
    triggerBackendBreakdown,
    resetBackendCooler,
    runBackendHealthCheck,
  } = useColdChainMonitor();

  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'REFERENCE'>('MONITOR');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Sticky Navigation & Control Header */}
      <Header
        notifications={notifications}
        isSimulatingDrift={isSimulatingDrift}
        toggleSimulation={toggleSimulation}
        onRequestNotificationPermission={requestNotificationPermission}
        onOpenAlerts={() => setIsAlertDrawerOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* KPI Metrics Strip */}
        <MetricsOverview specimens={specimens} evaluations={evaluations} />

        {/* C++ Hardware Backend Telemetry & Control Bridge */}
        <BackendBridgeBar
          isConnected={isBackendConnected}
          telemetry={backendTelemetry}
          latencyMs={backendLatencyMs}
          isLinkedToSpecimen={isLinkedToBackend}
          onToggleLink={toggleBackendLink}
          onTriggerBreakdown={triggerBackendBreakdown}
          onResetCooler={resetBackendCooler}
          onRunTest={runBackendHealthCheck}
        />

        {/* Navigation Tabs (Live Monitoring vs Preservation Standards) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('MONITOR')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'MONITOR'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              Live Telemetry Grid ({specimens.length})
            </button>
            <button
              onClick={() => setActiveTab('REFERENCE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'REFERENCE'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Preservation Standards & Limits Catalog
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive hackathon demo controls enabled on cards</span>
          </div>
        </div>

        {/* Tab 1: Live Monitoring Grid */}
        {activeTab === 'MONITOR' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specimens.map((specimen) => (
                <SpecimenCard
                  key={specimen.id}
                  specimen={specimen}
                  evaluation={evaluations[specimen.id]}
                  isBackendLinked={isLinkedToBackend && specimen.id === 'specimen-001'}
                  onAdvanceTime={simulateTimeAdvance}
                  onShiftTemp={simulateTempExcursion}
                />
              ))}
            </div>

            {/* Quick Helper Note for Evaluators */}
            <div className="mt-8 p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="text-slate-200">How to test Requirement 3 (Preservation Time Breach Alarm):</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click the <span className="font-mono text-indigo-300 font-bold">+1h CIT</span> button on the Donor Heart card to push elapsed ischemia time over the 4-hour limit. An audible alarm, desktop popup, and pulsing red alert badge will trigger immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Preservation Standards & Time Span Table */}
        {activeTab === 'REFERENCE' && (
          <div>
            <PreservationReferenceTable />
          </div>
        )}
      </main>

      {/* Slide-over Incident Log / Notification Center */}
      <AlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        notifications={notifications}
        onAcknowledge={acknowledgeNotification}
        onClearAll={clearAllNotifications}
      />
    </div>
  );
};

export default App;
