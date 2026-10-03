import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MonitoredSpecimen,
  EvaluationResult,
  NotificationRecord,
} from '../types/coldChain';
import { INITIAL_MOCK_SPECIMENS } from '../data/preservationCatalog';
import { evaluateSpecimenStatus } from '../utils/alertEngine';
import { notificationService } from '../services/notificationService';
import {
  backendService,
  BackendTelemetryResponse,
  HealthCheckReport,
} from '../services/backendService';

export function useColdChainMonitor() {
  const [specimens, setSpecimens] = useState<MonitoredSpecimen[]>(INITIAL_MOCK_SPECIMENS);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isSimulatingDrift, setIsSimulatingDrift] = useState<boolean>(true);

  // C++ Backend state
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [backendTelemetry, setBackendTelemetry] = useState<BackendTelemetryResponse | null>(null);
  const [backendLatencyMs, setBackendLatencyMs] = useState<number | null>(null);
  const [isLinkedToBackend, setIsLinkedToBackend] = useState<boolean>(true);

  // 1. Live Ticking Clock (runs every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Evaluate all specimens against current time
  const evaluations: Record<string, EvaluationResult> = useMemo(() => {
    const map: Record<string, EvaluationResult> = {};
    for (const specimen of specimens) {
      map[specimen.id] = evaluateSpecimenStatus(specimen, currentTime);
    }
    return map;
  }, [specimens, currentTime]);

  // 3. Monitor breaches and trigger notifications
  useEffect(() => {
    specimens.forEach((specimen) => {
      const evalResult = evaluations[specimen.id];
      if (!evalResult) return;

      if (evalResult.isTimeExpired || evalResult.isTempBreached || evalResult.isTimeWarning) {
        const title = `${specimen.specimenName} (${specimen.trackingCode})`;
        const primaryMessage = evalResult.alertMessages[0] || 'Condition excursion detected';

        const record = notificationService.notify(
          specimen.id,
          specimen.trackingCode,
          evalResult.severity,
          title,
          primaryMessage
        );

        setNotifications((prev) => {
          // Avoid duplicate entries with exact same message within 1 minute
          const exists = prev.some(
            (n) =>
              n.specimenId === specimen.id &&
              n.message === primaryMessage &&
              Date.now() - new Date(n.timestamp).getTime() < 60000
          );
          if (exists) return prev;
          return [record, ...prev].slice(0, 50); // Keep latest 50 notifications
        });
      }
    });
  }, [evaluations, specimens]);

  // 4. Subtle sensor drift simulation (every 4 seconds if enabled)
  useEffect(() => {
    if (!isSimulatingDrift) return;
    const interval = setInterval(() => {
      setSpecimens((prev) =>
        prev.map((s) => {
          // If this specimen is actively linked to the live C++ backend stream, do not drift it artificially
          if (s.id === 'specimen-001' && isLinkedToBackend && isBackendConnected) {
            return s;
          }
          // Small random drift of +/- 0.1°C
          const drift = (Math.random() - 0.48) * 0.15;
          const newTemp = Math.round((s.latestTelemetry.temperatureCelsius + drift) * 10) / 10;
          return {
            ...s,
            latestTelemetry: {
              ...s.latestTelemetry,
              temperatureCelsius: newTemp,
              timestamp: new Date().toISOString(),
            },
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isSimulatingDrift, isLinkedToBackend, isBackendConnected]);

  // 5. Live C++ Backend Polling (runs every 2.5 seconds)
  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const { telemetry, latencyMs } = await backendService.getTelemetry();
        if (!isMounted) return;

        setIsBackendConnected(true);
        setBackendTelemetry(telemetry);
        setBackendLatencyMs(latencyMs);

        // Feed live telemetry to linked specimen (specimen-001)
        if (isLinkedToBackend) {
          setSpecimens((prev) =>
            prev.map((s) => {
              if (s.id !== 'specimen-001') return s;
              const newTemp = Math.round(telemetry.temperature * 10) / 10;
              return {
                ...s,
                latestTelemetry: {
                  ...s.latestTelemetry,
                  temperatureCelsius: newTemp,
                  timestamp: new Date().toISOString(),
                },
              };
            })
          );
        }
      } catch {
        if (!isMounted) return;
        setIsBackendConnected(false);
      }
    };

    poll();
    const interval = setInterval(poll, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLinkedToBackend]);

  // Actions
  const triggerBackendBreakdown = useCallback(async () => {
    try {
      const { telemetry, latencyMs } = await backendService.triggerBreakdown();
      setIsBackendConnected(true);
      setBackendTelemetry(telemetry);
      setBackendLatencyMs(latencyMs);
      if (isLinkedToBackend) {
        setSpecimens((prev) =>
          prev.map((s) => {
            if (s.id !== 'specimen-001') return s;
            return {
              ...s,
              latestTelemetry: {
                ...s.latestTelemetry,
                temperatureCelsius: Math.round(telemetry.temperature * 10) / 10,
                timestamp: new Date().toISOString(),
              },
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed to trigger backend breakdown', err);
    }
  }, [isLinkedToBackend]);

  const resetBackendCooler = useCallback(async () => {
    try {
      const { telemetry, latencyMs } = await backendService.resetCooler();
      setIsBackendConnected(true);
      setBackendTelemetry(telemetry);
      setBackendLatencyMs(latencyMs);
      if (isLinkedToBackend) {
        setSpecimens((prev) =>
          prev.map((s) => {
            if (s.id !== 'specimen-001') return s;
            return {
              ...s,
              latestTelemetry: {
                ...s.latestTelemetry,
                temperatureCelsius: Math.round(telemetry.temperature * 10) / 10,
                timestamp: new Date().toISOString(),
              },
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed to reset backend cooler', err);
    }
  }, [isLinkedToBackend]);

  const runBackendHealthCheck = useCallback(async (): Promise<HealthCheckReport> => {
    return await backendService.runHealthCheck();
  }, []);

  const toggleBackendLink = useCallback(() => {
    setIsLinkedToBackend((v) => !v);
  }, []);

  const simulateTimeAdvance = useCallback((specimenId: string, additionalMinutes: number) => {
    setSpecimens((prev) =>
      prev.map((s) => {
        if (s.id !== specimenId) return s;
        const currentStart = new Date(s.startTime);
        currentStart.setMinutes(currentStart.getMinutes() - additionalMinutes);
        return {
          ...s,
          startTime: currentStart.toISOString(),
        };
      })
    );
  }, []);

  const simulateTempExcursion = useCallback((specimenId: string, deltaCelsius: number) => {
    setSpecimens((prev) =>
      prev.map((s) => {
        if (s.id !== specimenId) return s;
        const newTemp =
          Math.round((s.latestTelemetry.temperatureCelsius + deltaCelsius) * 10) / 10;
        return {
          ...s,
          latestTelemetry: {
            ...s.latestTelemetry,
            temperatureCelsius: newTemp,
            timestamp: new Date().toISOString(),
          },
        };
      })
    );
  }, []);

  const acknowledgeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, acknowledged: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsSimulatingDrift((v) => !v);
  }, []);

  return {
    specimens,
    evaluations,
    notifications,
    currentTime,
    isSimulatingDrift,
    toggleSimulation,
    simulateTimeAdvance,
    simulateTempExcursion,
    acknowledgeNotification,
    clearAllNotifications,
    // Backend integration
    isBackendConnected,
    backendTelemetry,
    backendLatencyMs,
    isLinkedToBackend,
    toggleBackendLink,
    triggerBackendBreakdown,
    resetBackendCooler,
    runBackendHealthCheck,
    requestNotificationPermission: () => notificationService.requestPermission(),
  };
}
