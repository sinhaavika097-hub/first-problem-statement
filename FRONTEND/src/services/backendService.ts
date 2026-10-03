export interface BackendTelemetryResponse {
  temperature: number;
  status: 'SAFE' | 'DANGER';
}

export interface HealthCheckStep {
  name: string;
  endpoint: string;
  expectedStatus: string;
  passed: boolean;
  latencyMs: number;
  data?: any;
  error?: string;
}

export interface HealthCheckReport {
  overallPassed: boolean;
  totalDurationMs: number;
  steps: HealthCheckStep[];
  timestamp: string;
}

// Prefer relative Vite proxy (/api/backend) which works locally AND across Cloudflare tunnels,
// with direct fallback to http://localhost:8080
const API_BASE = '/api/backend';
const DIRECT_FALLBACK = 'http://localhost:8080';

async function requestWithFallback<T>(path: string): Promise<{ data: T; latencyMs: number }> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = (await res.json()) as T;
    const latencyMs = Math.round(performance.now() - start);
    return { data, latencyMs };
  } catch (primaryErr) {
    // If proxied fetch failed (e.g. running outside vite), try direct localhost:8080
    try {
      const fallbackRes = await fetch(`${DIRECT_FALLBACK}${path}`, {
        headers: { Accept: 'application/json' },
      });
      if (!fallbackRes.ok) throw new Error(`HTTP error ${fallbackRes.status}`);
      const data = (await fallbackRes.json()) as T;
      const latencyMs = Math.round(performance.now() - start);
      return { data, latencyMs };
    } catch {
      throw primaryErr;
    }
  }
}

export const backendService = {
  /**
   * Fetch current live cooler telemetry from the C++ backend
   */
  async getTelemetry(): Promise<{ telemetry: BackendTelemetryResponse; latencyMs: number }> {
    const { data, latencyMs } = await requestWithFallback<BackendTelemetryResponse>('/');
    return { telemetry: data, latencyMs };
  },

  /**
   * Trigger cooler breakdown in C++ backend (/trigger)
   */
  async triggerBreakdown(): Promise<{ telemetry: BackendTelemetryResponse; latencyMs: number }> {
    const { data, latencyMs } = await requestWithFallback<BackendTelemetryResponse>('/trigger');
    return { telemetry: data, latencyMs };
  },

  /**
   * Reset cooler to normal operating conditions in C++ backend (/reset)
   */
  async resetCooler(): Promise<{ telemetry: BackendTelemetryResponse; latencyMs: number }> {
    const { data, latencyMs } = await requestWithFallback<BackendTelemetryResponse>('/reset');
    return { telemetry: data, latencyMs };
  },

  /**
   * Run end-to-end automated test against the C++ backend endpoints
   */
  async runHealthCheck(): Promise<HealthCheckReport> {
    const overallStart = performance.now();
    const steps: HealthCheckStep[] = [];

    // Step 1: Query Baseline Telemetry (GET /)
    try {
      const { data, latencyMs } = await requestWithFallback<BackendTelemetryResponse>('/');
      const passed = typeof data.temperature === 'number' && (data.status === 'SAFE' || data.status === 'DANGER');
      steps.push({
        name: 'Baseline Socket Telemetry (GET /)',
        endpoint: '/',
        expectedStatus: 'Status: SAFE or DANGER with valid float temp',
        passed,
        latencyMs,
        data,
      });
    } catch (err: any) {
      steps.push({
        name: 'Baseline Socket Telemetry (GET /)',
        endpoint: '/',
        expectedStatus: 'HTTP 200 JSON',
        passed: false,
        latencyMs: 0,
        error: err.message || 'Connection refused',
      });
    }

    // Step 2: Trigger Breakdown Simulation (GET /trigger)
    try {
      const { data, latencyMs } = await requestWithFallback<BackendTelemetryResponse>('/trigger');
      const passed = data.status === 'DANGER' && data.temperature >= 11.5;
      steps.push({
        name: 'Trigger Breakdown Excursion (GET /trigger)',
        endpoint: '/trigger',
        expectedStatus: 'Status: DANGER, Temp: 12.0°C - 15.0°C',
        passed,
        latencyMs,
        data,
      });
    } catch (err: any) {
      steps.push({
        name: 'Trigger Breakdown Excursion (GET /trigger)',
        endpoint: '/trigger',
        expectedStatus: 'Status: DANGER',
        passed: false,
        latencyMs: 0,
        error: err.message || 'Trigger request failed',
      });
    }

    // Step 3: Reset Cooler Recovery (GET /reset)
    try {
      const { data, latencyMs } = await requestWithFallback<BackendTelemetryResponse>('/reset');
      const passed = data.status === 'SAFE' && data.temperature <= 9.0;
      steps.push({
        name: 'Cooler Reset & Nominal Recovery (GET /reset)',
        endpoint: '/reset',
        expectedStatus: 'Status: SAFE, Temp: 2.0°C - 8.0°C',
        passed,
        latencyMs,
        data,
      });
    } catch (err: any) {
      steps.push({
        name: 'Cooler Reset & Nominal Recovery (GET /reset)',
        endpoint: '/reset',
        expectedStatus: 'Status: SAFE',
        passed: false,
        latencyMs: 0,
        error: err.message || 'Reset request failed',
      });
    }

    const totalDurationMs = Math.round(performance.now() - overallStart);
    const overallPassed = steps.length === 3 && steps.every((s) => s.passed);

    return {
      overallPassed,
      totalDurationMs,
      steps,
      timestamp: new Date().toISOString(),
    };
  },
};
