import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import CameraView from "../../../features/motion/components/CameraView";
import { useGameStore } from "../../../store/gameStore";

/*
 * ========================================
 * AUDIO
 * ========================================
 */

const hitSound = "/sounds/fruit-slice.mp3";
const comboSound = "/sounds/combo.mp3";

/*
 * ========================================
 * TYPES
 * ========================================
 */

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  expiresAt: number;
}

interface HitEffect {
  id: number;
  x: number;
  y: number;
}

interface AimPosition {
  x: number;
  y: number;
}

type Difficulty = "Easy" | "Medium" | "Hard";

/*
 * ========================================
 * GAME CONSTANTS
 * ========================================
 */

const GAME_DURATION = 30;
const STARTING_LIVES = 3;

const MAX_COMBO = 5;
const POINTS_PER_HIT = 10;

const TARGET_LIFETIME = 4200;

const HIT_RADIUS_RATIO = 0.48;

/*
 * Limit how frequently React receives
 * aim updates.
 */
const AIM_UPDATE_INTERVAL = 35;

/*
 * Prevent multiple hits from the same
 * hand position in extremely fast
 * tracking updates.
 */
const HIT_COOLDOWN = 80;

const MAX_TARGETS = 3;

/*
 * ========================================
 * DIFFICULTY
 * ========================================
 */

const DIFFICULTY_SETTINGS = {
  Easy: {
    spawnInterval: 1900,
    targetSize: 95,
  },

  Medium: {
    spawnInterval: 1600,
    targetSize: 85,
  },

  Hard: {
    spawnInterval: 1350,
    targetSize: 75,
  },
};

/*
 * ========================================
 * TARGET SHOOTER
 * ========================================
 */

function TargetShooterGame() {
  /*
   * ======================================
   * ZUSTAND
   * ======================================
   */

  const addScore = useGameStore(
    (state) => state.addScore,
  );

  const playerName = useGameStore(
    (state) => state.playerName,
  );

  /*
   * ======================================
   * REACT STATE
   *
   * Only values that actually need
   * React rendering are kept here.
   * ======================================
   */

  const [score, setScore] = useState(0);

  const [combo, setCombo] = useState(0);

  const [timeLeft, setTimeLeft] =
    useState(GAME_DURATION);

  const [lives, setLives] =
    useState(STARTING_LIVES);

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Easy");

  const [targets, setTargets] =
    useState<Target[]>([]);

  const [hitEffects, setHitEffects] =
    useState<HitEffect[]>([]);

  const [aim, setAim] =
    useState<AimPosition | null>(null);

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  /*
   * ======================================
   * GAME REFS
   * ======================================
   */

  const targetsRef =
    useRef<Target[]>([]);

  const aimRef =
    useRef<AimPosition | null>(null);

  const nextTargetId =
    useRef(0);

  const nextEffectId =
    useRef(0);

  const animationFrameRef =
    useRef<number | null>(null);

  const lastTimeRef =
    useRef(0);

  const lastSpawnTimeRef =
    useRef(0);

  const gameStartTimeRef =
    useRef(0);

  const comboRef =
    useRef(0);

  const scoreRef =
    useRef(0);

  const livesRef =
    useRef(STARTING_LIVES);

  const difficultyRef =
    useRef<Difficulty>("Easy");

  const scoreSavedRef =
    useRef(false);

  const gameActiveRef =
    useRef(false);

  const hitTargetIdsRef =
    useRef<Set<number>>(new Set());

  /*
   * ======================================
   * HAND TRACKING REFS
   * ======================================
   */

  const lastAimRenderTimeRef =
    useRef(0);

  const lastHitTimeRef =
    useRef(0);

  /*
   * ======================================
   * AUDIO
   * ======================================
   */

  const hitAudioRef =
    useRef<HTMLAudioElement | null>(
      null,
    );

  const comboAudioRef =
    useRef<HTMLAudioElement | null>(
      null,
    );

  const lastHitSoundTimeRef =
    useRef(0);

  /*
   * ======================================
   * CREATE AUDIO
   * ======================================
   */

  useEffect(() => {
    const hitAudio =
      new Audio(hitSound);

    const comboAudio =
      new Audio(comboSound);

    hitAudio.preload = "auto";
    comboAudio.preload = "auto";

    hitAudio.volume = 0.7;
    comboAudio.volume = 0.6;

    hitAudioRef.current =
      hitAudio;

    comboAudioRef.current =
      comboAudio;

    return () => {
      hitAudio.pause();
      comboAudio.pause();

      hitAudio.src = "";
      comboAudio.src = "";

      hitAudioRef.current = null;
      comboAudioRef.current = null;
    };
  }, []);

  /*
   * ======================================
   * HIT SOUND
   * ======================================
   */

  const playHitSound =
    useCallback(() => {
      const now =
        performance.now();

      if (
        now -
          lastHitSoundTimeRef.current <
        100
      ) {
        return;
      }

      lastHitSoundTimeRef.current =
        now;

      const audio =
        hitAudioRef.current;

      if (!audio) {
        return;
      }

      audio.currentTime = 0;

      audio
        .play()
        .catch(() => {});
    }, []);

  /*
   * ======================================
   * COMBO SOUND
   * ======================================
   */

  const playComboSound =
    useCallback(() => {
      const audio =
        comboAudioRef.current;

      if (!audio) {
        return;
      }

      audio.currentTime = 0;

      audio
        .play()
        .catch(() => {});
    }, []);

  /*
   * ======================================
   * END GAME
   * ======================================
   */

  const endGame =
    useCallback(() => {
      /*
       * Prevent duplicate calls.
       */

      if (!gameActiveRef.current) {
        return;
      }

      gameActiveRef.current = false;

      /*
       * Stop animation loop.
       */

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

      /*
       * Save score only once.
       */

      if (!scoreSavedRef.current) {
        scoreSavedRef.current = true;

        addScore({
          playerName,
          gameId: "target-shooter",
          gameTitle: "Target Shooter",
          score: scoreRef.current,
        });
      }

      /*
       * Clear game refs.
       */

      targetsRef.current = [];

      aimRef.current = null;

      hitTargetIdsRef.current.clear();

      /*
       * Update UI.
       */

      setGameStarted(false);
      setGameOver(true);

      setTargets([]);
      setAim(null);
    }, [
      addScore,
      playerName,
    ]);

  /*
   * ======================================
   * START GAME
   * ======================================
   */

  const startGame =
    useCallback(() => {
      /*
       * Stop any old animation loop.
       */

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

      /*
       * Reset refs.
       */

      targetsRef.current = [];

      aimRef.current = null;

      hitTargetIdsRef.current.clear();

      nextTargetId.current = 0;

      nextEffectId.current = 0;

      lastTimeRef.current = 0;

      comboRef.current = 0;

      scoreRef.current = 0;

      livesRef.current =
        STARTING_LIVES;

      difficultyRef.current =
        "Easy";

      scoreSavedRef.current =
        false;

      lastHitSoundTimeRef.current =
        0;

      lastAimRenderTimeRef.current =
        0;

      lastHitTimeRef.current =
        0;

      /*
       * First target appears after
       * a short delay.
       */

      lastSpawnTimeRef.current =
        performance.now() + 800;

      gameStartTimeRef.current =
        performance.now();

      gameActiveRef.current =
        true;

      /*
       * Reset React state.
       */

      setScore(0);

      setCombo(0);

      setTimeLeft(
        GAME_DURATION,
      );

      setLives(
        STARTING_LIVES,
      );

      setDifficulty("Easy");

      setTargets([]);

      setHitEffects([]);

      setAim(null);

      setGameOver(false);

      setGameStarted(true);

      /*
       * Warm audio.
       */

      if (hitAudioRef.current) {
        hitAudioRef.current.load();
      }

      if (comboAudioRef.current) {
        comboAudioRef.current.load();
      }
    }, []);

  /*
   * ======================================
   * HIT TARGET
   * ======================================
   */

  const hitTarget =
    useCallback(
      (targetId: number) => {
        if (
          !gameActiveRef.current
        ) {
          return;
        }

        /*
         * Prevent duplicate hit.
         */

        if (
          hitTargetIdsRef.current.has(
            targetId,
          )
        ) {
          return;
        }

        const target =
          targetsRef.current.find(
            (item) =>
              item.id === targetId,
          );

        if (!target) {
          return;
        }

        /*
         * Mark hit.
         */

        hitTargetIdsRef.current.add(
          targetId,
        );

        /*
         * Remove target from
         * game ref.
         */

        targetsRef.current =
          targetsRef.current.filter(
            (item) =>
              item.id !== targetId,
          );

        /*
         * Update target UI once.
         */

        setTargets(
          targetsRef.current,
        );

        /*
         * =================================
         * COMBO
         * =================================
         */

        const newCombo =
          Math.min(
            comboRef.current + 1,
            MAX_COMBO,
          );

        comboRef.current =
          newCombo;

        setCombo(newCombo);

        /*
         * =================================
         * SCORE
         * =================================
         */

        const points =
          POINTS_PER_HIT *
          newCombo;

        scoreRef.current +=
          points;

        setScore(
          scoreRef.current,
        );

        /*
         * =================================
         * AUDIO
         * =================================
         */

        playHitSound();

        if (newCombo >= 3) {
          playComboSound();
        }

        /*
         * =================================
         * HIT EFFECT
         * =================================
         */

        const effect: HitEffect = {
          id:
            nextEffectId.current++,

          x: target.x,
          y: target.y,
        };

        setHitEffects(
          (previous) => [
            ...previous,
            effect,
          ],
        );

        /*
         * Remove effect.
         */

        window.setTimeout(() => {
          setHitEffects(
            (previous) =>
              previous.filter(
                (item) =>
                  item.id !==
                  effect.id,
              ),
          );
        }, 350);
      },
      [
        playHitSound,
        playComboSound,
      ],
    );

  /*
   * ======================================
   * HAND MOVEMENT
   * ======================================
   */

  const handleHandMove =
    useCallback(
      (
        x: number,
        y: number,
      ) => {
        if (
          !gameActiveRef.current
        ) {
          return;
        }

        const newX =
          x * 100;

        const newY =
          y * 100;

        /*
         * Keep latest position in ref.
         *
         * This does NOT cause a React
         * render.
         */

        aimRef.current = {
          x: newX,
          y: newY,
        };

        /*
         * =================================
         * THROTTLE AIM RENDER
         * =================================
         *
         * Camera tracking can generate
         * many updates per second.
         *
         * We only render the cursor
         * approximately 28 times/sec.
         */

        const now =
          performance.now();

        if (
          now -
            lastAimRenderTimeRef.current >=
          AIM_UPDATE_INTERVAL
        ) {
          lastAimRenderTimeRef.current =
            now;

          setAim({
            x: newX,
            y: newY,
          });
        }

        /*
         * =================================
         * HIT COOLDOWN
         * =================================
         */

        if (
          now -
            lastHitTimeRef.current <
          HIT_COOLDOWN
        ) {
          return;
        }

        /*
         * =================================
         * COLLISION
         * =================================
         */

        const currentTargets =
          targetsRef.current;

        for (
          let i = 0;
          i < currentTargets.length;
          i++
        ) {
          const target =
            currentTargets[i];

          const dx =
            target.x - newX;

          const dy =
            target.y - newY;

          const distanceSquared =
            dx * dx + dy * dy;

          /*
           * Target size is pixels.
           *
           * Game coordinates are 0-100.
           */

          const hitRadius =
            (target.size / 2) *
            HIT_RADIUS_RATIO;

          const hitRadiusPercent =
            hitRadius / 10;

          const radiusSquared =
            hitRadiusPercent *
            hitRadiusPercent;

          if (
            distanceSquared <=
            radiusSquared
          ) {
            lastHitTimeRef.current =
              now;

            hitTarget(
              target.id,
            );

            break;
          }
        }
      },
      [hitTarget],
    );

  /*
   * ======================================
   * GAME LOOP
   * ======================================
   */

  useEffect(() => {
    if (!gameStarted) {
      return;
    }

    gameActiveRef.current =
      true;

    const gameLoop = (
      currentTime: number,
    ) => {
      if (
        !gameActiveRef.current
      ) {
        return;
      }

      /*
       * =================================
       * TIMER
       * =================================
       */

      const elapsed =
        (
          currentTime -
          gameStartTimeRef.current
        ) / 1000;

      const remaining =
        Math.max(
          0,
          Math.ceil(
            GAME_DURATION -
              elapsed,
          ),
        );

      /*
       * Only update timer when
       * displayed value changes.
       */

      setTimeLeft(
        (previous) =>
          previous === remaining
            ? previous
            : remaining,
      );

      if (remaining <= 0) {
        endGame();
        return;
      }

      /*
       * =================================
       * DIFFICULTY
       * =================================
       */

      let nextDifficulty:
        Difficulty = "Easy";

      if (elapsed >= 20) {
        nextDifficulty =
          "Hard";
      } else if (elapsed >= 10) {
        nextDifficulty =
          "Medium";
      }

      /*
       * Only update difficulty
       * when it actually changes.
       */

      if (
        difficultyRef.current !==
        nextDifficulty
      ) {
        difficultyRef.current =
          nextDifficulty;

        setDifficulty(
          nextDifficulty,
        );
      }

      const settings =
        DIFFICULTY_SETTINGS[
          nextDifficulty
        ];

      /*
       * =================================
       * SPAWN TARGET
       * =================================
       */

      if (
        currentTime -
          lastSpawnTimeRef.current >=
        settings.spawnInterval
      ) {
        if (
          targetsRef.current.length <
          MAX_TARGETS
        ) {
          const target: Target =
            {
              id:
                nextTargetId.current++,

              /*
               * Keep target away from
               * edges.
               */

              x:
                Math.random() *
                  76 +
                12,

              /*
               * Keep target in
               * comfortable camera area.
               */

              y:
                Math.random() *
                  45 +
                25,

              size:
                settings.targetSize,

              expiresAt:
                currentTime +
                TARGET_LIFETIME,
            };

          targetsRef.current.push(
            target,
          );

          /*
           * React update only when
           * target list changes.
           */

          setTargets([
            ...targetsRef.current,
          ]);
        }

        lastSpawnTimeRef.current =
          currentTime;
      }

      /*
       * =================================
       * EXPIRED TARGETS
       * =================================
       */

      if (
        targetsRef.current.length >
        0
      ) {
        const expiredTargets =
          targetsRef.current.filter(
            (target) =>
              currentTime >
              target.expiresAt,
          );

        if (
          expiredTargets.length >
          0
        ) {
          /*
           * Reset combo.
           */

          comboRef.current = 0;

          setCombo(0);

          /*
           * Remove IDs.
           */

          expiredTargets.forEach(
            (target) => {
              hitTargetIdsRef.current.delete(
                target.id,
              );
            },
          );

          /*
           * Remove expired targets.
           */

          targetsRef.current =
            targetsRef.current.filter(
              (target) =>
                currentTime <
                target.expiresAt,
            );

          setTargets([
            ...targetsRef.current,
          ]);

          /*
           * Lose lives.
           */

          const lostLives =
            expiredTargets.length;

          livesRef.current =
            Math.max(
              0,
              livesRef.current -
                lostLives,
            );

          setLives(
            livesRef.current,
          );

          /*
           * Game over.
           */

          if (
            livesRef.current <=
            0
          ) {
            endGame();
            return;
          }
        }
      }

      /*
       * =================================
       * NEXT FRAME
       * =================================
       */

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
  ]);

  /*
   * ======================================
   * CLEANUP
   * ======================================
   */

  useEffect(() => {
    return () => {
      gameActiveRef.current =
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
   * ======================================
   * RENDER
   * ======================================
   */

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">

      {/* ================================= */}
      {/* CAMERA */}
      {/* ================================= */}

      <div className="relative z-10 mx-auto w-full max-w-6xl p-4">

        <CameraView
          onHandMove={
            handleHandMove
          }
        />

      </div>

      {/* ================================= */}
      {/* HUD */}
      {/* ================================= */}

      {gameStarted && (
        <div className="pointer-events-none absolute left-6 right-6 top-6 z-40 flex items-start justify-between gap-3">

          {/* SCORE */}

          <div className="rounded-xl bg-black/75 px-4 py-2 backdrop-blur">

            <p className="text-xs text-gray-400">
              SCORE
            </p>

            <p className="text-3xl font-black text-white">
              {score}
            </p>

          </div>

          {/* COMBO */}

          <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">

            <p className="text-xs text-gray-400">
              COMBO
            </p>

            <p
              className={`text-3xl font-black ${
                combo >= 3
                  ? "text-orange-400"
                  : "text-white"
              }`}
            >
              {combo}x
            </p>

          </div>

          {/* DIFFICULTY */}

          <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">

            <p className="text-xs text-gray-400">
              LEVEL
            </p>

            <p className="text-lg font-black text-white">
              {difficulty}
            </p>

          </div>

          {/* TIME */}

          <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">

            <p className="text-xs text-gray-400">
              TIME
            </p>

            <p className="text-3xl font-black text-white">
              {timeLeft}
            </p>

          </div>

          {/* LIVES */}

          <div className="rounded-xl bg-black/75 px-4 py-2 text-center backdrop-blur">

            <p className="text-xs text-gray-400">
              LIVES
            </p>

            <p className="text-xl">
              {"❤️".repeat(lives)}
              {"🖤".repeat(
                STARTING_LIVES -
                  lives,
              )}
            </p>

          </div>

        </div>
      )}

      {/* ================================= */}
      {/* START SCREEN */}
      {/* ================================= */}

      {!gameStarted &&
        !gameOver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-6 backdrop-blur-sm">

            <div className="flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-black/90 px-8 py-10 text-center shadow-2xl">

              <div className="text-7xl">
                🎯
              </div>

              <h2 className="mt-5 text-4xl font-black text-white">
                Target Shooter
              </h2>

              <p className="mt-4 text-gray-400">
                Move your index finger
                over the targets to
                destroy them.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Accuracy matters!
              </p>

              <button
                onClick={
                  startGame
                }
                className="mt-8 rounded-2xl bg-white px-12 py-4 text-lg font-bold text-black transition duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95"
              >
                Start Game
              </button>

            </div>

          </div>
        )}

      {/* ================================= */}
      {/* TARGETS */}
      {/* ================================= */}

      {gameStarted && (
        <div className="pointer-events-none absolute inset-0 z-20">

          {targets.map(
            (target) => (
              <div
                key={target.id}
                className="absolute flex items-center justify-center rounded-full"
                style={{
                  left:
                    `${target.x}%`,

                  top:
                    `${target.y}%`,

                  width:
                    `${target.size}px`,

                  height:
                    `${target.size}px`,

                  transform:
                    "translate(-50%, -50%)",

                  background:
                    "radial-gradient(circle, white 0%, white 12%, #ef4444 13%, #ef4444 35%, white 36%, white 45%, #ef4444 46%, #ef4444 65%, white 66%, white 72%, #ef4444 73%, #ef4444 100%)",

                  /*
                   * Removed continuous
                   * CSS pulse animation.
                   *
                   * This reduces GPU/paint
                   * workload.
                   */

                  boxShadow:
                    "0 0 12px rgba(239,68,68,0.8)",

                  willChange:
                    "transform",
                }}
              >
                <span className="text-xl">
                  🎯
                </span>
              </div>
            ),
          )}

          {/* ================================= */}
          {/* AIM CURSOR */}
          {/* ================================= */}

          {aim && (
            <div
              className="absolute"
              style={{
                left:
                  `${aim.x}%`,

                top:
                  `${aim.y}%`,

                transform:
                  "translate(-50%, -50%)",

                willChange:
                  "left, top",

                /*
                 * Prevent expensive
                 * browser effects.
                 */

                contain:
                  "layout paint",
              }}
            >

              <div className="relative h-14 w-14 rounded-full border-4 border-white shadow-[0_0_10px_white,0_0_18px_rgba(239,68,68,0.9)]">

                <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-white" />

                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-white" />

                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500" />

              </div>

            </div>
          )}

          {/* ================================= */}
          {/* HIT EFFECT */}
          {/* ================================= */}

          {hitEffects.map(
            (effect) => (
              <div
                key={effect.id}
                className="absolute"
                style={{
                  left:
                    `${effect.x}%`,

                  top:
                    `${effect.y}%`,

                  transform:
                    "translate(-50%, -50%)",

                  pointerEvents:
                    "none",
                }}
              >

                <div className="text-5xl">
                  💥
                </div>

                <div className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap text-xl font-black text-white drop-shadow-[0_0_6px_black]">
                  HIT!
                </div>

              </div>
            ),
          )}

        </div>
      )}

      {/* ================================= */}
      {/* GAME OVER */}
      {/* ================================= */}

      {gameOver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-6 backdrop-blur-sm">

          <div className="flex w-full max-w-lg flex-col items-center rounded-3xl border border-white/10 bg-black px-8 py-10 text-center">

            <div className="text-7xl">
              🏆
            </div>

            <h2 className="mt-5 text-5xl font-black text-white">
              Game Over
            </h2>

            <p className="mt-4 text-gray-400">
              Final Score
            </p>

            <p className="mt-1 text-6xl font-black text-white">
              {score}
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Difficulty reached:{" "}
              <span className="text-white">
                {difficulty}
              </span>
            </p>

            <button
              onClick={
                startGame
              }
              className="mt-8 rounded-2xl bg-white px-12 py-4 text-lg font-bold text-black transition duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95"
            >
              Play Again
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default TargetShooterGame;