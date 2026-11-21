# 🎙️ Technical Execution Plan: Phase A — Voice & Speech Engine Foundation

**Document:** 09_PHASE_A_VOICE_AND_SPEECH_ENGINE_PLAN.md  
**Module:** SKILLEZO AI Mock Interview Coach — Voice & Speech Layer  
**Target:** Production-grade Browser-Native Speech Synthesis (TTS) and Speech Recognition (STT) Engines  
**Parent Plan:** [`08_VISUAL_AND_VOICE_INTERVIEW_ARENA_UPGRADE_PLAN.md`](./08_VISUAL_AND_VOICE_INTERVIEW_ARENA_UPGRADE_PLAN.md)  
**Status:** 🟢 **100% Completed, Verified & Passing (Zero TypeScript Errors)**  

---

## 🎯 1. Objective & Scope

The objective of **Phase A** is to construct the complete voice processing foundation that gives the AI Interviewer a natural spoken voice and allows candidates to verbally answer questions with live speech-to-text transcription.

### Key Constraints & Principles:
1. **$0 Operating Cost**: 100% powered by standardized browser Web APIs (`window.speechSynthesis` and `window.SpeechRecognition` / `webkitSpeechRecognition`). No third-party paid audio APIs (e.g., ElevenLabs, Whisper, Deepgram) required.
2. **Zero Backend Changes**: The output of voice transcription is pure text, matching the existing `answerText` payload accepted by `POST /api/interviews/sessions/:sessionId/answers`.
3. **Resilient Browser Fallbacks**: If speech recognition or microphone permissions are unavailable (e.g., Firefox desktop or permissions blocked), the system automatically defaults to manual keyboard input without throwing unhandled exceptions.
4. **Chrome Garbage-Collection & Timeout Resilience**: Long TTS sentences in Chromium can stall after ~15 seconds due to browser engine pause bugs. Phase A includes an automatic chunking/keep-alive mechanism to prevent audio cutoff.

---

## 🏗️ 2. Architectural Structure

```
client/
├── lib/
│   └── interview-coach/
│       ├── speech-synthesis.ts      # Browser TTS wrapper with voice selection & keep-alive
│       ├── speech-recognition.ts    # Browser STT wrapper with continuous stream & interim transcripts
│       └── filler-words.ts          # Real-time filler word analysis ("um", "like", "basically")
└── hooks/
    └── interview-coach/
        ├── useSpeechSynthesis.ts    # React hook for interviewer voice playback & state
        └── useSpeechRecognition.ts  # React hook for candidate microphone recording & live transcript
```

---

## 📦 3. Detailed Component Specifications

### 3.1 Speech Synthesis Engine (`client/lib/interview-coach/speech-synthesis.ts`)

Provides a clean TypeScript abstraction over `window.speechSynthesis` and `SpeechSynthesisUtterance`.

```typescript
export interface SpeechSynthesisOptions {
  rate?: number;         // Speech speed (default: 1.0, range: 0.8 - 1.2)
  pitch?: number;        // Voice pitch (default: 1.0)
  volume?: number;       // Voice volume (0 to 1, default: 1)
  voiceName?: string;    // Preferred voice override
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export type PlaybackStatus = 'idle' | 'speaking' | 'paused' | 'error';
```

#### Core Capabilities:
- **`isSpeechSynthesisSupported(): boolean`**: Safe SSR and client environment check.
- **`getEnglishVoices(): Promise<SpeechSynthesisVoice[]>`**: Resolves available browser voices, handling the asynchronous `speechSynthesis.onvoiceschanged` event lifecycle.
- **`selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null`**: Prioritizes natural English voices:
  1. Google US English / Natural English
  2. Apple Samantha / Daniel
  3. Microsoft Zira / David / Mark
  4. Standard `en-US` or `en-GB` fallback
- **`speakUtterance(text: string, options?: SpeechSynthesisOptions): Promise<void>`**:
  - Handles sentence splitting to avoid the 15-second Chromium synthesis freeze bug.
  - Returns a promise that resolves upon completion or rejects cleanly on error.
- **`stopUtterance(): void`**: Immediately halts audio and cleans up timers.
- **`pauseUtterance(): void` & `resumeUtterance(): void`**: Controls audio pause/resume states.

---

### 3.2 Speech Recognition Engine (`client/lib/interview-coach/speech-recognition.ts`)

Provides a continuous microphone audio recognition stream utilizing `window.SpeechRecognition` or `window.webkitSpeechRecognition`.

```typescript
export interface SpeechRecognitionCallbacks {
  onTranscriptChange: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStatusChange: (status: RecognitionStatus) => void;
}

export type RecognitionStatus = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'unsupported' 
  | 'denied' 
  | 'error';
```

#### Core Capabilities:
- **`isSpeechRecognitionSupported(): boolean`**: Detects presence of standard or WebKit vendor-prefixed speech recognition APIs.
- **`createSpeechRecognizer(callbacks: SpeechRecognitionCallbacks)`**:
  - Instantiates speech recognizer with `continuous = true` and `interimResults = true`.
  - Stitches together final confirmed sentences with real-time interim hypothesis text.
  - Automatically handles natural speech pauses without prematurely terminating the session.
  - Normalizes browser-specific error codes (`not-allowed` $\rightarrow$ permission denied, `no-speech` $\rightarrow$ silence timeout).

---

### 3.3 Filler Word Detection Engine (`client/lib/interview-coach/filler-words.ts`)

Analyzes candidate transcripts in real time to provide feedback on verbal confidence.

```typescript
export interface FillerWordAnalysis {
  totalCount: number;
  breakdown: Record<string, number>;
  highlightedTranscript: string;
}
```
- **Tracked Patterns**: `["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"]`.
- **Performance**: High-speed regex matching executed on debounced transcript changes.

---

### 3.4 React Integration Hooks

#### `useSpeechSynthesis` (`client/hooks/interview-coach/useSpeechSynthesis.ts`)
- **State**:
  - `status: PlaybackStatus`
  - `isSpeaking: boolean`
  - `availableVoices: SpeechSynthesisVoice[]`
  - `activeVoice: SpeechSynthesisVoice | null`
- **Actions**:
  - `speak(text: string): Promise<void>`
  - `stop(): void`
  - `setVoice(voice: SpeechSynthesisVoice): void`

#### `useSpeechRecognition` (`client/hooks/interview-coach/useSpeechRecognition.ts`)
- **State**:
  - `status: RecognitionStatus`
  - `isListening: boolean`
  - `transcript: string`
  - `fillerWords: FillerWordAnalysis`
  - `isSupported: boolean`
- **Actions**:
  - `startListening(): void`
  - `stopListening(): void`
  - `resetTranscript(): void`
  - `setTranscript(manualText: string): void`

---

## 🧪 4. Testing & Verification Strategy

### 4.1 Unit Tests (`client/__tests__/interview-coach-speech.test.ts`)
1. **Speech Synthesis Unit Tests**:
   - Verify SSR safety when `window` or `window.speechSynthesis` is undefined.
   - Verify `selectBestVoice` prefers natural English voices over generic system voices.
   - Verify `speakUtterance` cleans up previous active utterances before speaking new text.
2. **Speech Recognition Unit Tests**:
   - Verify recognition events properly separate interim transcripts from final transcripts.
   - Verify error mapping for permission denied and microphone disconnection.
3. **Filler Word Analyzer Unit Tests**:
   - Verify accurate counting and case-insensitive matching of common filler phrases.

### 4.2 Static Quality Gates:
- `./client/node_modules/.bin/tsc.cmd --noEmit -p client/tsconfig.json` returns 0 errors.
- `npm --prefix client test` runs and passes with zero regressions.

---

## 🚀 5. Implementation Roadmap & Deliverables

| Task ID | Deliverable | Target Location | Verification | Status |
| :--- | :--- | :--- | :--- | :---: |
| **A.1** | Speech Synthesis Wrapper | `client/lib/interview-coach/speech-synthesis.ts` | Unit test voice selection and playback handlers | 🟢 Complete |
| **A.2** | Speech Recognition Wrapper | `client/lib/interview-coach/speech-recognition.ts` | Mocked recognition streaming unit tests | 🟢 Complete |
| **A.3** | Filler Word Analysis Utility | `client/lib/interview-coach/filler-words.ts` | Regex token counting test cases | 🟢 Complete |
| **A.4** | Speech Synthesis Hook | `client/hooks/interview-coach/useSpeechSynthesis.ts` | Hook lifecycle and cancel triggers | 🟢 Complete |
| **A.5** | Speech Recognition Hook | `client/hooks/interview-coach/useSpeechRecognition.ts` | Recognition toggle and transcript persistence | 🟢 Complete |
| **A.6** | Test Suite Verification | `client/tests/interview-coach-speech.spec.ts` | Vitest 12/12 unit tests passing | 🟢 Complete |

---

## 🔒 6. Exit Criteria for Phase A

1. All library modules and React hooks are written with strict TypeScript typings.
2. Browser feature detection handles unsupported browsers with clean fallbacks.
3. Unit tests pass with 100% assertion success.
4. Client builds with 0 TypeScript compiler errors.
5. Ready to be plugged directly into **Phase B (Visual Stage & Video Mirror)**.

