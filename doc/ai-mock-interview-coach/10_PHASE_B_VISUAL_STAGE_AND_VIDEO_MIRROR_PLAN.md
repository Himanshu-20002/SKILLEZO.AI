# 🎨 Technical Execution Plan: Phase B — Visual Stage & Video Mirror Components

**Document:** 10_PHASE_B_VISUAL_STAGE_AND_VIDEO_MIRROR_PLAN.md  
**Module:** SKILLEZO AI Mock Interview Coach — Visual Stage Layer  
**Target:** Internshala / HireVue-Style Animated AI Interviewer Avatar & Candidate Webcam Mirror  
**Parent Plan:** [`08_VISUAL_AND_VOICE_INTERVIEW_ARENA_UPGRADE_PLAN.md`](./08_VISUAL_AND_VOICE_INTERVIEW_ARENA_UPGRADE_PLAN.md)  
**Pre-requisite:** [`09_PHASE_A_VOICE_AND_SPEECH_ENGINE_PLAN.md`](./09_PHASE_A_VOICE_AND_SPEECH_ENGINE_PLAN.md) (Completed & Verified)  
**Status:** 🟢 **100% Completed, Verified & Passing (Zero TypeScript Errors)**  

---

## 🎯 1. Objective & Scope

The objective of **Phase B** is to create the two core visual presentation components that turn the static text form into a realistic virtual video interview room:

1. **AI Interviewer Persona Stage (`AIInterviewAvatarStage.tsx`)**:
   - An interactive visual presence for the AI Interviewer featuring a 3D animated gradient orb, multi-state equalizer waveforms, and spoken question controls (Replay, Pause, Mute).
2. **Candidate Webcam Mirror Feed (`CandidateWebcamMirror.tsx`)**:
   - A live, client-side video camera mirror with camera on/off toggle, microphone mute toggle, and a real-time Web Audio API decibel volume visualizer that bounces to the candidate's speech.

---

## 🏗️ 2. Architectural Structure

```
client/
└── components/
    └── dashboard/
        └── interview-coach/
            └── arena/
                ├── AIInterviewAvatarStage.tsx    # AI Interviewer persona, glowing orb & audio controls
                └── CandidateWebcamMirror.tsx     # Candidate camera feed, audio meter & media controls
```

---

## 📦 3. Detailed Component Specifications

### 3.1 AI Interviewer Persona Stage (`AIInterviewAvatarStage.tsx`)

Visualizes the AI Interviewer as an active participant rather than a silent prompt card.

```typescript
export interface AIInterviewAvatarStageProps {
  status: 'speaking' | 'listening' | 'analyzing' | 'idle';
  isSpeaking: boolean;
  onReplayQuestion: () => void;
  onStopAudio: () => void;
  interviewerName?: string;
  interviewerTitle?: string;
  roleTitle?: string;
}
```

#### Visual States & Animations:
1. 🗣️ **Speaking State** (When AI is reading the question aloud):
   - Multi-ring animated ripple glow (cyan $\rightarrow$ violet).
   - Dynamic 7-bar CSS soundwave equalizer bouncing rhythmically.
   - Status badge: `Interviewer is speaking...` with a live sound icon.
2. 👂 **Listening State** (When candidate is speaking or typing):
   - Soft pulsing emerald ring glow.
   - Status badge: `Listening to you...` with a green active dot.
3. 💭 **Analyzing State** (When candidate submits answer or evaluation is running):
   - Smooth rotating dual-ring purple loader.
   - Status badge: `Analyzing response...`
4. ⏸️ **Idle State**:
   - Subtle breathing gradient glow.
   - Status badge: `Ready for response`.

#### Interactive Controls:
- **Replay Audio Button (🔊)**: Re-triggers TTS voice playback from the beginning.
- **Stop / Mute Button (⏹️)**: Immediately silences the audio.

---

### 3.2 Candidate Webcam Mirror Feed (`CandidateWebcamMirror.tsx`)

Replicates the authentic video interview feeling used by Internshala and HireVue.

```typescript
export interface CandidateWebcamMirrorProps {
  candidateName?: string;
  isListening?: boolean;
  onCameraStateChange?: (isEnabled: boolean) => void;
  onMicStateChange?: (isEnabled: boolean) => void;
}
```

#### Core Capabilities:
- **`getUserMedia` Video Stream**:
  - Connects to local webcam using `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`.
  - Inverts horizontally (`transform: scaleX(-1)`) so the candidate sees a natural mirror reflection.
- **Privacy First ($0 Server Storage)**:
  - 100% client-side local mirror. No video frames are transmitted to any backend or cloud server.
- **Media Toggles**:
  - 📹 **Camera On/Off Toggle**:
    - When turned off, stream tracks are stopped and UI renders a clean initials avatar card (*"Camera is off"*).
  - 🎤 **Microphone Mute/Unmute Toggle**:
    - Toggles audio track enabled state.
- **Live Decibel Audio Visualizer (Web Audio API)**:
  - Hooks an `AudioContext` and `AnalyserNode` to the candidate's local microphone stream.
  - Measures real-time input volume ($0$ to $100$) and drives animated green visualizer bars showing that the microphone is picking up sound.
- **Graceful Fallbacks**:
  - Handles `NotAllowedError` (user denied permission), `NotFoundError` (no camera hardware), and insecure HTTP contexts with a friendly non-blocking warning card.

---

## 🧪 4. Testing & Verification Strategy

### 4.1 Unit Tests (`client/tests/interview-coach-visual-stage.spec.tsx`)
1. **AI Interviewer Avatar Stage**:
   - Verify renders with proper status badges (`Speaking`, `Listening`, `Analyzing`, `Idle`).
   - Verify clicking Replay triggers `onReplayQuestion`.
   - Verify clicking Stop triggers `onStopAudio`.
2. **Candidate Webcam Mirror**:
   - Mock `navigator.mediaDevices.getUserMedia` and Web Audio API (`AudioContext`, `AnalyserNode`).
   - Verify renders video element when camera is active.
   - Verify toggling camera off renders the fallback avatar card.
   - Verify toggling mic mute updates track status.

### 4.2 Static Quality Gates:
- `.\client\node_modules\.bin\tsc.cmd --noEmit -p client\tsconfig.json` returns 0 errors.
- `npm --prefix client test` runs and passes with zero regressions.

---

## 🚀 5. Implementation Roadmap & Deliverables

| Task ID | Deliverable | Target Location | Verification | Status |
| :--- | :--- | :--- | :--- | :---: |
| **B.1** | AI Interviewer Avatar Stage Component | `client/components/dashboard/interview-coach/arena/AIInterviewAvatarStage.tsx` | Render tests across speaking, listening, and analyzing states | 🟢 Complete |
| **B.2** | Candidate Webcam Mirror Feed Component | `client/components/dashboard/interview-coach/arena/CandidateWebcamMirror.tsx` | Mocked camera toggle & audio visualizer tests | 🟢 Complete |
| **B.3** | Visual Stage Unit Test Suite | `client/tests/interview-coach-visual-stage.spec.tsx` | 5/5 Vitest unit tests passing | 🟢 Complete |
| **B.4** | TypeScript & Build Verification | Client workspace | `tsc --noEmit` with 0 errors | 🟢 Complete |

---

## 🔒 6. Exit Criteria for Phase B

1. Both `AIInterviewAvatarStage.tsx` and `CandidateWebcamMirror.tsx` are fully styled with Tailwind CSS and responsive design.
2. Components are completely isolated and ready to be mounted directly into the session arena page (`session/[sessionId]/page.tsx`) in Phase D.
3. All tests pass with zero regressions and zero TypeScript compiler errors.

