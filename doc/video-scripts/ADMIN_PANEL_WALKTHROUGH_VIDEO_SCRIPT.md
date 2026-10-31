# 🎬 SKILLEZO.AI — Admin Command Center Walkthrough & Verification Script

> **Document Type:** Production Demo Director's Script & Administrative Verification Guide  
> **Target Audience:** Enterprise Clients, Internal Stakeholders, Platform Operators, and Investors  
> **Target Video Length:** 5–7 Minutes  
> **Recommended Tooling:** Loom, OBS Studio, or Screen Studio (1080p / 60fps, Dark Mode)  
> **Pre-requisite:** Logged in with Admin account (`admin@gmail.com`)  
> **Route Base:** `http://localhost:3000/admin/dashboard`

---

## 📌 Master Video Table of Contents & Timeline

| Scene | Timecode | Screen / Route | Core Focus & Verification Point |
| :--- | :---: | :--- | :--- |
| **Scene 1: Introduction & Admin Overview** | `00:00 – 01:15` | `/admin/dashboard` | Live platform KPIs, telemetry probes, 512MB RAM guard, broadcast alerts |
| **Scene 2: User Governance & Security** | `01:15 – 02:30` | `/admin/dashboard?tab=users` | Candidate/recruiter directory, role filtering, suspension security guards |
| **Scene 3: Job Moderation & Market Feeds** | `02:30 – 03:45` | `/admin/dashboard?tab=jobs` | Internal vs Jooble external listings, 1-click sync, approval/rejection lifecycle |
| **Scene 4: Resume Intelligence & PDF Engine**| `03:45 – 05:00` | `/admin/dashboard?tab=resumes` | Candidate name/email resolution, dynamic ATS scores, instant vector PDF streaming |
| **Scene 5: Learning Vault & AI PDF Ingestion**| `05:00 – 06:15` | `/admin/dashboard?tab=learning-hub` | 15MB PDF drag-and-drop, Gemini AI question extraction, printable cheat-sheets |
| **Scene 6: Closing & Platform Governance Recap** | `06:15 – 06:45` | `/admin/dashboard` | High-level summary of administrative control and zero cloud storage cost |

---

## 🛠️ Step 0: Pre-Recording Setup

1. **Browser Session:**
   - Chrome / Brave in Dark Mode, logged into the Administrator account (`admin@gmail.com`).
   - Active URL: `http://localhost:3000/admin/dashboard`
   - Bookmarks bar hidden (`Ctrl+Shift+B` or `Cmd+Shift+B`).
   - Zoom set to `100%` or `110%`.
2. **Audio & Video:**
   - Microphone tested with crisp audio and low background noise.
   - Screen resolution: 1080p (1920x1080).

---

## 🎬 Scene-by-Scene Director's Script

### 📍 Scene 1: Introduction & Live Telemetry Overview (00:00 – 01:15)
* **URL:** `http://localhost:3000/admin/dashboard`
* **On-Screen Action:**
  - Cursor hovers over the **Admin Command Center** header and the pulsing **"Live Hub"** badge.
  - Point to the 4 Primary KPI cards:
    - **Total Users** (showing candidate and recruiter split)
    - **Live Jobs** (active vs ingested)
    - **Resumes Processed** (with live average ATS score)
    - **Applications & Verified Skills**
  - Scroll down to the **System Architecture & Telemetry** card:
    - Highlight the **Railway 512MB RAM Guard** active indicator.
    - Show Heap Memory Used, Node.js runtime version, and live DB ping latency.
  - Click the **"Broadcast Alert"** button to open the modal, then close it.
* **🗣️ Voiceover Script:**
  > *"Welcome to the **Admin Command Center** of SKILLEZO.AI.*
  > 
  > *While our candidate and recruiter portals streamline talent discovery and hiring, this command center gives platform operators complete, real-time oversight over the entire ecosystem.*
  > 
  > *Right at the top, our telemetry engine tracks active users, live jobs, processed resumes, and cryptographic skill verifications.*
  > 
  > *Notice our system telemetry probe: our backend is optimized for zero bloat, running under strict 512MB RAM memory guards with live health monitoring. Platform administrators can also broadcast instant system notifications or trigger real-time external job syncs with a single click."*

---

### 📍 Scene 2: User Governance & Account Security (01:15 – 02:30)
* **URL:** Click **"User Directory"** in the sidebar (`/admin/dashboard?tab=users`)
* **On-Screen Action:**
  - Notice the URL smoothly updates to `?tab=users` and the User Directory view opens instantly.
  - Type a name into the search bar (e.g., `Himanshu` or `testuser`).
  - Use the role filter dropdown to filter by **Candidates**, **Recruiters**, and **Administrators**.
  - Point to the **Account Status** badges (`Active` in green, `Suspended` in red).
  - Hover over the **Suspend / Unsuspend** action button.
  - Explain the account protection guard: admin accounts cannot be accidentally suspended or deleted.
* **🗣️ Voiceover Script:**
  > *"Next, let's look at user governance under the **User Directory**.*
  > 
  > *Administrators have centralized control over all candidate, recruiter, and enterprise accounts. We can search in real time by name, email, or user ID, and filter by roles.*
  > 
  > *If an account violates platform integrity guidelines, administrators can suspend the account in one click. When suspended, the system immediately revokes candidate application and assessment privileges and presents an authenticated suspension banner.*
  > 
  > *Enterprise security guards prevent accidental suspension of super-administrator accounts, ensuring bulletproof platform continuity."*

---

### 📍 Scene 3: Job Moderation & Market Feeds (02:30 – 03:45)
* **URL:** Click **"Job Moderation"** in the sidebar (`/admin/dashboard?tab=jobs`)
* **On-Screen Action:**
  - Filter by source: switch between **All Sources**, **Internal Postings**, and **Jooble Ingested**.
  - Show status badges: `Active`, `Under Review`, and `Closed`.
  - Hover over the **Sync External Jobs** button in the header.
  - Show action buttons: **Approve**, **Close**, and **Delete Requisition**.
* **🗣️ Voiceover Script:**
  > *"Under **Job Moderation**, administrators maintain complete oversight of market opportunities.*
  > 
  > *Skillezo aggregates both verified employer requisitions and external market listings via automated API ingestion.*
  > 
  > *Every listing can be reviewed, edited, approved, or deactivated. The admin can trigger an on-demand external sync, populating our candidate matching engine with fresh, live opportunities while ensuring spam listings never reach our candidates."*

---

### 📍 Scene 4: Resume Intelligence & Vector PDF Streaming (03:45 – 05:00)
* **URL:** Click **"Resume Intelligence"** in the sidebar (`/admin/dashboard?tab=resumes`)
* **On-Screen Action:**
  - Point out the cleanly populated table:
    - **Candidate:** Real candidate names (e.g., *HIMANSHU KUMAR*, *Premjeet Vivek*) and verified email addresses.
    - **Target Role:** Resolved role benchmarks (e.g., *Senior Full Stack Engineer*).
    - **ATS Score:** Real deterministic ATS score badges (e.g., `84%`, `76%`).
    - **Extraction:** Verified skills count and projects count (e.g., *35 Skills • 3 Projects*).
    - **Uploaded Date:** Real localized timestamps.
  - Click the **"View ↗"** button on the first candidate row:
    - A new browser tab opens at `/api/resumes/:id/download?view=true`.
    - Show the **vector A4 PDF resume** rendering instantly in the browser with dark header, contact details, target role, technical skills, experience bullets, and projects.
* **🗣️ Voiceover Script:**
  > *"Now let's examine **Resume Intelligence**.*
  > 
  > *Here, administrators see every resume processed across the platform. Every row displays verified candidate credentials, their target engineering role, and an algorithmic ATS score computed deterministically by our scoring engine.*
  > 
  > *Notice this **'View'** button: when clicked, our backend compiles and streams a high-fidelity vector A4 PDF in real time directly from the candidate's structured database record.*
  > 
  > *Even in completely stateless environments with zero persistent cloud disk overhead, candidates and administrators get a print-ready, professional PDF in under 50 milliseconds."*

---

### 📍 Scene 5: Learning Vault & AI PDF Ingestion (05:00 – 06:15)
* **URL:** Click **"Learning Vault & PDFs"** in the sidebar (`/admin/dashboard?tab=learning-hub`)
* **On-Screen Action:**
  - Point to the **Drag-and-Drop Ingestion Zone** (supports PDFs up to 15MB).
  - Point to the **Vault Inventory Table**:
    - Highlight document title, category badge (*Frontend*, *Backend*, *Cloud*), difficulty level, and page count.
    - Hover over **"Download PDF"** and show that curated technical cheat-sheets can be downloaded instantly.
  - Point out the **AI Ingestion engine**:
    - Explain that dragging in a PDF runs `pdf-parse` in memory and executes **Gemini 2.5 Flash** to extract exam-ready multiple-choice drills with code snippets and explanations.
* **🗣️ Voiceover Script:**
  > *"Finally, let's explore our **Learning Vault & Content Ingestion Engine**.*
  > 
  > *Under this tab, administrators can ingest technical engineering guides and architectural documentation up to 15 megabytes.*
  > 
  > *When a document is uploaded, our server extracts its technical text in memory and passes it to **Gemini 2.5 Flash**, which automatically synthesizes exam-ready multiple-choice drills complete with code blocks, 4 balanced answer options, and educational explanations.*
  > 
  > *This allows our practice arena and verification question banks to grow autonomously without manual question authoring."*

---

### 📍 Scene 6: Closing & Platform Governance Recap (06:15 – 06:45)
* **URL:** Click **"Admin Overview"** in the sidebar (`/admin/dashboard`)
* **On-Screen Action:**
  - Return smoothly to the overview dashboard.
  - Hover cursor comfortably over the Skillezo brand banner.
  - Conclude with confidence and warm authority.
* **🗣️ Voiceover Script:**
  > *"From real-time system telemetry and user account security to automated job ingestion, deterministic resume intelligence, and AI-driven curriculum generation—the SKILLEZO Admin Command Center provides complete enterprise governance with zero cloud infrastructure bloat.*
  > 
  > *The system is 100 percent operational, fully verified, and ready for production launch. Thank you for watching."*

---

## 🎙️ Teleprompter Cheat Sheet (Quick Cut Version)

```text
Welcome to the Admin Command Center of SKILLEZO.AI.

While our candidate and recruiter portals streamline talent discovery, this command center gives platform operators complete oversight over the ecosystem. Right at the top, our telemetry engine tracks active users, live jobs, processed resumes, and cryptographic skill verifications under strict 512MB RAM guards.

Under User Directory, administrators have centralized governance over all candidate, recruiter, and enterprise accounts. We can search in real time, filter by role, and apply account suspension guards to protect platform integrity.

Under Job Moderation, we oversee both verified employer requisitions and external market listings, with on-demand API synchronization.

Under Resume Intelligence, administrators inspect every candidate resume, target role, and real deterministic ATS score. With one click, our in-memory PDF engine compiles and streams a print-ready vector PDF in milliseconds with zero cloud storage overhead.

Finally, under the Learning Vault, administrators can drag and drop engineering PDFs. Gemini AI automatically parses the document and extracts interactive code assessments into our practice arena.

Centralized governance, deterministic intelligence, and zero cloud bloat. That is SKILLEZO.AI.
```
