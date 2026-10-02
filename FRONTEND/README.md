# ColdChain Guardian — Medical & Organ Preservation SLA Engine

> **Hackathon Solution**: Real-time frontend monitoring dashboard for temperature-sensitive lab specimens, vaccines, and transplant organs. Prevents irreversible supply ruin caused by transport cooler failures and Cold Ischemia Time (CIT) overruns.

---

## 1. Problem Statement

Temperature-sensitive lab samples, vaccines, and donor organs degrade rapidly if transport coolers experience thermal failures or transit delays. 
- **Organs** (Heart, Lungs, Liver, Kidneys) have strict **Cold Ischemic Times (CIT)**. Exceeding preservation duration causes ischemic reperfusion injury and graft failure.
- **Vaccines** (such as mRNA or aluminum-adjuvanted childhood vaccines) degrade permanently if exposed to elevated temperatures or sub-zero freezing.

---

## 2. Clinical Preservation Standards

### A. Transplant Organs & Tissues (CIT Limits)

| Organ / Tissue | Preservation Mode | Safe Temperature Range | Max Safe Cold Ischemia Time | Critical Warning Threshold |
| :--- | :--- | :--- | :--- | :--- |
| **Donor Heart** | Static Cold Storage (SCS) | **2°C – 4°C** | **4 hours (240 min)** | Alert at **3.0 hours** |
| **Donor Lungs** | Hypothermic Perfusion | **4°C – 8°C** | **7 hours (420 min)** | Alert at **5.5 hours** |
| **Donor Liver** | SCS (UW Solution) | **2°C – 6°C** | **10 hours (600 min)** | Alert at **8.0 hours** |
| **Donor Kidneys** | SCS / Machine Perfusion | **2°C – 4°C** | **24 hours (1440 min)** | Alert at **20.0 hours** |
| **Donor Pancreas** | SCS (UW Solution) | **2°C – 4°C** | **12 hours (720 min)** | Alert at **9.0 hours** |
| **Corneal Tissue** | Optisol-GS Media | **2°C – 8°C** | **14 days (20,160 min)** | Alert at **12 days** |

### B. Vaccines & Lab Biologicals

| Biologic | Category | Safe Temp Range | Max Storage / Transit Duration | Biological Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Pfizer-BioNTech Comirnaty** | Ultra-Low (ULT) | **-90°C to -60°C** | **30 days** in dry-ice thermal shipper | Thawed to 2–8°C: max 31 days |
| **Moderna Spikevax** | Cold-Chain (Thawed) | **2°C – 8°C** | **30 days** thawed shelf-life | Do not refreeze; light-sensitive |
| **Hepatitis B / DTaP** | Cold-Chain | **2°C – 8°C** | **365 days** | **Zero Freeze Tolerance**: < 0°C ruins adjuvant |
| **Whole Blood (CPDA-1)** | Blood Bank | **1°C – 6°C** | **35 days** (transport: max 24h at 1–10°C) | Risk of hemolysis |

---

## 3. Real-Time Alert & Notification System

To ensure immediate clinical response, the system implements a multi-tier alert engine:

1. **Cold Ischemia Time Exceeded Alarm (`CRITICAL_TIME_EXPIRED`)**:
   - Triggers when `remainingMinutes <= 0`.
   - Card displays an emergency warning banner and pulses red (`.animate-alert-ring`).
   - Dispatches a system **Web Notification** with `requireInteraction: true`.
   - Plays an audible emergency two-tone alarm via the browser's **Web Audio API** (no external `.mp3` assets required).
2. **Temperature Excursion Alarm (`CRITICAL_TEMP`)**:
   - Triggers if cooler temperature rises above `tempMaxCelsius` or drops below `tempMinCelsius`.
   - Flags freeze hazards if a freeze-sensitive item drops $\le 0^\circ\text{C}$.
3. **Approaching SLA Warning (`WARNING`)**:
   - Triggers at the 80% mark of safe duration to alert logistics coordinators before graft viability is compromised.
4. **In-App Incident Response Drawer**:
   - Real-time audit log of all logged excursions.
   - Allows clinicians to acknowledge individual incidents or review full timestamps.

---

## 4. How to Test & Demo (For Evaluators)

Interactive controls are embedded on each specimen card:

1. **Test Preservation Expiry Alert (Requirement 3)**:
   - On the **Donor Heart** card, click the **`+1h CIT`** button.
   - Elapsed time will jump past the 4-hour limit.
   - The card will immediately trigger the emergency banner, turn pulsing red, sound the Web Audio siren, and log an incident in the drawer.
2. **Test Temperature Breach Alert (Requirement 1)**:
   - Click the **`+2.5°C`** or **`-2.5°C`** buttons on any card to push cooler temperature outside the safe bracket.
   - Watch the temperature gauge turn amber/red and log an active excursion.
3. **Enable Audio & Desktop Popups**:
   - Click the **`Enable Audio/Alarms`** button in the header bar to grant notification permissions.

---

## 5. Development & Run Instructions

```bash
# 1. Navigate to the FRONTEND directory
cd FRONTEND

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

---

## 6. Technical Stack

- **Framework**: React 18 with TypeScript 5
- **Bundler & HMR**: Vite 6
- **Styling**: Tailwind CSS 3 with PostCSS & Autoprefixer
- **Icons**: Lucide React
- **Audio Synthesizer**: Web Audio API (OscillatorNode & GainNode)
- **Notifications**: HTML5 Web Notifications API
