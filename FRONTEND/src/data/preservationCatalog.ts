import { PreservationRule, MonitoredSpecimen } from '../types/coldChain';

export const PRESERVATION_CATALOG: PreservationRule[] = [
  // --- ORGANS ---
  {
    id: 'rule-heart',
    name: 'Donor Heart (Static Cold Storage)',
    category: 'ORGAN',
    tempMinCelsius: 2,
    tempMaxCelsius: 4,
    maxPreservationMinutes: 240, // 4 hours Cold Ischemic Time (CIT)
    warningPreservationMinutes: 180, // Alert at 3 hours
    freezeSensitive: true,
    clinicalNotes: 'Strict 4-hour CIT. Beyond 4 hours, risk of primary graft dysfunction increases dramatically. Zero tolerance for freezing.',
  },
  {
    id: 'rule-lungs',
    name: 'Donor Lungs (Hypothermic Preservation)',
    category: 'ORGAN',
    tempMinCelsius: 4,
    tempMaxCelsius: 8,
    maxPreservationMinutes: 420, // 7 hours CIT
    warningPreservationMinutes: 330, // Alert at 5.5 hours
    freezeSensitive: true,
    clinicalNotes: 'Maintain between 4-8°C with Steen/Perfadex solution. Edema risk escalates if temperature fluctuates.',
  },
  {
    id: 'rule-liver',
    name: 'Donor Liver (UW Solution SCS)',
    category: 'ORGAN',
    tempMinCelsius: 2,
    tempMaxCelsius: 6,
    maxPreservationMinutes: 600, // 10 hours CIT
    warningPreservationMinutes: 480, // Alert at 8 hours
    freezeSensitive: true,
    clinicalNotes: 'Maximum tolerable CIT is 12h, but clinical outcomes decline significantly after 8-10h.',
  },
  {
    id: 'rule-kidney',
    name: 'Donor Kidney (Cold Storage / Perfusion)',
    category: 'ORGAN',
    tempMinCelsius: 2,
    tempMaxCelsius: 4,
    maxPreservationMinutes: 1440, // 24 hours CIT
    warningPreservationMinutes: 1200, // Alert at 20 hours
    freezeSensitive: true,
    clinicalNotes: 'Resilient up to 24h on static cold storage, or up to 36h with machine perfusion. Protect from sub-zero crystallisation.',
  },
  {
    id: 'rule-pancreas',
    name: 'Donor Pancreas (UW Solution)',
    category: 'ORGAN',
    tempMinCelsius: 2,
    tempMaxCelsius: 4,
    maxPreservationMinutes: 720, // 12 hours CIT
    warningPreservationMinutes: 540, // Alert at 9 hours
    freezeSensitive: true,
    clinicalNotes: 'High susceptibility to ischemic edema. Must remain strictly chilled under 4°C.',
  },
  {
    id: 'rule-cornea',
    name: 'Corneal Tissue (Optisol-GS Media)',
    category: 'TISSUE',
    tempMinCelsius: 2,
    tempMaxCelsius: 8,
    maxPreservationMinutes: 20160, // 14 days
    warningPreservationMinutes: 17280, // Alert at 12 days
    freezeSensitive: true,
    clinicalNotes: 'Endothelial cell density degrades rapidly if frozen or warmed above 8°C.',
  },

  // --- VACCINES & BIOLOGICALS ---
  {
    id: 'rule-pfizer-ult',
    name: 'Pfizer-BioNTech Comirnaty (Ultra-Low Freezer)',
    category: 'VACCINE_ULT',
    tempMinCelsius: -90,
    tempMaxCelsius: -60,
    maxPreservationMinutes: 43200, // 30 days shipper holding time
    warningPreservationMinutes: 38880, // Alert 3 days before dry-ice re-icing limit
    freezeSensitive: false,
    clinicalNotes: 'Requires dry-ice pelleted shipper. Once thawed to 2-8°C, must be used within 31 days.',
  },
  {
    id: 'rule-moderna-thawed',
    name: 'Moderna Spikevax (Refrigerated Transport)',
    category: 'VACCINE_COLD',
    tempMinCelsius: 2,
    tempMaxCelsius: 8,
    maxPreservationMinutes: 43200, // 30 days thawed shelf-life
    warningPreservationMinutes: 38880, // Alert at 27 days
    freezeSensitive: false,
    clinicalNotes: 'Thawed mRNA lipid nanoparticles. Do not refreeze after thawing. Keep shielded from direct light.',
  },
  {
    id: 'rule-hepb-adjuvanted',
    name: 'Hepatitis B / DTaP (Adjuvanted Vaccine)',
    category: 'VACCINE_COLD',
    tempMinCelsius: 2,
    tempMaxCelsius: 8,
    maxPreservationMinutes: 525600, // 365 days
    warningPreservationMinutes: 475200,
    freezeSensitive: true,
    clinicalNotes: 'CRITICAL: Zero freeze tolerance (<0°C permanently ruins aluminum adjuvant lattice, rendering vaccine inert).',
  },
  {
    id: 'rule-whole-blood',
    name: 'Whole Blood / Packed Red Blood Cells (CPDA-1)',
    category: 'BLOOD_PRODUCT',
    tempMinCelsius: 1,
    tempMaxCelsius: 6,
    maxPreservationMinutes: 50400, // 35 days
    warningPreservationMinutes: 43200, // Alert at 30 days
    freezeSensitive: true,
    clinicalNotes: 'Transport limit is 1-10°C for max 24 hours. Hemolysis occurs if allowed to freeze.',
  },
];

// Helper to generate ISO string offset by minutes into the past
function getPastIsoTime(minutesAgo: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}

export const INITIAL_MOCK_SPECIMENS: MonitoredSpecimen[] = [
  {
    id: 'specimen-001',
    trackingCode: 'ORG-HT-2026-0941',
    specimenName: 'Donor Heart (Cross-Clamped)',
    rule: PRESERVATION_CATALOG[0], // Heart rule (2-4°C, 240 mins max)
    startTime: getPastIsoTime(215), // 215 minutes ago (3h 35m) -> In urgent warning zone!
    originFacility: 'Apex Trauma Center, Bay 3',
    destinationFacility: 'University Cardiac Hospital, OR-4',
    courierNotes: 'Emergency medical transit by air ambulance. Blue transport cooler #04.',
    latestTelemetry: {
      timestamp: new Date().toISOString(),
      temperatureCelsius: 3.2,
      ambientTemperatureCelsius: 22.4,
      batteryLevelPercent: 84,
      coolerLidClosed: true,
      latitude: 40.7128,
      longitude: -74.006,
    },
    telemetryHistory: [],
  },
  {
    id: 'specimen-002',
    trackingCode: 'VAC-PFZ-2026-4412',
    specimenName: 'Pfizer Comirnaty Batch (120 Vials)',
    rule: PRESERVATION_CATALOG[6], // Pfizer ULT rule (-90 to -60°C)
    startTime: getPastIsoTime(1440), // 24 hours ago
    originFacility: 'Central Biological Depot',
    destinationFacility: 'Regional Vaccine Distribution Center',
    courierNotes: 'Thermal shipper box with monitored dry ice charge.',
    latestTelemetry: {
      timestamp: new Date().toISOString(),
      temperatureCelsius: -54.2, // Breached! Temperature rose above -60°C
      ambientTemperatureCelsius: 26.1,
      batteryLevelPercent: 62,
      coolerLidClosed: true,
      latitude: 40.7589,
      longitude: -73.9851,
    },
    telemetryHistory: [],
  },
  {
    id: 'specimen-003',
    trackingCode: 'ORG-KD-2026-1182',
    specimenName: 'Donor Kidney (Pulsatile Perfusion)',
    rule: PRESERVATION_CATALOG[3], // Kidney rule (2-4°C, 1440 mins max)
    startTime: getPastIsoTime(420), // 7 hours ago -> Safe zone (17 hours left)
    originFacility: 'Memorial Medical Center',
    destinationFacility: 'St. Jude Transplant Center',
    courierNotes: 'LifeLine cold-perfusion canister. Stable flow rate.',
    latestTelemetry: {
      timestamp: new Date().toISOString(),
      temperatureCelsius: 2.8,
      ambientTemperatureCelsius: 19.5,
      batteryLevelPercent: 96,
      coolerLidClosed: true,
      latitude: 40.7306,
      longitude: -73.9352,
    },
    telemetryHistory: [],
  },
];
