import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface FitnessCameraViewProps {
  onPoseDetected?: (landmarks: Landmark[]) => void;
}

function FitnessCameraView({ onPoseDetected }: FitnessCameraViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // START CAMERA
  // ========================================

  const startCamera = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await video.play();

      setCameraReady(true);

      // ========================================
      // MEDIAPIPE
      // ========================================

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
      );

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseLandmarkerRef.current = poseLandmarker;

      setLoading(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        /*
         * A newer camera/load request superseded this one
         * (e.g. React's double-invoked effect in dev mode).
         * The other attempt is still running - ignore this one.
         */
        return;
      }

      console.error("Fitness camera error:", err);

      setLoading(false);

      setError(
        "Unable to access camera. Please allow camera permission and try again.",
      );
    }
  }, []);

  // ========================================
  // POSE DETECTION
  // ========================================

  const detectPose = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (!video || !canvas || !poseLandmarker || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const currentTime = performance.now();

    try {
      const result = poseLandmarker.detectForVideo(video, currentTime);
      const ctx = canvas.getContext("2d");

      if (result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0];

        onPoseDetected?.(landmarks);

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Landmark points
          landmarks.forEach((landmark) => {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.fill();
          });

          // Pose connections
          const connections = [
            [11, 12],
            [11, 13],
            [13, 15],
            [12, 14],
            [14, 16],

            [11, 23],
            [12, 24],
            [23, 24],

            [23, 25],
            [25, 27],
            [24, 26],
            [26, 28],

            [27, 29],
            [29, 31],
            [28, 30],
            [30, 32],
          ];

          ctx.strokeStyle = "rgba(255,255,255,0.85)";
          ctx.lineWidth = 3;

          connections.forEach(([start, end]) => {
            const a = landmarks[start];
            const b = landmarks[end];

            if (!a || !b) {
              return;
            }

            ctx.beginPath();
            ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
            ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
            ctx.stroke();
          });
        }
      } else {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    } catch (err) {
      console.warn("Pose detection error:", err);
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  }, [onPoseDetected]);

  // ========================================
  // INITIALIZATION
  // ========================================

  useEffect(() => {
    startCamera();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  // ========================================
  // START DETECTION
  // ========================================

  useEffect(() => {
    if (cameraReady && poseLandmarkerRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
    }
  }, [cameraReady, detectPose]);

  // ========================================
  // UI
  // ========================================

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* CAMERA */}
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
        autoPlay
        muted
        playsInline
      />

      {/* SKELETON */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {/* LOADING */}
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <p className="text-lg font-semibold text-white">
              Preparing camera...
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Loading AI body tracking
            </p>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-6">
          <div className="max-w-md rounded-2xl bg-black p-8 text-center">
            <div className="text-5xl">📷</div>
            <h2 className="mt-4 text-2xl font-bold text-white">
              Camera Error
            </h2>
            <p className="mt-3 text-gray-400">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="pointer-events-auto mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* CAMERA STATUS */}
      {!loading && !error && cameraReady && (
        <div className="pointer-events-none absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
          <span className="text-sm font-medium text-white">
            Body Tracking Active
          </span>
        </div>
      )}
    </div>
  );
}

export default FitnessCameraView;