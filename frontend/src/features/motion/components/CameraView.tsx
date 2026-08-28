import { useEffect, useState } from "react";
import { useMotionTracking } from "../hooks/useMotionTracking";

interface CameraViewProps {
  onHandMove?: (x: number, y: number) => void;
}

function CameraView({
  onHandMove,
}: CameraViewProps) {
  const [video, setVideo] =
    useState<HTMLVideoElement | null>(null);

  const { hand, isTracking } =
    useMotionTracking(video);

  /*
   * Start camera
   */
  useEffect(() => {
    const videoElement =
      document.getElementById(
        "movearcade-camera",
      ) as HTMLVideoElement | null;

    if (!videoElement) {
      return;
    }

    let stream: MediaStream | null = null;
    let mounted = true;

    const startCamera = async () => {
      try {
        stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              /*
               * Lower resolution reduces
               * MediaPipe workload and lag.
               */
              width: {
                ideal: 960,
              },

              height: {
                ideal: 540,
              },

              frameRate: {
                ideal: 30,
                max: 30,
              },

              facingMode: "user",
            },

            audio: false,
          });

        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );

          return;
        }

        videoElement.srcObject =
          stream;

        /*
         * Don't wait unnecessarily
         * for metadata.
         */
        await videoElement.play();

        if (mounted) {
          setVideo(videoElement);
        }
      } catch (error) {
        console.error(
          "Camera access failed:",
          error,
        );
      }
    };

    startCamera();

    return () => {
      mounted = false;

      stream
        ?.getTracks()
        .forEach((track) =>
          track.stop(),
        );

      videoElement.pause();
      videoElement.srcObject = null;

      setVideo(null);
    };
  }, []);

  /*
   * Convert MediaPipe coordinates
   * to the mirrored camera display.
   */
  const displayX = hand
    ? (1 - hand.x) * 100
    : 0;

  const displayY = hand
    ? hand.y * 100
    : 0;

  /*
   * Send hand position to game.
   */
  useEffect(() => {
    if (!hand) {
      return;
    }

    onHandMove?.(
      1 - hand.x,
      hand.y,
    );
  }, [hand, onHandMove]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black">

      {/* ========================= */}
      {/* CAMERA */}
      {/* ========================= */}

      <video
        id="movearcade-camera"
        autoPlay
        playsInline
        muted
        className="block h-auto w-full -scale-x-100 object-cover"
      />

      {/* ========================= */}
      {/* TRACKING STATUS */}
      {/* ========================= */}

      <div className="absolute left-4 top-4 z-30 rounded-xl bg-black/70 px-4 py-3 backdrop-blur">

        <div className="flex items-center gap-2">

          <span
            className={`h-3 w-3 rounded-full ${
              isTracking
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />

          <span className="text-sm font-medium text-white">
            {isTracking
              ? "Hand Detected"
              : "No Hand Detected"}
          </span>

        </div>

        {hand && (
          <div className="mt-2 text-xs text-gray-300">
            X: {displayX.toFixed(2)}
            <br />
            Y: {displayY.toFixed(2)}
          </div>
        )}

      </div>

      {/* ========================= */}
      {/* INDEX FINGER CURSOR */}
      {/* ========================= */}

      {hand && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: `${displayX}%`,
            top: `${displayY}%`,
            transform:
              "translate(-50%, -50%)",
          }}
        >

          {/* Outer glow */}

          <div className="absolute -inset-2 rounded-full bg-white/20 blur-md" />

          {/* Cursor */}

          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/30 shadow-[0_0_12px_rgba(255,255,255,0.9)]">

            <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" />

          </div>

        </div>
      )}

    </div>
  );
}

export default CameraView;