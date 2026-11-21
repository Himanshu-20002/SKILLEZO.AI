'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Video, VideoOff, Mic, MicOff, AlertCircle, User, ShieldCheck } from 'lucide-react';

export interface CandidateWebcamMirrorProps {
  candidateName?: string;
  isListening?: boolean;
  onCameraStateChange?: (isEnabled: boolean) => void;
  onMicStateChange?: (isEnabled: boolean) => void;
  className?: string;
}

export const CandidateWebcamMirror: React.FC<CandidateWebcamMirrorProps> = ({
  candidateName = 'You (Candidate)',
  isListening = false,
  onCameraStateChange,
  onMicStateChange,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wasCameraOnBeforeHideRef = useRef<boolean>(false);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Safely assign stream to video element
  const attachStreamToVideo = useCallback((stream: MediaStream) => {
    if (videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      try {
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      } catch {
        // Ignored
      }
    }
  }, []);

  // Setup Web Audio API volume visualizer
  const setupAudioAnalyzer = useCallback((stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      setAudioLevel(0);
    }
  }, []);

  // Cleanup stream and audio context
  const cleanupStream = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignored
      }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.enabled = false;
        try {
          track.stop();
        } catch {
          // Ignored
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Request camera and microphone access
  const initializeMedia = useCallback(async () => {
    setErrorStatus(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setHasPermission(false);
      setErrorStatus('Camera and microphone are not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 } },
        audio: true,
      });

      streamRef.current = stream;
      setHasPermission(true);
      attachStreamToVideo(stream);
      setupAudioAnalyzer(stream);
    } catch (err: unknown) {
      setHasPermission(false);
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');

      setErrorStatus(
        isDenied
          ? 'Camera or microphone access was denied. You can still practice with keyboard responses.'
          : 'Unable to access camera. Please check your device connections.'
      );
    }
  }, [setupAudioAnalyzer, attachStreamToVideo]);

  useEffect(() => {
    initializeMedia();
    return () => {
      cleanupStream();
    };
  }, [initializeMedia, cleanupStream]);

  // Synchronize stream attachment when permissions or camera toggle updates
  useEffect(() => {
    if (hasPermission && isCameraOn && streamRef.current) {
      attachStreamToVideo(streamRef.current);
    }
  }, [hasPermission, isCameraOn, attachStreamToVideo]);

  // Release camera hardware when user switches tab, minimizes window, or unloads page
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (typeof document === 'undefined') return;

      if (document.hidden) {
        // User switched to another tab or minimized the browser -> turn off hardware camera & LED
        if (isCameraOn && streamRef.current) {
          wasCameraOnBeforeHideRef.current = true;
          const videoTracks = streamRef.current.getVideoTracks();
          videoTracks.forEach((track) => {
            track.enabled = false;
            try {
              track.stop();
            } catch {
              // Ignored
            }
            if (typeof streamRef.current?.removeTrack === 'function') {
              try {
                streamRef.current.removeTrack(track);
              } catch {
                // Ignored
              }
            }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      } else {
        // User returned to this tab -> re-acquire camera stream if camera was enabled
        if (wasCameraOnBeforeHideRef.current && isCameraOn) {
          wasCameraOnBeforeHideRef.current = false;
          try {
            if (
              typeof navigator !== 'undefined' &&
              navigator.mediaDevices &&
              typeof navigator.mediaDevices.getUserMedia === 'function'
            ) {
              const videoStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 360 } },
              });
              const newVideoTrack = videoStream.getVideoTracks()[0];
              if (newVideoTrack) {
                if (streamRef.current && typeof streamRef.current.addTrack === 'function') {
                  streamRef.current.addTrack(newVideoTrack);
                  attachStreamToVideo(streamRef.current);
                } else {
                  streamRef.current = videoStream;
                  attachStreamToVideo(videoStream);
                }
              }
            }
          } catch {
            // Ignored if permissions were revoked while away
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', cleanupStream);
    window.addEventListener('pagehide', cleanupStream);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', cleanupStream);
      window.removeEventListener('pagehide', cleanupStream);
    };
  }, [isCameraOn, attachStreamToVideo, cleanupStream]);

  // Toggle Camera
  const toggleCamera = async () => {
    if (!hasPermission) return;
    const nextState = !isCameraOn;
    setIsCameraOn(nextState);
    onCameraStateChange?.(nextState);

    if (!nextState) {
      // User turned camera OFF -> completely stop hardware tracks to extinguish camera LED light
      if (streamRef.current) {
        const videoTracks = streamRef.current.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = false;
          try {
            track.stop();
          } catch {
            // Ignored
          }
          if (typeof streamRef.current?.removeTrack === 'function') {
            try {
              streamRef.current.removeTrack(track);
            } catch {
              // Ignored
            }
          }
        });
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      // User turned camera ON -> re-acquire video track so hardware activates
      try {
        if (
          typeof navigator !== 'undefined' &&
          navigator.mediaDevices &&
          typeof navigator.mediaDevices.getUserMedia === 'function'
        ) {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 360 } },
          });
          const newVideoTrack = videoStream.getVideoTracks()[0];
          if (newVideoTrack) {
            if (streamRef.current && typeof streamRef.current.addTrack === 'function') {
              streamRef.current.addTrack(newVideoTrack);
              attachStreamToVideo(streamRef.current);
            } else {
              streamRef.current = videoStream;
              attachStreamToVideo(videoStream);
            }
          }
        }
      } catch (err) {
        console.error('[CandidateWebcamMirror] Failed to re-activate camera:', err);
        setIsCameraOn(false);
        onCameraStateChange?.(false);
      }
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    const nextState = !isMicMuted;
    audioTracks.forEach((track) => {
      track.enabled = !nextState;
    });
    setIsMicMuted(nextState);
    if (nextState) setAudioLevel(0);
    onMicStateChange?.(!nextState);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative h-full min-h-[280px] flex-1 w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 text-white shadow-md flex flex-col justify-between ${className}`}>
      {/* Header Bar (h-11 for exact symmetry with AI stage) */}
      <div className="relative z-10 flex h-11 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-white">{candidateName}</span>
        </div>

        {/* Privacy Pill */}
        <div className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/60 shadow-xs">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Local Mirror Only</span>
        </div>
      </div>

      {/* Middle Video Container (flex-1 for exact symmetry) */}
      <div className="relative flex-1 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* Active Mirrored Video Element */}
        {hasPermission === true && (
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el && streamRef.current && el.srcObject !== streamRef.current) {
                try {
                  el.srcObject = streamRef.current;
                  const playPromise = el.play();
                  if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                  }
                } catch {
                  // Ignored
                }
              }
            }}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              try {
                const p = videoRef.current?.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
              } catch {
                // Ignored
              }
            }}
            data-testid="candidate-video-feed"
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              isCameraOn ? 'opacity-100 block' : 'opacity-0 hidden'
            }`}
            style={{ transform: 'scaleX(-1)' }}
          />
        )}

        {/* Fallback View: Camera Turned Off by User */}
        {hasPermission && !isCameraOn && (
          <div
            data-testid="camera-off-fallback"
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-4 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-base font-bold text-slate-200 ring-2 ring-slate-700">
              {getInitials(candidateName)}
            </div>
            <p className="mt-2 text-xs font-medium text-slate-300">Camera is turned off</p>
            <p className="text-[10px] text-slate-500">Click Cam On to restore preview</p>
          </div>
        )}

        {/* Fallback View: Permission Denied or Device Unavailable */}
        {hasPermission === false && (
          <div
            data-testid="camera-permission-fallback"
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 p-4 text-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h4 className="mt-2 text-xs font-semibold text-slate-200">Camera Feed Unavailable</h4>
            <p className="mt-0.5 max-w-[220px] text-[11px] text-slate-400">{errorStatus}</p>
            <button
              type="button"
              onClick={initializeMedia}
              className="mt-2 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
            >
              Retry Access
            </button>
          </div>
        )}

        {/* Listening Active Highlight Border */}
        {isListening && (
          <div className="pointer-events-none absolute inset-0 border-2 border-emerald-500/70 animate-pulse" />
        )}
      </div>

      {/* Media Controls Bar (h-12 for exact symmetry with AI stage) */}
      <div className="relative z-10 flex h-12 items-center justify-between border-t border-slate-800/80 bg-slate-900/90 px-4">
        {/* Real-Time Audio Decibel Visualizer */}
        <div className="flex items-center gap-1.5" aria-label="Microphone Volume Meter">
          <span className="text-[11px] font-medium text-slate-400">Mic:</span>
          <div className="flex h-3 items-end gap-1">
            {[20, 40, 60, 80, 100].map((threshold, idx) => {
              const isActive = !isMicMuted && audioLevel >= threshold * 0.4;
              return (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isActive
                      ? threshold > 80
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${(idx + 1) * 20}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            disabled={!hasPermission}
            data-testid="btn-toggle-camera"
            title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
              isCameraOn
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {isCameraOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
            <span>{isCameraOn ? 'Cam On' : 'Cam Off'}</span>
          </button>

          {/* Microphone Mute Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            disabled={!hasPermission}
            data-testid="btn-toggle-mic"
            title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
              !isMicMuted
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {!isMicMuted ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            <span>{!isMicMuted ? 'Mute' : 'Unmuted'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
