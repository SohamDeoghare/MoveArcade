import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import CameraView from "../../../features/motion/components/CameraView";
import { useGameStore } from "../../../store/gameStore";

interface Ball {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  progress: number;
  speed: number;
  size: number;
}

type Difficulty =
  | "Easy"
  | "Medium"
  | "Hard";

const GAME_DURATION = 30;
const STARTING_LIVES = 3;

const DIFFICULTY_SETTINGS = {
  Easy: {
    spawnInterval: 1500,
    speed: 0.00065,
  },

  Medium: {
    spawnInterval: 1100,
    speed: 0.0009,
  },

  Hard: {
    spawnInterval: 750,
    speed: 0.0012,
  },
};

const GOAL_LEFT = 15;
const GOAL_RIGHT = 85;
const GOAL_TOP = 18;
const GOAL_BOTTOM = 82;

const GOALKEEPER_SIZE = 13;
const SAVE_DISTANCE = 13;

function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  return Math.sqrt(
    dx * dx + dy * dy,
  );
}

function GoalkeeperGame() {
  /*
   * ========================================
   * GAME STORE
   * ========================================
   */

  const playerName = useGameStore(
    (state) => state.playerName,
  );

  const addScore = useGameStore(
    (state) => state.addScore,
  );

  /*
   * ========================================
   * GAME STATE
   * ========================================
   */

  const [score, setScore] =
    useState(0);

  const [saves, setSaves] =
    useState(0);

  const [lives, setLives] =
    useState(STARTING_LIVES);

  const [combo, setCombo] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(GAME_DURATION);

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Easy");

  const [balls, setBalls] =
    useState<Ball[]>([]);

  const [feedback, setFeedback] =
    useState("Get ready!");

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  /*
   * ========================================
   * HAND POSITION
   * ========================================
   */

  const handPositionRef =
    useRef<{
      x: number;
      y: number;
    } | null>(null);

  /*
   * ========================================
   * GAME REFS
   * ========================================
   */

  const ballsRef =
    useRef<Ball[]>([]);

  const nextBallId =
    useRef(0);

  const lastSpawnTime =
    useRef(0);

  const lastTime =
    useRef(0);

  const gameStartTime =
    useRef(0);

  const animationFrameRef =
    useRef<number | null>(null);

  const comboRef =
    useRef(0);

  const gameStartedRef =
    useRef(false);

  /*
   * ========================================
   * SCORE SAVING
   * ========================================
   *
   * Prevents the same game from
   * being saved more than once.
   */

  const scoreSavedRef =
    useRef(false);

  /*
   * ========================================
   * HAND MOVEMENT
   * ========================================
   */

  const handleHandMove =
    useCallback(
      (x: number, y: number) => {
        handPositionRef.current = {
          x,
          y,
        };
      },
      [],
    );

  /*
   * ========================================
   * SAVE FINAL SCORE
   * ========================================
   */

  const saveFinalScore =
    useCallback(
      (finalScore: number) => {
        if (scoreSavedRef.current) {
          return;
        }

        scoreSavedRef.current = true;

        addScore({
          playerName,
          gameId: "goalkeeper",
          gameTitle: "Goalkeeper",
          score: finalScore,
        });
      },
      [
        addScore,
        playerName,
      ],
    );

  /*
   * ========================================
   * END GAME
   * ========================================
   */

  const endGame =
    useCallback(() => {
      /*
       * Prevent multiple calls.
       */

      if (!gameStartedRef.current) {
        return;
      }

      gameStartedRef.current =
        false;

      /*
       * Save the final score.
       */

      saveFinalScore(
        scoreRef.current,
      );

      setGameStarted(false);

      setGameOver(true);

      ballsRef.current = [];

      setBalls([]);

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
    }, [saveFinalScore]);

  /*
   * ========================================
   * SCORE REF
   * ========================================
   *
   * React state updates are asynchronous.
   * This ref always contains the latest
   * score so endGame() saves the correct
   * final score.
   */

  const scoreRef =
    useRef(0);

  /*
   * ========================================
   * START GAME
   * ========================================
   */

  const startGame =
    useCallback(() => {
      /*
       * Reset everything.
       */

      ballsRef.current = [];

      handPositionRef.current =
        null;

      nextBallId.current = 0;

      lastSpawnTime.current = 0;

      lastTime.current = 0;

      comboRef.current = 0;

      scoreRef.current = 0;

      scoreSavedRef.current =
        false;

      setScore(0);

      setSaves(0);

      setLives(
        STARTING_LIVES,
      );

      setCombo(0);

      setTimeLeft(
        GAME_DURATION,
      );

      setDifficulty("Easy");

      setBalls([]);

      setFeedback(
        "🧤 Get ready!",
      );

      setGameOver(false);

      setGameStarted(true);

      gameStartedRef.current =
        true;

      gameStartTime.current =
        performance.now();
    }, []);

  /*
   * ========================================
   * SPAWN BALL
   * ========================================
   */

  const spawnBall =
    useCallback(
      (difficultyLevel: Difficulty) => {
        const settings =
          DIFFICULTY_SETTINGS[
            difficultyLevel
          ];

        /*
         * Ball starts near
         * the bottom center.
         */

        const startX =
          50 +
          (Math.random() - 0.5) *
            20;

        const startY = 96;

        /*
         * Random target inside goal.
         */

        const targetX =
          GOAL_LEFT +
          8 +
          Math.random() *
            (GOAL_RIGHT -
              GOAL_LEFT -
              16);

        const targetY =
          GOAL_TOP +
          10 +
          Math.random() *
            (GOAL_BOTTOM -
              GOAL_TOP -
              20);

        const ball: Ball = {
          id:
            nextBallId.current++,

          x: startX,

          y: startY,

          startX,

          startY,

          targetX,

          targetY,

          progress: 0,

          speed:
            settings.speed *
            (0.85 +
              Math.random() *
                0.3),

          size:
            4 +
            Math.random() * 2,
        };

        ballsRef.current.push(
          ball,
        );
      },
      [],
    );

  /*
   * ========================================
   * SAVE BALL
   * ========================================
   */

  const saveBall =
    useCallback(
      (ball: Ball) => {
        /*
         * Remove ball.
         */

        ballsRef.current =
          ballsRef.current.filter(
            (item) =>
              item.id !==
              ball.id,
          );

        /*
         * Increase combo.
         */

        comboRef.current =
          Math.min(
            comboRef.current + 1,
            10,
          );

        setCombo(
          comboRef.current,
        );

        /*
         * Score increases
         * with combo.
         */

        const points =
          10 +
          comboRef.current * 5;

        scoreRef.current +=
          points;

        setScore(
          scoreRef.current,
        );

        setSaves(
          (previous) =>
            previous + 1,
        );

        setFeedback(
          comboRef.current >= 3
            ? `🔥 GREAT SAVE! +${points}`
            : `🧤 SAVE! +${points}`,
        );
      },
      [],
    );

  /*
   * ========================================
   * MISS BALL
   * ========================================
   */

  const missBall =
    useCallback(
      (ball: Ball) => {
        ballsRef.current =
          ballsRef.current.filter(
            (item) =>
              item.id !==
              ball.id,
          );

        comboRef.current = 0;

        setCombo(0);

        setLives(
          (previousLives) => {
            const newLives =
              previousLives - 1;

            if (
              newLives <= 0
            ) {
              setTimeout(() => {
                endGame();
              }, 100);

              return 0;
            }

            return newLives;
          },
        );

        setFeedback(
          "❌ GOAL!",
        );
      },
      [endGame],
    );

  /*
   * ========================================
   * MAIN GAME LOOP
   * ========================================
   */

  useEffect(() => {
    if (!gameStarted) {
      return;
    }

    const gameLoop = (
      currentTime: number,
    ) => {
      if (!gameStartedRef.current) {
        return;
      }

      if (!lastTime.current) {
        lastTime.current =
          currentTime;
      }

      const deltaTime =
        currentTime -
        lastTime.current;

      lastTime.current =
        currentTime;

      const frameTime =
        Math.min(
          deltaTime,
          32,
        );

      /*
       * ==================================
       * TIMER
       * ==================================
       */

      const elapsed =
        (currentTime -
          gameStartTime.current) /
        1000;

      const remaining =
        Math.max(
          0,
          Math.ceil(
            GAME_DURATION -
              elapsed,
          ),
        );

      setTimeLeft(
        remaining,
      );

      if (remaining <= 0) {
        endGame();
        return;
      }

      /*
       * ==================================
       * DIFFICULTY
       * ==================================
       */

      let currentDifficulty:
        Difficulty = "Easy";

      if (elapsed >= 20) {
        currentDifficulty =
          "Hard";
      } else if (elapsed >= 10) {
        currentDifficulty =
          "Medium";
      }

      setDifficulty(
        currentDifficulty,
      );

      const settings =
        DIFFICULTY_SETTINGS[
          currentDifficulty
        ];

      /*
       * ==================================
       * SPAWN
       * ==================================
       */

      if (
        currentTime -
          lastSpawnTime.current >=
        settings.spawnInterval
      ) {
        spawnBall(
          currentDifficulty,
        );

        lastSpawnTime.current =
          currentTime;
      }

      /*
       * ==================================
       * MOVE BALLS
       * ==================================
       */

      const updatedBalls =
        ballsRef.current.map(
          (ball) => {
            const newProgress =
              ball.progress +
              ball.speed *
                frameTime;

            const clampedProgress =
              Math.min(
                newProgress,
                1,
              );

            const newX =
              ball.startX +
              (ball.targetX -
                ball.startX) *
                clampedProgress;

            const newY =
              ball.startY +
              (ball.targetY -
                ball.startY) *
                clampedProgress;

            return {
              ...ball,

              x: newX,

              y: newY,

              progress:
                clampedProgress,
            };
          },
        );

      ballsRef.current =
        updatedBalls;

      /*
       * ==================================
       * GOALKEEPER
       * ==================================
       */

      const hand =
        handPositionRef.current;

      if (hand) {
        const goalkeeperX =
          GOAL_LEFT +
          hand.x *
            (GOAL_RIGHT -
              GOAL_LEFT);

        const goalkeeperY =
          GOAL_TOP +
          hand.y *
            (GOAL_BOTTOM -
              GOAL_TOP);

        ballsRef.current.forEach(
          (ball) => {
            if (
              ball.progress < 0.78
            ) {
              return;
            }

            const d =
              distance(
                goalkeeperX,
                goalkeeperY,
                ball.x,
                ball.y,
              );

            if (
              d <=
              SAVE_DISTANCE
            ) {
              saveBall(ball);
            }
          },
        );
      }

      /*
       * ==================================
       * MISSED BALLS
       * ==================================
       */

      const missed =
        ballsRef.current.filter(
          (ball) =>
            ball.progress >=
            1,
        );

      missed.forEach(
        (ball) => {
          missBall(ball);
        },
      );

      /*
       * ==================================
       * UPDATE UI
       * ==================================
       */

      setBalls([
        ...ballsRef.current,
      ]);

      animationFrameRef.current =
        requestAnimationFrame(
          gameLoop,
        );
    };

    animationFrameRef.current =
      requestAnimationFrame(
        gameLoop,
      );

    return () => {
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
    };
  }, [
    gameStarted,
    endGame,
    spawnBall,
    saveBall,
    missBall,
  ]);

  /*
   * ========================================
   * CLEANUP
   * ========================================
   */

  useEffect(() => {
    return () => {
      gameStartedRef.current =
        false;

      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, []);

  /*
   * ========================================
   * UI
   * ========================================
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
              <CameraView
                onHandMove={
                  handleHandMove
                }
              />
            </div>

            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-6">

              <div className="flex w-full max-w-lg flex-col items-center rounded-3xl bg-black/80 px-10 py-10 text-center backdrop-blur-md">

                <div className="text-8xl">
                  🧤
                </div>

                <h2 className="mt-5 text-4xl font-black text-white">
                  Goalkeeper
                </h2>

                <p className="mt-4 max-w-md text-gray-300">
                  Use your hand to
                  move the goalkeeper
                  and save the shots!
                </p>

                <div className="mt-6 space-y-2 text-sm text-gray-400">
                  <p>
                    🧤 Move your hand
                    to control the
                    goalkeeper
                  </p>

                  <p>
                    ⚽ Save as many
                    shots as possible
                  </p>

                  <p>
                    ❤️ You have 3
                    lives
                  </p>
                </div>

                <button
                  onClick={
                    startGame
                  }
                  className="mt-8 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-black transition hover:scale-105 hover:bg-gray-200 active:scale-95"
                >
                  Start Game
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
            <CameraView
              onHandMove={
                handleHandMove
              }
            />
          </div>

          {/* DARK OVERLAY */}

          <div className="pointer-events-none absolute inset-0 z-10 bg-black/20" />

          {/* ================================= */}
          {/* GOAL */}
          {/* ================================= */}

          <div
            className="pointer-events-none absolute z-20 border-4 border-white/80 bg-blue-500/10"
            style={{
              left: `${GOAL_LEFT}%`,
              top: `${GOAL_TOP}%`,
              width: `${
                GOAL_RIGHT -
                GOAL_LEFT
              }%`,
              height: `${
                GOAL_BOTTOM -
                GOAL_TOP
              }%`,
              boxShadow:
                "inset 0 0 30px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.2)",
            }}
          >

            {/* Goal net lines */}

            <div className="absolute inset-0 opacity-20">

              <div className="absolute inset-y-0 left-1/4 border-l border-white" />

              <div className="absolute inset-y-0 left-1/2 border-l border-white" />

              <div className="absolute inset-y-0 left-3/4 border-l border-white" />

              <div className="absolute inset-x-0 top-1/4 border-t border-white" />

              <div className="absolute inset-x-0 top-1/2 border-t border-white" />

              <div className="absolute inset-x-0 top-3/4 border-t border-white" />

            </div>

            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl font-black text-white">
              🥅 GOAL
            </div>

          </div>

          {/* ================================= */}
          {/* HUD */}
          {/* ================================= */}

          <div className="absolute left-5 right-5 top-5 z-50 flex items-start justify-between gap-3">

            <div className="rounded-xl bg-black/75 px-4 py-2 backdrop-blur">
              <p className="text-xs text-gray-400">
                SCORE
              </p>

              <p className="text-3xl font-black text-white">
                {score}
              </p>
            </div>

            <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">
              <p className="text-xs text-gray-400">
                SAVES
              </p>

              <p className="text-3xl font-black text-white">
                {saves}
              </p>
            </div>

            <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">
              <p className="text-xs text-gray-400">
                COMBO
              </p>

              <p className="text-3xl font-black text-orange-400">
                {combo}x
              </p>
            </div>

            <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">
              <p className="text-xs text-gray-400">
                LIVES
              </p>

              <p className="text-2xl">
                {"❤️".repeat(
                  lives,
                )}

                {"🖤".repeat(
                  STARTING_LIVES -
                    lives,
                )}
              </p>
            </div>

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
          {/* BALLS */}
          {/* ================================= */}

          <div className="pointer-events-none absolute inset-0 z-30">

            {balls.map(
              (ball) => (
                <div
                  key={ball.id}
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    left: `${ball.x}%`,
                    top: `${ball.y}%`,

                    width: `${ball.size}%`,
                    height: `${ball.size}%`,

                    transform:
                      "translate(-50%, -50%)",

                    fontSize: "42px",

                    filter:
                      "drop-shadow(0 0 12px rgba(255,255,255,0.8))",

                    transition:
                      "transform 0.05s linear",
                  }}
                >
                  ⚽
                </div>
              ),
            )}

          </div>

          {/* ================================= */}
          {/* GOALKEEPER CURSOR */}
          {/* ================================= */}

          {handPositionRef.current && (
            <div
              className="pointer-events-none absolute z-40"
              style={{
                left: `${
                  GOAL_LEFT +
                  handPositionRef.current.x *
                    (GOAL_RIGHT -
                      GOAL_LEFT)
                }%`,

                top: `${
                  GOAL_TOP +
                  handPositionRef.current.y *
                    (GOAL_BOTTOM -
                      GOAL_TOP)
                }%`,

                transform:
                  "translate(-50%, -50%)",
              }}
            >

              <div
                className="relative flex items-center justify-center"
                style={{
                  width: `${GOALKEEPER_SIZE}%`,
                  height: `${GOALKEEPER_SIZE}%`,
                  minWidth: "70px",
                  minHeight: "70px",
                }}
              >

                <div className="absolute inset-0 rounded-full bg-blue-400/30 blur-xl" />

                <div className="relative text-7xl drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]">
                  🧤
                </div>

              </div>

            </div>
          )}

          {/* ================================= */}
          {/* FEEDBACK */}
          {/* ================================= */}

          <div className="pointer-events-none absolute bottom-8 left-1/2 z-50 w-[90%] max-w-lg -translate-x-1/2">

            <div className="rounded-2xl bg-black/80 px-6 py-4 text-center backdrop-blur-md">

              <p className="text-2xl font-black text-white">
                {feedback}
              </p>

              <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-gray-400">
                {difficulty}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ================================= */}
      {/* GAME OVER */}
      {/* ================================= */}

      {gameOver && (
        <div className="relative min-h-[600px]">

          <div className="absolute inset-0">
            <CameraView
              onHandMove={
                handleHandMove
              }
            />
          </div>

          <div className="absolute inset-0 z-40 flex min-h-[600px] flex-col items-center justify-center bg-black/85 px-6 backdrop-blur-sm">

            <div className="text-7xl">
              🏆
            </div>

            <h2 className="mt-5 text-5xl font-black text-white">
              Game Over
            </h2>

            <p className="mt-5 text-gray-400">
              Final Score
            </p>

            <p className="mt-1 text-6xl font-black text-white">
              {score}
            </p>

            <p className="mt-4 text-lg text-gray-400">
              Total Saves
            </p>

            <p className="text-4xl font-black text-white">
              {saves}
            </p>

            <button
              onClick={
                startGame
              }
              className="mt-8 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-black transition hover:scale-105 hover:bg-gray-200 active:scale-95"
            >
              Play Again
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default GoalkeeperGame;