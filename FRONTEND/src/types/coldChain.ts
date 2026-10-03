export type BiologicalCategory =
  | 'ORGAN'
  | 'TISSUE'
  | 'VACCINE_ULT'
  | 'VACCINE_COLD'
  | 'BLOOD_PRODUCT';

export type AlertSeverity =
  | 'NORMAL'
  | 'WARNING'
  | 'CRITICAL_TEMP'
  | 'CRITICAL_TIME_EXPIRED';

export interface PreservationRule {
  id: string;
  name: string;
  category: BiologicalCategory;
  tempMinCelsius: number;
  tempMaxCelsius: number;
  maxPreservationMinutes: number; // Max Cold Ischemia Time (CIT) or safe storage duration
  warningPreservationMinutes: number; // Urgency trigger threshold (e.g., 80% of safe duration)
  freezeSensitive: boolean; // True if temperatures below 0°C cause irreversible damage
  clinicalNotes: string;
}

export interface TelemetryReading {
  timestamp: string; // ISO 8601 string
  temperatureCelsius: number;
  ambientTemperatureCelsius: number;
  batteryLevelPercent: number;
  coolerLidClosed: boolean;
  latitude?: number;
  longitude?: number;
}

export interface MonitoredSpecimen {
  id: string;
  trackingCode: string; // e.g. "ORG-HT-2026-0941"
  specimenName: string; // e.g. "Donor Heart (SCS Preservation)"
  rule: PreservationRule;
  startTime: string; // Time organ was cross-clamped or vaccine removed from storage (ISO 8601)
  originFacility: string;
  destinationFacility: string;
  courierNotes?: string;
  latestTelemetry: TelemetryReading;
  telemetryHistory: TelemetryReading[];
}

export interface EvaluationResult {
  specimenId: string;
  trackingCode: string;
  elapsedMinutes: number;
  remainingMinutes: number;
  isTimeExpired: boolean;
  isTimeWarning: boolean;
  isTempBreached: boolean;
  severity: AlertSeverity;
  alertMessages: string[];
}

export interface NotificationRecord {
  id: string;
  specimenId: string;
  trackingCode: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}
