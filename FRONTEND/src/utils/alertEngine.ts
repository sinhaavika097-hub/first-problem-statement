import {
  MonitoredSpecimen,
  EvaluationResult,
  AlertSeverity,
} from '../types/coldChain';

/**
 * Evaluates a specimen against its preservation rule and latest telemetry.
 */
export function evaluateSpecimenStatus(
  specimen: MonitoredSpecimen,
  currentTime: Date = new Date()
): EvaluationResult {
  const { rule, startTime, latestTelemetry } = specimen;
  const start = new Date(startTime).getTime();
  const now = currentTime.getTime();

  // Elapsed duration in minutes
  const elapsedMinutes = Math.max(0, Math.floor((now - start) / (1000 * 60)));
  const remainingMinutes = rule.maxPreservationMinutes - elapsedMinutes;

  const isTimeExpired = remainingMinutes <= 0;
  const isTimeWarning =
    !isTimeExpired && elapsedMinutes >= rule.warningPreservationMinutes;

  const currentTemp = latestTelemetry.temperatureCelsius;
  const isOverTemp = currentTemp > rule.tempMaxCelsius;
  const isUnderTemp = currentTemp < rule.tempMinCelsius;
  const isTempBreached = isOverTemp || isUnderTemp;

  const alertMessages: string[] = [];
  let severity: AlertSeverity = 'NORMAL';

  // 1. Check Cold Ischemia / Preservation Duration
  if (isTimeExpired) {
    severity = 'CRITICAL_TIME_EXPIRED';
    const overageMinutes = Math.abs(remainingMinutes);
    alertMessages.push(
      `PRESERVATION TIME EXCEEDED: Safe limit (${rule.maxPreservationMinutes}m) exceeded by ${overageMinutes}m. Graft viability at critical risk!`
    );
  } else if (isTimeWarning) {
    severity = 'WARNING';
    alertMessages.push(
      `APPROACHING CIT LIMIT: Only ${remainingMinutes}m remaining before safe preservation threshold.`
    );
  }

  // 2. Check Temperature Excursions
  if (isTempBreached) {
    // If not already flagged as time-expired, set severity to temperature breach
    if (severity !== 'CRITICAL_TIME_EXPIRED') {
      severity = 'CRITICAL_TEMP';
    }

    if (isOverTemp) {
      alertMessages.push(
        `HIGH TEMP BREACH: ${currentTemp.toFixed(1)}°C (Safe maximum: ${rule.tempMaxCelsius}°C).`
      );
    } else if (isUnderTemp) {
      const freezeWarning =
        rule.freezeSensitive && currentTemp <= 0
          ? ' [CRITICAL FREEZE: Inactivates proteins/adjuvants!]'
          : '';
      alertMessages.push(
        `LOW TEMP BREACH: ${currentTemp.toFixed(1)}°C (Safe minimum: ${rule.tempMinCelsius}°C).${freezeWarning}`
      );
    }
  }

  return {
    specimenId: specimen.id,
    trackingCode: specimen.trackingCode,
    elapsedMinutes,
    remainingMinutes,
    isTimeExpired,
    isTimeWarning,
    isTempBreached,
    severity,
    alertMessages,
  };
}

/**
 * Formats a duration in minutes into a human-readable string (e.g. "3h 45m" or "12m").
 */
export function formatMinutes(minutes: number): string {
  const absMin = Math.abs(minutes);
  const days = Math.floor(absMin / (60 * 24));
  const hours = Math.floor((absMin % (60 * 24)) / 60);
  const mins = absMin % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Calculates percentage of preservation time consumed (0% to 100%+).
 */
export function getPreservationTimePercent(
  elapsedMinutes: number,
  maxPreservationMinutes: number
): number {
  if (maxPreservationMinutes <= 0) return 100;
  return Math.min(100, Math.round((elapsedMinutes / maxPreservationMinutes) * 100));
}
