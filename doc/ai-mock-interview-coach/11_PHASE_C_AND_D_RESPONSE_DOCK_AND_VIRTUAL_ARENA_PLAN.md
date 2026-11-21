# 🎙️ Technical Execution Plan: Phase C & D — Interactive Response Dock & Virtual Meeting Room Arena

**Document:** 11_PHASE_C_AND_D_RESPONSE_DOCK_AND_VIRTUAL_ARENA_PLAN.md  
**Module:** SKILLEZO AI Mock Interview Coach — Live Arena Layer  
**Target:** Internshala / HireVue-Style Dual-Pane Virtual Meeting Room with Voice/Text Response Dock  
**Parent Plan:** [`08_VISUAL_AND_VOICE_INTERVIEW_ARENA_UPGRADE_PLAN.md`](./08_VISUAL_AND_VOICE_INTERVIEW_ARENA_UPGRADE_PLAN.md)  
**Pre-requisites:** 
- [`09_PHASE_A_VOICE_AND_SPEECH_ENGINE_PLAN.md`](./09_PHASE_A_VOICE_AND_SPEECH_ENGINE_PLAN.md) (🟢 Completed & Verified)
- [`10_PHASE_B_VISUAL_STAGE_AND_VIDEO_MIRROR_PLAN.md`](./10_PHASE_B_VISUAL_STAGE_AND_VIDEO_MIRROR_PLAN.md) (🟢 Completed & Verified)  
**Status:** 🟢 **100% Completed, Mounted & Verified (Zero TypeScript Errors)**  

---

## 🎯 1. Objective & Scope

With the **Voice & Speech Foundation (Phase A)** and the **Visual Video Mirror Components (Phase B)** successfully completed, **Phase C & D** completes the transformation of the interview arena:

1. **Phase C (Interactive Dual-Mode Response Dock)**:
   - Builds `InteractiveResponseDock.tsx`, replacing the plain text box with a unified response center supporting **Voice Mode** (push-to-talk, live waveform, streaming transcription, real-time filler-word tracking) and **Text Mode** (keyboard input for quiet environments).
2. **Phase D (Virtual Meeting Room Assembly & Live Mounting)**:
   - Refactors `client/app/dashboard/interview-coach/session/[sessionId]/page.tsx` into a responsive 2-column video interview stage:
     - **Stage Left (55%)**: AI Interviewer Avatar Stage + Spoken Question TTS + Active Question Prompt Card.
     - **Stage Right (45%)**: Candidate Webcam Mirror + Interactive Voice/Text Response Dock.
   - Connects live speech events directly into the existing `submitAnswer` API (`POST /api/interviews/sessions/:sessionId/answers`) with zero backend breakage.

---

## 🏗️ 2. Architectural Blueprint: Virtual Meeting Room Stage

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ React Developer [Mid Tier] [Technical]       Question 1 of 3         ⏱ 02:45 [End Early] │
├───────────────────────────────────────────────────────┬────────────────────────────────┤
│                                                       │                                │
│       STAGE LEFT: AI INTERVIEWER PERSONA              │     STAGE RIGHT: CANDIDATE HUB │
│                                                       │                                │
│  ┌─────────────────────────────────────────────────┐  │  ┌──────────────────────────┐  │
│  │                                                 │  │  │  [LIVE WEBCAM FEED]       │  │
│  │             [ANIMATED AI AVATAR ORB]            │  │  │  (Candidate Camera View)  │  │
│  │                                                 │  │  │                          │  │
│  │        (((( 🎙️ AI Interviewer ))))              │  │  │  [📹 Cam On] [🎤 Mute]    │  │
│  │                                                 │  │  └──────────────────────────┘  │
│  │  Status: "Interviewer is speaking question..." │  │                                │
│  │  [🔊 Replay Audio]   [⏹️ Stop]                   │  │  ┌──────────────────────────┐  │
│  └─────────────────────────────────────────────────┘  │  │  RESPONSE MODE:           │  │
│                                                       │  │  [• Voice Mode]  [ Text ] │  │
│  ┌─────────────────────────────────────────────────┐  │  │                          │  │
│  │  LIVE QUESTION PROMPT:                          │  │  │  🎙️ [START SPEAKING]     │  │
│  │  "In modern React applications, managing async   │  │  │  (Live Speech Waveform)  │  │
│  │   data loading and state transitions..."        │  │  │                          │  │
│  │                                                 │  │  │  Live Transcript Editor: │  │
│  │  Key Discussion Focus:                          │  │  │  "useActionState helps   │  │
│  │  [useTransition] [useActionState] [Pending]     │  │  │   manage pending states.."│  │
│  └─────────────────────────────────────────────────┘  │  │                          │  │
│                                                       │  │  [ Submit & Continue ▶ ]  │  │
│                                                       │  └──────────────────────────┘  │
└───────────────────────────────────────────────────────┴────────────────────────────────┘
```

---

## 📦 3. Phase C: Interactive Dual-Mode Response Dock

**File:** `client/components/dashboard/interview-coach/arena/InteractiveResponseDock.tsx`

### 3.1 Component Props Contract
```typescript
export interface InteractiveResponseDockProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  sessionId: string;
  questionId: string;
  isAISpeaking?: boolean;
}
```

### 3.2 Features & Capabilities
1. **Mode Switcher (Voice Mode vs. Text Mode)**:
   - Segmented toggle tab at the top of the dock.
   - Defaults to **Voice Mode** to encourage verbal interview practice.
   - Allows instant switching to **Text Mode** if the candidate is in a public or quiet area.
2. **Voice Mode Sub-Stage**:
   - Large central **Push-to-Talk / Toggle Speaking** button (`Mic` icon with dynamic pulse wave).
   - Dynamic states:
     - *Inactive*: Dark slate with "Click to Speak Your Answer".
     - *Listening*: Radiant emerald glow with pulsating concentric sound rings (`animate-ping`) and "Listening... Click to Pause".
   - **Streaming Transcript Box**:
     - Real-time speech transcription preview updating as the candidate speaks.
     - Fully editable: candidate can refine or adjust any technical jargon misheard by speech recognition before submitting.
   - **Verbal Filler-Word Badge**:
     - Real-time pill analyzing verbal fillers using `analyzeFillerWords`:
       - 🟢 *"Clean & articulate (0 fillers)"*
       - 🟡 *"2 fillers: um, like"*
       - 🔴 *"High filler usage (6+ fillers detected)"*
   - **Reset / Clear Action**: Allows resetting the transcript to start over.
3. **Text Mode Sub-Stage**:
   - Clean, distraction-free textarea with placeholder guidance.
   - Live character and word count indicators.
4. **Draft Protection**:
   - Automatically synchronizes drafts to `localStorage` under `skillezo_draft_${sessionId}_${questionId}`.
5. **Submission Action**:
   - "Submit & Continue" primary action button with `Ctrl + Enter` hotkey and loading spinner.

---

## 📦 4. Phase D: Virtual Meeting Room Assembly & Live Page Mounting

**File:** `client/app/dashboard/interview-coach/session/[sessionId]/page.tsx`

### 4.1 Meeting Room Page Refactoring
Replaces the flat, single-column document layout with a responsive 2-column virtual meeting room stage:

- **Top Navigation Bar**:
  - `InterviewArenaHeader.tsx`: Back button, candidate role, experience tier, question progress counter, and early exit modal.
  - Added **Fullscreen Focus Toggle** (`Maximize2` / `Minimize2`) simulating proctored interview screens.
- **Stage Left Column (55% width on desktop)**:
  - `AIInterviewAvatarStage.tsx`:
    - Auto-speaks the question text upon loading via `useSpeechSynthesis`.
    - Reactive state changes: switches to `speaking` when TTS plays, `listening` when candidate speaks, `analyzing` when answer is submitted.
    - Playback controls: Replay Question and Stop Audio buttons.
  - `QuestionDisplayCard.tsx`:
    - Question prompt card, category badge, difficulty tier, and key discussion dimensions.
- **Stage Right Column (45% width on desktop)**:
  - `CandidateWebcamMirror.tsx`:
    - Live mirrored video preview with camera on/off toggle and mic mute toggle.
    - Real-time Web Audio API decibel volume visualizer.
  - `InteractiveResponseDock.tsx`:
    - Voice/Text tabs, live streaming speech transcription, filler word counter, and submission trigger.
- **Responsive Layout**:
  - Stacks smoothly on tablets and mobile screens (`grid-cols-1 lg:grid-cols-12`).

### 4.2 End-to-End Workflow & Zero Backend Breakage
1. Candidate lands on `/dashboard/interview-coach/session/[sessionId]`.
2. Session starts/resumes via `POST /api/interviews/sessions/:id/start`.
3. AI Interviewer automatically asks Question 1 out loud; talking orb animates.
4. Candidate activates camera and clicks "Click to Speak" in the Response Dock.
5. Candidate's spoken response transcribes into the transcript box in real time.
6. Candidate clicks "Submit & Continue" (or presses `Ctrl + Enter`).
7. Answer payload maps `transcript` directly to `answerText` in `POST /api/interviews/sessions/:sessionId/answers`.
8. State machine advances to the next question or completion screen.

---

## 🧪 5. Testing & Verification Strategy

### 5.1 Unit Tests (`client/tests/interview-coach-response-dock.spec.tsx`)
1. Verify `InteractiveResponseDock` renders in Voice Mode by default with push-to-talk button.
2. Verify switching to Text Mode renders the direct textarea.
3. Verify live filler word badge updates as candidate types/speaks.
4. Verify submitting triggers `onSubmit` callback and clears draft.

### 5.2 Quality Gates:
- `npm --prefix client test` runs and passes with 100% success across all test suites.
- `.\client\node_modules\.bin\tsc.cmd --noEmit -p client\tsconfig.json` returns 0 errors.
- Manual browser walkthrough verifying camera feed, TTS audio, and live transcription.

---

## 🚀 6. Implementation Roadmap & Deliverables

| Task ID | Deliverable | Target Location | Verification | Status |
| :--- | :--- | :--- | :--- | :---: |
| **C.1** | Interactive Response Dock Component | `client/components/dashboard/interview-coach/arena/InteractiveResponseDock.tsx` | Mode toggle, speech hook wiring, and filler pill | 🟢 Complete |
| **C.2** | Response Dock Unit Test Suite | `client/tests/interview-coach-response-dock.spec.tsx` | 5/5 Vitest unit tests passing | 🟢 Complete |
| **D.1** | Virtual Meeting Room Arena Refactor | `client/app/dashboard/interview-coach/session/[sessionId]/page.tsx` | Assembled 2-column video stage with TTS sync | 🟢 Complete |
| **D.2** | TypeScript & Full Build Verification | Client & Server workspaces | `tsc --noEmit` with 0 errors across repo | 🟢 Complete |

---

## 🔒 7. Exit Criteria

1. The flat document UI shown in candidate screenshots is replaced by the Internshala-style dual-column video stage.
2. AI Interviewer automatically asks the question aloud with synchronized audio and talking animations.
3. Candidate can view their live camera feed mirror and speak their answers naturally with real-time speech-to-text.
4. All client test suites pass with zero regressions and zero TypeScript compiler errors.

