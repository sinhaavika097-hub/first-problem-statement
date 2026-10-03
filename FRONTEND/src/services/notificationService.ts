import { AlertSeverity, NotificationRecord } from '../types/coldChain';

class ColdChainNotificationService {
  private hasPermission = false;
  private audioCtx: AudioContext | null = null;
  private lastAlertTimestamp: Record<string, number> = {};
  private readonly THROTTLE_MS = 30000; // Throttle duplicate popups per specimen to once every 30s

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  /**
   * Request browser permission to show system desktop notifications.
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  isPermissionGranted(): boolean {
    return this.hasPermission;
  }

  /**
   * Issue a notification for a preservation or temperature breach.
   */
  notify(
    specimenId: string,
    trackingCode: string,
    severity: AlertSeverity,
    title: string,
    message: string
  ): NotificationRecord {
    const record: NotificationRecord = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      specimenId,
      trackingCode,
      severity,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    const now = Date.now();
    const lastTime = this.lastAlertTimestamp[specimenId] || 0;
    const shouldDispatchSystemNotice = now - lastTime > this.THROTTLE_MS;

    if (shouldDispatchSystemNotice) {
      this.lastAlertTimestamp[specimenId] = now;

      // 1. Dispatch Web Desktop Notification
      if (this.hasPermission && 'Notification' in window) {
        try {
          const iconPrefix =
            severity === 'CRITICAL_TIME_EXPIRED' || severity === 'CRITICAL_TEMP'
              ? '🚨 [CRITICAL]'
              : '⚠️ [WARNING]';

          new Notification(`${iconPrefix} ${title}`, {
            body: message,
            tag: `coldchain-${specimenId}`,
            requireInteraction: severity === 'CRITICAL_TIME_EXPIRED',
          });
        } catch {
          // Fallback if browser blocks constructor
        }
      }

      // 2. Play audible alarm tone for critical incidents
      if (severity === 'CRITICAL_TIME_EXPIRED' || severity === 'CRITICAL_TEMP') {
        this.playEmergencyAlarm();
      } else if (severity === 'WARNING') {
        this.playWarningChime();
      }
    }

    return record;
  }

  /**
   * Generates a two-tone emergency alarm using Web Audio API.
   */
  private playEmergencyAlarm() {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      // Alternate 880Hz (A5) and 659Hz (E5)
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(659, now + 0.15);
      osc.frequency.setValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio playback may be restricted until first user interaction
    }
  }

  /**
   * Generates a softer single-tone chime for warnings.
   */
  private playWarningChime() {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5 note

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // User gesture restrictions
    }
  }
}

export const notificationService = new ColdChainNotificationService();
