
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import FitnessCameraView from "../../../features/motion/components/FitnessCameraView";
import { useGameStore } from "../../../store/gameStore";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

type Exercise =
  | "Squats"
  | "Jumping Jacks"
  | "Arm Raises";

const GAME_DURATION = 30;
const POINTS_PER_REP = 10;

function calculateAngle(
  a: Landmark,
  b: Landmark,
  c: Landmark,
) {
  const radians =
    Math.atan2(
      c.y - b.y,
      c.x - b.x,
    ) -
    Math.atan2(
      a.y - b.y,
      a.x - b.x,
    );

  let angle =
    Math.abs(
      (radians * 180) / Math.PI,
    );

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
}

function getExerciseInstruction(
  currentExercise: Exercise,
) {
  if (currentExercise === "Squats") {
    return "Squat down!";
  }

  if (currentExercise === "Jumping Jacks") {
    return "Jump and raise your arms!";
  }

  return "Raise both arms!";
}

function FitnessChallengeGame() {
  /*
   * ======================================
   * ZUSTAND STORE
   * ======================================
   */

  const playerName = useGameStore(
    (state) => state.playerName,
  );

  const addScore = useGameStore(
    (state) => state.addScore,
  );

  /*
   * ======================================
   * STATE
   * ======================================
   */

  const [score, setScore] = useState(0);

  const [reps, setReps] = useState(0);

  const [timeLeft, setTimeLeft] =
    useState(GAME_DURATION);

  const [combo, setCombo] = useState(0);

  const [exercise, setExercise] =
    useState<Exercise>("Squats");

  const [feedback, setFeedback] =
    useState("Get ready!");

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  /*
   * ======================================
   * REFS
   * ======================================
   */

  const exerciseRef =
    useRef<Exercise>("Squats");

  const gameStartedRef =
    useRef(false);

  const lastRepTimeRef =
    useRef(0);

  const squatDownRef =
    useRef(false);

  const previousJumpStateRef =
    useRef(false);

  const previousArmStateRef =
    useRef(false);

  const timerRef =
    useRef<number | null>(null);

  /*
   * Prevent duplicate leaderboard
   * entries for the same game.
   */

  const scoreSavedRef =
    useRef(false);

  /*
   * ======================================
   * SAVE SCORE
   * ======================================
   */

  const saveGameScore = useCallback(
    (finalScore: number) => {
      if (scoreSavedRef.current) {
        return;
      }

      scoreSavedRef.current = true;

      addScore({
        playerName:
          playerName || "Player",

        gameId:
          "fitness-challenge",

        gameTitle:
          "Fitness Challenge",

        score: finalScore,
      });

      console.log(
        "Fitness Challenge score saved:",
        finalScore,
      );
    },
    [addScore, playerName],
  );

  /*
   * ======================================
   * START GAME
   * ======================================
   */

  const startGame = useCallback(() => {
    console.log(
      "Fitness Challenge: START GAME",
    );

    /*
     * Reset score.
     */

    setScore(0);

    setReps(0);

    setCombo(0);

    setTimeLeft(
      GAME_DURATION,
    );

    /*
     * Reset exercise.
     */

    setExercise("Squats");

    exerciseRef.current =
      "Squats";

    setFeedback(
      "Squat down!",
    );

    /*
     * Reset movement detection.
     */

    squatDownRef.current =
      false;

    previousJumpStateRef.current =
      false;

    previousArmStateRef.current =
      false;

    lastRepTimeRef.current =
      0;

    /*
     * Reset score saving.
     */

    scoreSavedRef.current =
      false;

    /*
     * Clear old timer.
     */

    if (
      timerRef.current !== null
    ) {
      window.clearInterval(
        timerRef.current,
      );

      timerRef.current =
        null;
    }

    /*
     * Reset game state.
     */

    setGameOver(false);

    gameStartedRef.current =
      true;

    setGameStarted(true);
  }, []);

  /*
   * ======================================
   * END GAME
   * ======================================
   */

  const endGame = useCallback(() => {
    console.log(
      "Fitness Challenge: GAME OVER",
    );

    /*
     * Stop the game.
     */

    gameStartedRef.current =
      false;

    setGameStarted(false);

    setGameOver(true);

    /*
     * Stop timer.
     */

    if (
      timerRef.current !== null
    ) {
      window.clearInterval(
        timerRef.current,
      );

      timerRef.current =
        null;
    }

    /*
     * ==================================
     * SAVE FINAL SCORE
     * ==================================
     *
     * IMPORTANT:
     *
     * React state updates can be
     * asynchronous.
     *
     * Therefore we get the latest
     * score directly from the state
     * updater before saving.
     */

    setScore((finalScore) => {
      saveGameScore(finalScore);

      return finalScore;
    });
  }, [saveGameScore]);

  /*
   * ======================================
   * GAME TIMER
   * ======================================
   */

  useEffect(() => {
    if (!gameStarted) {
      return;
    }

    const startTime =
      Date.now();

    timerRef.current =
      window.setInterval(() => {
        const elapsed =
          Math.floor(
            (Date.now() -
              startTime) /
              1000,
          );

        const remaining =
          Math.max(
            0,
            GAME_DURATION -
              elapsed,
          );

        setTimeLeft(
          remaining,
        );

        if (remaining <= 0) {
          endGame();
        }
      }, 250);

    return () => {
      if (
        timerRef.current !== null
      ) {
        window.clearInterval(
          timerRef.current,
        );

        timerRef.current =
          null;
      }
    };
  }, [
    gameStarted,
    endGame,
  ]);

  /*
   * ======================================
   * CHANGE EXERCISE
   * ======================================
   */

  const changeExercise =
    useCallback(() => {
      const exercises: Exercise[] =
        [
          "Squats",
          "Jumping Jacks",
          "Arm Raises",
        ];

      const currentIndex =
        exercises.indexOf(
          exerciseRef.current,
        );

      const nextExercise =
        exercises[
          (currentIndex + 1) %
            exercises.length
        ];

      exerciseRef.current =
        nextExercise;

      setExercise(
        nextExercise,
      );

      /*
       * Reset exercise detection.
       */

      squatDownRef.current =
        false;

      previousJumpStateRef.current =
        false;

      previousArmStateRef.current =
        false;

      setFeedback(
        getExerciseInstruction(
          nextExercise,
        ),
      );
    }, []);

  /*
   * ======================================
   * COMPLETE REP
   * ======================================
   */

  const completeRep =
    useCallback(() => {
      const now =
        performance.now();

      /*
       * Prevent accidental
       * duplicate reps.
       */

      if (
        now -
          lastRepTimeRef.current <
        700
      ) {
        return;
      }

      lastRepTimeRef.current =
        now;

      /*
       * Increase reps.
       */

      setReps(
        (previous) =>
          previous + 1,
      );

      /*
       * Increase combo.
       */

      setCombo(
        (previous) =>
          Math.min(
            previous + 1,
            10,
          ),
      );

      /*
       * Add points.
       */

      setScore(
        (previous) =>
          previous +
          POINTS_PER_REP,
      );

      setFeedback(
        "🔥 GREAT REP!",
      );

      /*
       * Return to exercise
       * instruction.
       */

      window.setTimeout(() => {
        if (
          gameStartedRef.current
        ) {
          setFeedback(
            getExerciseInstruction(
              exerciseRef.current,
            ),
          );
        }
      }, 600);
    }, []);

  /*
   * ======================================
   * POSE DETECTION
   * ======================================
   */

  const handlePoseDetected =
    useCallback(
      (landmarks: Landmark[]) => {
        if (
          !gameStartedRef.current
        ) {
          return;
        }

        /*
         * MediaPipe pose landmarks.
         */

        const leftShoulder =
          landmarks[11];

        const rightShoulder =
          landmarks[12];

        const leftWrist =
          landmarks[15];

        const rightWrist =
          landmarks[16];

        const leftHip =
          landmarks[23];

        const rightHip =
          landmarks[24];

        const leftKnee =
          landmarks[25];

        const rightKnee =
          landmarks[26];

        const leftAnkle =
          landmarks[27];

        const rightAnkle =
          landmarks[28];

        if (
          !leftShoulder ||
          !rightShoulder ||
          !leftHip ||
          !rightHip
        ) {
          return;
        }

        /*
         * ==================================
         * SQUATS
         * ==================================
         */

        if (
          exerciseRef.current ===
          "Squats"
        ) {
          if (
            !leftKnee ||
            !rightKnee ||
            !leftAnkle ||
            !rightAnkle
          ) {
            return;
          }

          const leftKneeAngle =
            calculateAngle(
              leftHip,
              leftKnee,
              leftAnkle,
            );

          const rightKneeAngle =
            calculateAngle(
              rightHip,
              rightKnee,
              rightAnkle,
            );

          const kneeAngle =
            (leftKneeAngle +
              rightKneeAngle) /
            2;

          /*
           * Squat down.
           */

          if (
            kneeAngle < 115
          ) {
            squatDownRef.current =
              true;

            setFeedback(
              "⬇️ GO LOWER!",
            );
          }

          /*
           * Stand back up.
           * This completes one rep.
           */

          if (
            squatDownRef.current &&
            kneeAngle > 155
          ) {
            squatDownRef.current =
              false;

            completeRep();
          }
        }

        /*
         * ==================================
         * JUMPING JACKS
         * ==================================
         */

        if (
          exerciseRef.current ===
          "Jumping Jacks"
        ) {
          if (
            !leftWrist ||
            !rightWrist ||
            !leftAnkle ||
            !rightAnkle
          ) {
            return;
          }

          const shoulderY =
            (leftShoulder.y +
              rightShoulder.y) /
            2;

          const leftWristAbove =
            leftWrist.y <
            shoulderY - 0.15;

          const rightWristAbove =
            rightWrist.y <
            shoulderY - 0.15;

          const legsApart =
            Math.abs(
              leftAnkle.x -
                rightAnkle.x,
            ) > 0.25;

          const armsUp =
            leftWristAbove &&
            rightWristAbove;

          const jumpingState =
            armsUp &&
            legsApart;

          /*
           * Count only when
           * entering the jumping state.
           */

          if (
            jumpingState &&
            !previousJumpStateRef.current
          ) {
            completeRep();
          }

          previousJumpStateRef.current =
            jumpingState;

          if (
            jumpingState
          ) {
            setFeedback(
              "⬇️ Bring arms and legs down!",
            );
          } else {
            setFeedback(
              "⬆️ Jump and raise arms!",
            );
          }
        }

        /*
         * ==================================
         * ARM RAISES
         * ==================================
         */

        if (
          exerciseRef.current ===
          "Arm Raises"
        ) {
          if (
            !leftWrist ||
            !rightWrist
          ) {
            return;
          }

          const shoulderY =
            (leftShoulder.y +
              rightShoulder.y) /
            2;

          const armsUp =
            leftWrist.y <
              shoulderY - 0.15 &&
            rightWrist.y <
              shoulderY - 0.15;

          /*
           * Count only when
           * arms move into raised state.
           */

          if (
            armsUp &&
            !previousArmStateRef.current
          ) {
            completeRep();
          }

          previousArmStateRef.current =
            armsUp;

          if (armsUp) {
            setFeedback(
              "⬇️ Lower your arms!",
            );
          } else {
            setFeedback(
              "⬆️ Raise both arms!",
            );
          }
        }
      },
      [completeRep],
    );

  /*
   * ======================================
   * CLEANUP
   * ======================================
   */

  useEffect(() => {
    return () => {
      gameStartedRef.current =
        false;

      if (
        timerRef.current !== null
      ) {
        window.clearInterval(
          timerRef.current,
        );

        timerRef.current =
          null;
      }
    };
  }, []);

  /*
   * ======================================
   * RENDER
   * ======================================
   */

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">

      {/* ================================= */}
      {/* START SCREEN */}
      {/* ================================= */}

      {!gameStarted &&
        !gameOver && (
          <div className="relative min-h-[600px]">

            <div className="absolute inset-0">
              <FitnessCameraView
                onPoseDetected={
                  handlePoseDetected
                }
              />
            </div>

            <div className="absolute inset-0 z-20 bg-black/50" />

            <div className="absolute inset-0 z-30 flex items-center justify-center px-6">

              <div className="flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-black/80 px-8 py-10 text-center shadow-2xl backdrop-blur-md">

                <div className="text-7xl">
                  🏋️
                </div>

                <h2 className="mt-5 text-4xl font-black text-white">
                  Fitness Challenge
                </h2>

                <p className="mt-4 max-w-md text-gray-300">
                  Follow the exercises
                  using your full body
                  and earn points!
                </p>

                <div className="mt-6 space-y-2 text-sm text-gray-400">
                  <p>
                    🦵 Squats
                  </p>

                  <p>
                    🙆 Jumping Jacks
                  </p>

                  <p>
                    💪 Arm Raises
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    startGame
                  }
                  className="mt-8 cursor-pointer rounded-xl bg-white px-10 py-4 text-lg font-bold text-black shadow-lg transition duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95"
                >
                  Start Challenge
                </button>

              </div>

            </div>
          </div>
        )}

      {/* ================================= */}
      {/* GAME */}
      {/* ================================= */}

      {gameStarted && (
        <div className="relative min-h-[600px] w-full overflow-hidden">

          {/* CAMERA */}

          <div className="absolute inset-0 z-0">
            <FitnessCameraView
              onPoseDetected={
                handlePoseDetected
              }
            />
          </div>

          {/* CAMERA OVERLAY */}

          <div className="pointer-events-none absolute inset-0 z-10 bg-black/10" />

          {/* ================================= */}
          {/* HUD */}
          {/* ================================= */}

          <div className="pointer-events-none absolute left-5 right-5 top-5 z-50 flex items-start justify-between gap-3">

            {/* SCORE */}

            <div className="rounded-xl bg-black/75 px-4 py-2 backdrop-blur">
              <p className="text-xs text-gray-400">
                SCORE
              </p>

              <p className="text-3xl font-black text-white">
                {score}
              </p>
            </div>

            {/* REPS */}

            <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">
              <p className="text-xs text-gray-400">
                REPS
              </p>

              <p className="text-3xl font-black text-white">
                {reps}
              </p>
            </div>

            {/* COMBO */}

            <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">
              <p className="text-xs text-gray-400">
                COMBO
              </p>

              <p className="text-3xl font-black text-orange-400">
                {combo}x
              </p>
            </div>

            {/* TIME */}

            <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">
              <p className="text-xs text-gray-400">
                TIME
              </p>

              <p
                className={`text-3xl font-black ${
                  timeLeft <= 10
                    ? "text-red-400"
                    : "text-white"
                }`}
              >
                {timeLeft}
              </p>
            </div>

          </div>

          {/* ================================= */}
          {/* CURRENT EXERCISE */}
          {/* ================================= */}

          <div className="pointer-events-none absolute bottom-6 left-1/2 z-40 w-[90%] max-w-xl -translate-x-1/2">

            <div className="rounded-2xl bg-black/80 px-6 py-4 text-center backdrop-blur-md">

              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                Current Exercise
              </p>

              <p className="mt-1 text-3xl font-black text-white">
                {exercise}
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {feedback}
              </p>

            </div>

          </div>

          {/* ================================= */}
          {/* CHANGE EXERCISE */}
          {/* ================================= */}

          <button
            type="button"
            onClick={
              changeExercise
            }
            className="absolute bottom-6 right-6 z-50 cursor-pointer rounded-xl bg-white/90 px-4 py-3 text-sm font-bold text-black shadow-lg transition hover:scale-105 hover:bg-white active:scale-95"
          >
            Change Exercise
          </button>

        </div>
      )}

      {/* ================================= */}
      {/* GAME OVER */}
      {/* ================================= */}

      {gameOver && (
        <div className="relative min-h-[600px]">

          <div className="absolute inset-0">
            <FitnessCameraView
              onPoseDetected={
                handlePoseDetected
              }
            />
          </div>

          <div className="absolute inset-0 z-40 flex min-h-[600px] flex-col items-center justify-center bg-black/85 px-6 text-center backdrop-blur-sm">

            <div className="text-7xl">
              🏆
            </div>

            <h2 className="mt-5 text-4xl font-black text-white">
              Challenge Complete
            </h2>

            <p className="mt-5 text-lg text-gray-400">
              Final Score
            </p>

            <p className="mt-1 text-6xl font-black text-white">
              {score}
            </p>

            <p className="mt-5 text-lg text-gray-400">
              Total Reps
            </p>

            <p className="text-4xl font-black text-white">
              {reps}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Score saved to leaderboard
            </p>

            <button
              type="button"
              onClick={
                startGame
              }
              className="mt-8 cursor-pointer rounded-xl bg-white px-10 py-4 text-lg font-bold text-black shadow-lg transition hover:scale-105 hover:bg-gray-200 active:scale-95"
            >
              Try Again
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default FitnessChallengeGame;
