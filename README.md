# Healora Hub Management Web Platform

> Area-based physical hub operations, care coordination, and capacity management for Healora in Bangladesh.
> Built strictly following the **Healora Hub Management PRD (3 November 2026)**, the **Healora Hub API specifications (`hello.md`)**, and Bangladesh regulatory compliance frameworks.

---

## 🏛 System Architecture & Boundaries (PRD Section 5)

Healora operates as **three interfaces, one shared platform and canonical patient record**:

1. **Patient App:** Patient discovery, booking, consent, reminders, and viewing verified vitals.
2. **Local Doctor + Special Team Mobile App:** Clinical task execution, structured observation entry, and doctor review.
3. **Hub Management Website (This Project):** Physical hub operations, capacity/slots, rosters, check-in, live queue dispatch, biomedical equipment, and compliance auditing.

> **Least-Privilege Architectural Boundary (PRD Section 1 & 5.2):**  
> The hub website is **not** an electronic medical record (EMR) or clinical editor. Hub managers and receptionists cannot browse full patient diagnoses, prescriptions, or clinical histories, nor can they edit recorded vitals. Clinical measurements are entered and attested exclusively through the verified team app.

---

## 🔌 Live Backend API Integration

The platform is integrated with the **Healora Hub Backend API**:
- **API Base URL:** `https://healora-hub-backend-fqvj.onrender.com/api/v1`
- **Swagger Documentation:** [Interactive API Docs](https://healora-hub-backend-fqvj.onrender.com/docs#/)
- **Health Endpoint:** `https://healora-hub-backend-fqvj.onrender.com/health` (Verified: `{"status":"ok","database":true}`)

### Key Integration Highlights:
1. **Resilient API Client (`src/services/apiClient.ts`):**
   - Automatically attaches `Authorization: Bearer <accessToken>` headers.
   - Transparent 401 token refresh queue (`POST /auth/refresh`) preventing session dropouts.
   - Graceful offline/demo fallback to local state if network or backend times out.
2. **Full Staff Authentication Suite (`src/services/authService.ts`, `AuthModal.tsx`):**
   - Email + Password login (`POST /auth/staff/login`).
   - Two-factor authentication (TOTP) step (`POST /auth/staff/mfa/verify`).
   - Forced password change on temporary password issuance (`POST /auth/staff/password`).
   - Authenticator app enrollment (`POST /auth/staff/mfa/enroll` + `confirm`).
   - Current staff identity & role resolution (`GET /me`).
3. **Live Queue Server-Sent Events (SSE) Stream:**
   - Real-time updates via `GET /sessions/{sessionId}/queue/stream` keeping desk queues and lobby displays synchronized.
4. **Domain Services Covering All PRD Routes:**
   - `hubsService.ts` (`/hubs` - multi-hub directory, operating hours, catchments, closures).
   - `regionsService.ts` (`/regions` - geographic divisions, districts, upazilas, risk tiers).
   - `sessionsService.ts` (`/sessions` - clinic sessions, camps, capacity slots, lifecycle transitions).
   - `appointmentsService.ts` (`/appointments` - bookings, check-in, arrival, reschedule, waitlists).
   - `queueService.ts` (`/queue` - ticket calls, service transitions, station transfers, walk-ins).
   - `patientsService.ts` (`/patients` - operational lookup by Healora ID/phone/NID, duplicate detection).
   - `stationsEquipmentService.ts` (`/stations`, `/equipment` - desk assignments, device maintenance & faults).
   - `staffService.ts` (`/team` - staff accounts, role assignments, shift scheduling & attendance).
   - `encountersExceptionsService.ts` (`/encounters`, `/exceptions` - mobile sync monitoring, operational escalation).
   - `reportsAuditService.ts` (`/dashboard`, `/reports`, `/audit-logs`, `/notifications` - overview KPIs, immutable audit trail).

---

## 🧭 Complete Route & Module Mapping (16 Core Modules)

All 16 routes specified in the PRD are fully implemented with deep operational capabilities, Bangla/English localization, and responsive navigation:

| Route | Module Title | Primary Capabilities | API Endpoints |
|---|---|---|---|
| `/dashboard` | **Overview Dashboard** | Real-time operations overview, booked today, queue dwell times, mobile sync status, equipment readiness, and critical alerts. | `GET /dashboard/overview` |
| `/hubs` | **Hub Directory & Management** | Multi-hub physical locations, operating hours, capacity per day, services offered, emergency referral facility liaison, and status controls. | `GET /hubs`, `POST /hubs`, `PATCH /hubs/{id}`, `POST /hubs/{id}/status`, `GET /hubs/{id}/catchments` |
| `/regions` | **Regions & Catchment Areas** | Geographic administrative delimitation (division, district, upazila, union), regional supervisor oversight, and patient-to-hub assignment policies. | `GET /regions`, `GET /regions/tree`, `POST /regions` |
| `/sessions` | **Sessions & Health Camps** | Standard clinic days vs. special rural camps, capacity slot management, prerequisite validation (1 HW + 1 Doctor minimum), and audited cancellations. | `GET /sessions`, `POST /sessions`, `POST /sessions/{id}/publish`, `POST /sessions/{id}/cancel` |
| `/appointments` | **Appointments & Booking** | Daily arrival rosters, assisted intake, queue token issuance (`A-101`), no-show tracking, and double-booking prevention. | `GET /appointments`, `POST /appointments/{id}/check-in`, `POST /appointments/{id}/confirm` |
| `/queue` | **Live Queue** | Real-time station queue dispatch (Reception ➔ Vitals ➔ Doctor Review ➔ Counseling), privacy-safe lobby view, call next patient, and transfers. | `GET /sessions/{id}/queue`, `GET /sessions/{id}/queue/stream`, `POST /queue-tickets/{id}/call` |
| `/patients` | **Operational Patient Lookup** | Least-privilege patient verification by Canonical Healora ID (`PAT-88019`), phone or NID. Identity matching, duplicate safeguards, and consent status. | `POST /patients/lookup`, `POST /patients`, `GET /patient-duplicates` |
| `/team` | **Staff & Rosters** | Multi-disciplinary team directory, BMDC practitioner registration verification, shift scheduling, and concurrent shift conflict prevention. | `GET /admin/users`, `GET /admin/role-assignments`, `GET /shifts`, `POST /shifts` |
| `/stations` | **Stations** | Physical desk management (Registration, Vitals, Review, Counseling), desk occupancy, active staff allocation, and daily throughput counters. | `GET /hubs/{hubId}/stations`, `POST /hubs/{hubId}/stations`, `POST /stations/{id}/status` |
| `/equipment` | **Equipment** | Biomedical screening devices (Omron BP monitors, Accu-Chek glucometers, Masimo SpO2, ECGs), calibration due tracking, and out-of-service safety blocks. | `GET /equipment`, `POST /equipment`, `POST /equipment/{id}/faults` |
| `/encounters` | **Encounter Monitoring** | Operational encounter status, mobile outbox sync states, idempotency key tracking, completeness %, and read-only observation summary inspector. | `GET /sessions/{sessionId}/encounters`, `GET /encounters/{id}/operational` |
| `/exceptions` | **Exceptions & Escalations** | Real-time exception queues (sync failures, incomplete measurements, SLA wait breaches >20 min, equipment faults, and emergency referrals to DMCH). | `GET /exceptions`, `POST /exceptions/{id}/acknowledge`, `POST /exceptions/{id}/resolve` |
| `/reports` | **Reports & Analytics** | Aggregated de-identified analytics, capacity utilization, attendance rates, median wait/service durations, and protocol completeness. | `GET /reports`, `GET /reports/{code}`, `POST /exports`, `GET /exports/{id}/download` |
| `/notifications` | **Notifications & Activity** | Communications ledger, SMS/push dispatches, delivery receipts, and strict generic privacy constraint (no raw vitals in previews). | `GET /notifications`, `POST /notifications/{id}/read` |
| `/settings` | **Settings & Permissions** | Platform-wide RBAC/ABAC role switcher, operational SLA threshold tuning, break-glass 60-min emergency protocol, and accessibility mode. | `POST /admin/break-glass`, `GET /admin/break-glass` |
| `/audit-logs` | **Audit Logs** | Immutable, append-only security and operational audit trail recording every check-in, queue call, session edit, sync retry, and ABAC block. | `GET /audit-events` |

---

## 🇧🇩 Bangladesh Regulatory Compliance Gates (PRD Section 17)

1. **Personal Data Protection Act, 2026 (Act No. 63 of 2026):**
   - Health-related information classified as sensitive personal data.
   - Specific, voluntary informed consent captured for each encounter.
   - Least-privilege role boundaries enforced by backend access controls.
2. **DGHS National Telehealth Guideline for Bangladesh (2026):**
   - Strict local data residency: Zero foreign cloud storage for patient vitals.
   - Hosted at AP-DCC Gazipur Tier-IV National Data Center infrastructure.
3. **BMDC Telemedicine Guidelines (July 2020):**
   - Registered Medical Practitioner (RMP) qualification and BMDC licence verification required for clinical review actions.
   - Traceable provenance linking each measurement to the performing health worker and device serial number.

---

## 🚀 Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint codebase (oxlint)
npm run lint

# Build production bundle
npm run build

# Preview production build
npm run preview
```
