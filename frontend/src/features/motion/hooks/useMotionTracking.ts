import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

import type {
  HandPosition,
  MotionState,
} from "../types";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/*
 * Detect at approximately 30 FPS.
 * This keeps MediaPipe from consuming
 * too much CPU/GPU.
 */
const DETECTION_INTERVAL = 33;

/*
 * Small smoothing value.
 *
 * Lower = faster response.
 * Higher = smoother but more delay.
 */
const SMOOTHING = 0.35;

export function useMotionTracking(
  video: HTMLVideoElement | null,
): MotionState {
  const handLandmarkerRef =
    useRef<HandLandmarker | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const lastDetectionTimeRef =
    useRef(0);

  /*
   * Keep the latest hand position
   * outside React state.
   */
  const positionRef =
    useRef<HandPosition | null>(null);

  /*
   * Keep smoothed position here.
   */
  const smoothedPositionRef =
    useRef<HandPosition | null>(null);

  const [hand, setHand] =
    useState<HandPosition | null>(null);

  const [isTracking, setIsTracking] =
    useState(false);

  useEffect(() => {
    if (!video) {
      return;
    }

    let cancelled = false;

    const initializeTracker =
      async () => {
        try {
          console.log(
            "Loading MediaPipe...",
          );

          const vision =
            await FilesetResolver.forVisionTasks(
              WASM_PATH,
            );

          console.log(
            "MediaPipe vision loaded.",
          );

          const handLandmarker =
            await HandLandmarker.createFromOptions(
              vision,
              {
                baseOptions: {
                  modelAssetPath:
                    MODEL_PATH,

                  /*
                   * GPU gives better performance
                   * on supported systems.
                   */
                  delegate: "GPU",
                },

                runningMode: "VIDEO",

                /*
                 * We only need one hand.
                 */
                numHands: 1,

                /*
                 * Slightly relaxed detection
                 * improves responsiveness.
                 */
                minHandDetectionConfidence:
                  0.45,

                minHandPresenceConfidence:
                  0.45,

                minTrackingConfidence:
                  0.45,
              },
            );

          if (cancelled) {
            handLandmarker.close();
            return;
          }

          console.log(
            "Hand Landmarker ready.",
          );

          handLandmarkerRef.current =
            handLandmarker;

          const detectHand = (
            timestamp: number,
          ) => {
            if (cancelled) {
              return;
            }

            /*
             * Limit MediaPipe detection
             * to approximately 30 FPS.
             */
            if (
              timestamp -
                lastDetectionTimeRef.current <
              DETECTION_INTERVAL
            ) {
              animationFrameRef.current =
                requestAnimationFrame(
                  detectHand,
                );

              return;
            }

            lastDetectionTimeRef.current =
              timestamp;

            /*
             * Camera isn't ready yet.
             */
            if (
              video.readyState <
              HTMLMediaElement.HAVE_CURRENT_DATA
            ) {
              animationFrameRef.current =
                requestAnimationFrame(
                  detectHand,
                );

              return;
            }

            try {
              const result =
                handLandmarker.detectForVideo(
                  video,
                  timestamp,
                );

              if (
                result.landmarks.length >
                0
              ) {
                const indexFinger =
                  result.landmarks[0][8];

                const rawX =
                  indexFinger.x;

                const rawY =
                  indexFinger.y;

                /*
                 * ========================
                 * SMOOTHING
                 * ========================
                 */

                if (
                  !smoothedPositionRef.current
                ) {
                  smoothedPositionRef.current =
                    {
                      x: rawX,
                      y: rawY,
                    };
                } else {
                  const previous =
                    smoothedPositionRef.current;

                  smoothedPositionRef.current =
                    {
                      x:
                        previous.x +
                        (rawX -
                          previous.x) *
                          SMOOTHING,

                      y:
                        previous.y +
                        (rawY -
                          previous.y) *
                          SMOOTHING,
                    };
                }

                const newPosition =
                  smoothedPositionRef.current;

                positionRef.current =
                  newPosition;

                /*
                 * Update React state.
                 */
                setHand(
                  newPosition,
                );

                setIsTracking(
                  true,
                );
              } else {
                positionRef.current =
                  null;

                smoothedPositionRef.current =
                  null;

                setHand(null);

                setIsTracking(
                  false,
                );
              }
            } catch (error) {
              console.error(
                "Hand detection error:",
                error,
              );
            }

            animationFrameRef.current =
              requestAnimationFrame(
                detectHand,
              );
          };

          animationFrameRef.current =
            requestAnimationFrame(
              detectHand,
            );
        } catch (error) {
          console.error(
            "MediaPipe initialization failed:",
            error,
          );

          setHand(null);

          setIsTracking(false);
        }
      };

    initializeTracker();

    return () => {
      cancelled = true;

      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );

        animationFrameRef.current =
          null;
      }

      handLandmarkerRef.current?.close();

      handLandmarkerRef.current =
        null;

      positionRef.current = null;

      smoothedPositionRef.current =
        null;
    };
  }, [video]);

  return {
    hand,
    isTracking,
  };
}