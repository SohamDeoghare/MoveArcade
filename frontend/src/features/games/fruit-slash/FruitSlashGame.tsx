import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import CameraView from "../../../features/motion/components/CameraView";
import { useGameStore } from "../../../store/gameStore";

const slashSound = "/sounds/slash.mp3";
const fruitSliceSound = "/sounds/fruit-slice.mp3";
const bombSound = "/sounds/bomb.mp3";
const comboSound = "/sounds/combo.mp3";

interface Fruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  emoji: string;
  rotation: number;
  rotationSpeed: number;
  isBomb: boolean;
}

interface SlicedFruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  side: "left" | "right";
}

interface HitEffect {
  id: number;
  x: number;
  y: number;
  points: number;
  isBomb: boolean;
  createdAt: number;
}

interface JuiceParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  isBomb: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

type Difficulty = "Easy" | "Medium" | "Hard";

const FRUITS = [
  "🍎",
  "🍊",
  "🍉",
  "🍌",
  "🍓",
];

const GAME_DURATION = 30;
const STARTING_LIVES = 3;

const FRUIT_SIZE = 150;
const FRUIT_EMOJI_SIZE = 135;

const MIN_SLASH_DISTANCE = 3;
const SLASH_HIT_DISTANCE = 15;
const MAX_SLASH_TIME = 300;

const TRAIL_LIFETIME = 180;
const MAX_TRAIL_POINTS = 18;

const MAX_COMBO = 5;
const POINTS_PER_COMBO = 10;

const BOMB_CHANCE = 0.15;

/*
 * Performance limits.
 */

const MAX_FRUITS = 12;
const MAX_SLICED_FRUITS = 16;
const MAX_PARTICLES = 80;

const DIFFICULTY_SETTINGS = {
  Easy: {
    spawnInterval: 900,
    horizontalSpeed: 0.018,
    upwardSpeed: 0.105,
    gravity: 0.000085,
  },

  Medium: {
    spawnInterval: 700,
    horizontalSpeed: 0.023,
    upwardSpeed: 0.115,
    gravity: 0.000095,
  },

  Hard: {
    spawnInterval: 520,
    horizontalSpeed: 0.028,
    upwardSpeed: 0.125,
    gravity: 0.000105,
  },
};

function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  return Math.sqrt(dx * dx + dy * dy);
}

function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return distance(px, py, x1, y1);
  }

  const t =
    ((px - x1) * dx +
      (py - y1) * dy) /
    (dx * dx + dy * dy);

  const clampedT = Math.max(
    0,
    Math.min(1, t),
  );

  const closestX =
    x1 + clampedT * dx;

  const closestY =
    y1 + clampedT * dy;

  return distance(
    px,
    py,
    closestX,
    closestY,
  );
}

function FruitSlashGame() {
  /*
   * ========================================
   * ZUSTAND
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

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] =
    useState(GAME_DURATION);

  const [lives, setLives] =
    useState(STARTING_LIVES);

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Easy");

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  /*
   * ========================================
   * RENDER TICK
   *
   * React only re-renders the game layer
   * at a controlled rate.
   * ========================================
   */

  const [, forceRender] =
    useState(0);

  const renderTick = useCallback(() => {
    forceRender((value) => value + 1);
  }, []);

  /*
   * ========================================
   * HAND TRACKING
   * ========================================
   */

  const handPositionRef =
    useRef<{
      x: number;
      y: number;
    } | null>(null);

  const previousHandRef =
    useRef<{
      x: number;
      y: number;
      time: number;
    } | null>(null);

  /*
   * ========================================
   * GAME REFS
   * ========================================
   */

  const fruitsRef =
    useRef<Fruit[]>([]);

  const slicedFruitsRef =
    useRef<SlicedFruit[]>([]);

  const juiceParticlesRef =
    useRef<JuiceParticle[]>([]);

  const hitEffectsRef =
    useRef<HitEffect[]>([]);

  const trailRef =
    useRef<TrailPoint[]>([]);

  const slicedFruitIdsRef =
    useRef<Set<number>>(new Set());

  const nextFruitId =
    useRef(0);

  const nextEffectId =
    useRef(0);

  const nextParticleId =
    useRef(0);

  const animationFrame =
    useRef<number | null>(null);

  const lastTime =
    useRef(0);

  const lastSpawnTime =
    useRef(0);

  const gameStartTime =
    useRef(0);

  const comboRef =
    useRef(0);

  const gameStartedRef =
    useRef(false);

  const scoreRef =
    useRef(0);

  const livesRef =
    useRef(STARTING_LIVES);

  const difficultyRef =
    useRef<Difficulty>("Easy");

  const scoreSavedRef =
    useRef(false);

  /*
   * Limit React visual updates.
   */

  const lastRenderTimeRef =
    useRef(0);

  const lastSecondRef =
    useRef(-1);

  /*
   * ========================================
   * AUDIO
   * ========================================
   */

  const slashAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const fruitAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const bombAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const comboAudioRef =
    useRef<HTMLAudioElement | null>(null);

  const lastSlashSoundTime =
    useRef(0);

  useEffect(() => {
    const slash =
      new Audio(slashSound);

    const fruit =
      new Audio(fruitSliceSound);

    const bomb =
      new Audio(bombSound);

    const comboAudio =
      new Audio(comboSound);

    slash.preload = "auto";
    fruit.preload = "auto";
    bomb.preload = "auto";
    comboAudio.preload = "auto";

    slash.volume = 0.35;
    fruit.volume = 0.65;
    bomb.volume = 0.8;
    comboAudio.volume = 0.55;

    slashAudioRef.current = slash;
    fruitAudioRef.current = fruit;
    bombAudioRef.current = bomb;
    comboAudioRef.current = comboAudio;

    return () => {
      slash.pause();
      fruit.pause();
      bomb.pause();
      comboAudio.pause();

      slashAudioRef.current = null;
      fruitAudioRef.current = null;
      bombAudioRef.current = null;
      comboAudioRef.current = null;
    };
  }, []);

  /*
   * ========================================
   * AUDIO FUNCTIONS
   * ========================================
   */

  const playSlashSound =
    useCallback(() => {
      const now = performance.now();

      if (
        now -
          lastSlashSoundTime.current <
        120
      ) {
        return;
      }

      lastSlashSoundTime.current = now;

      const audio =
        slashAudioRef.current;

      if (!audio) return;

      audio.currentTime = 0;

      audio.play().catch(() => {});
    }, []);

  const playFruitSound =
    useCallback(() => {
      const audio =
        fruitAudioRef.current;

      if (!audio) return;

      audio.currentTime = 0;

      audio.play().catch(() => {});
    }, []);

  const playBombSound =
    useCallback(() => {
      const audio =
        bombAudioRef.current;

      if (!audio) return;

      audio.currentTime = 0;

      audio.play().catch(() => {});
    }, []);

  const playComboSound =
    useCallback(() => {
      const audio =
        comboAudioRef.current;

      if (!audio) return;

      audio.currentTime = 0;

      audio.play().catch(() => {});
    }, []);

  /*
   * ========================================
   * HAND MOVE
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
   * SAVE SCORE
   * ========================================
   */

  const saveGameScore =
    useCallback(
      (finalScore: number) => {
        if (scoreSavedRef.current) {
          return;
        }

        scoreSavedRef.current = true;

        addScore({
          playerName,
          gameId: "fruit-slash",
          gameTitle: "Fruit Slash",
          score: finalScore,
        });
      },
      [addScore, playerName],
    );

  /*
   * ========================================
   * START GAME
   * ========================================
   */

  const startGame =
    useCallback(() => {
      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current,
        );

        animationFrame.current =
          null;
      }

      fruitsRef.current = [];
      slicedFruitsRef.current = [];
      juiceParticlesRef.current = [];
      hitEffectsRef.current = [];
      trailRef.current = [];

      handPositionRef.current = null;
      previousHandRef.current = null;

      slicedFruitIdsRef.current.clear();

      nextFruitId.current = 0;
      nextEffectId.current = 0;
      nextParticleId.current = 0;

      lastTime.current = 0;
      lastSpawnTime.current = 0;
      lastSlashSoundTime.current = 0;

      lastRenderTimeRef.current = 0;
      lastSecondRef.current = -1;

      comboRef.current = 0;
      scoreRef.current = 0;
      livesRef.current =
        STARTING_LIVES;

      difficultyRef.current = "Easy";

      scoreSavedRef.current = false;

      setScore(0);
      setCombo(0);
      setTimeLeft(GAME_DURATION);
      setLives(STARTING_LIVES);
      setDifficulty("Easy");

      setGameOver(false);
      setGameStarted(true);

      gameStartedRef.current = true;

      gameStartTime.current =
        performance.now();

      renderTick();
    }, [renderTick]);

  /*
   * ========================================
   * END GAME
   * ========================================
   */

  const endGame =
    useCallback(() => {
      if (!gameStartedRef.current) {
        return;
      }

      gameStartedRef.current = false;

      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current,
        );

        animationFrame.current = null;
      }

      saveGameScore(
        scoreRef.current,
      );

      setScore(scoreRef.current);
      setLives(livesRef.current);
      setCombo(comboRef.current);

      setGameStarted(false);
      setGameOver(true);

      fruitsRef.current = [];
      slicedFruitsRef.current = [];
      juiceParticlesRef.current = [];
      hitEffectsRef.current = [];
      trailRef.current = [];

      handPositionRef.current = null;
      previousHandRef.current = null;

      renderTick();
    }, [renderTick, saveGameScore]);

  /*
   * ========================================
   * PARTICLES
   * ========================================
   */

  const createParticles =
    useCallback(
      (
        x: number,
        y: number,
        isBomb: boolean,
      ) => {
        const particleCount =
          isBomb ? 18 : 10;

        for (
          let i = 0;
          i < particleCount;
          i++
        ) {
          if (
            juiceParticlesRef.current
              .length >= MAX_PARTICLES
          ) {
            break;
          }

          const angle =
            Math.random() *
            Math.PI *
            2;

          const speed =
            (isBomb
              ? 0.035
              : 0.025) +
            Math.random() *
              (isBomb
                ? 0.07
                : 0.045);

          juiceParticlesRef.current.push(
            {
              id:
                nextParticleId.current++,

              x,
              y,

              vx:
                Math.cos(angle) *
                speed,

              vy:
                Math.sin(angle) *
                speed,

              size:
                isBomb
                  ? 5 +
                    Math.random() * 7
                  : 3 +
                    Math.random() * 6,

              life: 1,

              isBomb,
            },
          );
        }
      },
      [],
    );

  /*
   * ========================================
   * HIT EFFECT
   * ========================================
   */

  const createHitEffect =
    useCallback(
      (
        x: number,
        y: number,
        points: number,
        isBomb: boolean,
      ) => {
        if (
          hitEffectsRef.current.length >=
          4
        ) {
          hitEffectsRef.current.shift();
        }

        hitEffectsRef.current.push({
          id:
            nextEffectId.current++,

          x,
          y,
          points,
          isBomb,

          createdAt:
            performance.now(),
        });
      },
      [],
    );

  /*
   * ========================================
   * SLICE OBJECT
   * ========================================
   */

  const sliceObject =
    useCallback(
      (fruit: Fruit) => {
        if (
          slicedFruitIdsRef.current.has(
            fruit.id,
          )
        ) {
          return;
        }

        slicedFruitIdsRef.current.add(
          fruit.id,
        );

        fruitsRef.current =
          fruitsRef.current.filter(
            (item) =>
              item.id !== fruit.id,
          );

        /*
         * BOMB
         */

        if (fruit.isBomb) {
          comboRef.current = 0;

          livesRef.current =
            Math.max(
              0,
              livesRef.current - 1,
            );

          setCombo(0);
          setLives(
            livesRef.current,
          );

          playBombSound();

          createHitEffect(
            fruit.x,
            fruit.y,
            0,
            true,
          );

          createParticles(
            fruit.x,
            fruit.y,
            true,
          );

          if (
            livesRef.current <= 0
          ) {
            setTimeout(() => {
              endGame();
            }, 200);
          }

          return;
        }

        /*
         * FRUIT
         */

        playFruitSound();

        /*
         * Keep sliced objects limited.
         */

        if (
          slicedFruitsRef.current
            .length <
          MAX_SLICED_FRUITS
        ) {
          const leftHalf: SlicedFruit =
            {
              id:
                fruit.id * 2,

              x:
                fruit.x - 2,

              y:
                fruit.y,

              vx:
                fruit.vx - 0.035,

              vy:
                fruit.vy - 0.025,

              rotation:
                fruit.rotation,

              rotationSpeed:
                -0.8,

              emoji:
                fruit.emoji,

              side: "left",
            };

          const rightHalf: SlicedFruit =
            {
              id:
                fruit.id * 2 + 1,

              x:
                fruit.x + 2,

              y:
                fruit.y,

              vx:
                fruit.vx + 0.035,

              vy:
                fruit.vy - 0.025,

              rotation:
                fruit.rotation,

              rotationSpeed:
                0.8,

              emoji:
                fruit.emoji,

              side: "right",
            };

          slicedFruitsRef.current.push(
            leftHalf,
            rightHalf,
          );
        }

        /*
         * COMBO
         */

        comboRef.current =
          Math.min(
            comboRef.current + 1,
            MAX_COMBO,
          );

        setCombo(
          comboRef.current,
        );

        if (
          comboRef.current >= 2
        ) {
          playComboSound();
        }

        /*
         * SCORE
         */

        const points =
          comboRef.current *
          POINTS_PER_COMBO;

        scoreRef.current += points;

        setScore(
          scoreRef.current,
        );

        /*
         * EFFECTS
         */

        createHitEffect(
          fruit.x,
          fruit.y,
          points,
          false,
        );

        createParticles(
          fruit.x,
          fruit.y,
          false,
        );
      },
      [
        createHitEffect,
        createParticles,
        endGame,
        playBombSound,
        playComboSound,
        playFruitSound,
      ],
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

    gameStartedRef.current = true;

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

      const elapsedTime =
        (currentTime -
          gameStartTime.current) /
        1000;

      const remaining =
        Math.max(
          0,
          Math.ceil(
            GAME_DURATION -
              elapsedTime,
          ),
        );

      /*
       * Update timer only once
       * per second.
       */

      const currentSecond =
        Math.floor(
          elapsedTime,
        );

      if (
        currentSecond !==
        lastSecondRef.current
      ) {
        lastSecondRef.current =
          currentSecond;

        setTimeLeft(
          remaining,
        );
      }

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

      if (elapsedTime >= 20) {
        currentDifficulty = "Hard";
      } else if (elapsedTime >= 10) {
        currentDifficulty = "Medium";
      }

      if (
        difficultyRef.current !==
        currentDifficulty
      ) {
        difficultyRef.current =
          currentDifficulty;

        setDifficulty(
          currentDifficulty,
        );
      }

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
          settings.spawnInterval &&
        fruitsRef.current.length <
          MAX_FRUITS
      ) {
        const startX =
          Math.random() * 70 + 15;

        const direction =
          Math.random() > 0.5
            ? 1
            : -1;

        const isBomb =
          Math.random() <
          BOMB_CHANCE;

        fruitsRef.current.push({
          id:
            nextFruitId.current++,

          x: startX,

          y: 100,

          vx:
            settings.horizontalSpeed *
            direction *
            (0.75 +
              Math.random() * 0.5),

          vy:
            -settings.upwardSpeed *
            (0.9 +
              Math.random() * 0.2),

          gravity:
            settings.gravity,

          emoji: isBomb
            ? "💣"
            : FRUITS[
                Math.floor(
                  Math.random() *
                    FRUITS.length,
                )
              ],

          rotation:
            Math.random() * 360,

          rotationSpeed:
            (Math.random() - 0.5) *
            0.4,

          isBomb,
        });

        lastSpawnTime.current =
          currentTime;
      }

      /*
       * ==================================
       * MOVE FRUITS
       * ==================================
       */

      for (
        let i = 0;
        i < fruitsRef.current.length;
        i++
      ) {
        const fruit =
          fruitsRef.current[i];

        fruit.vy +=
          fruit.gravity *
          frameTime;

        fruit.x +=
          fruit.vx *
          frameTime;

        fruit.y +=
          fruit.vy *
          frameTime;

        fruit.rotation +=
          fruit.rotationSpeed *
          frameTime;

        if (fruit.x < 5) {
          fruit.x = 5;
          fruit.vx =
            Math.abs(fruit.vx);
        }

        if (fruit.x > 95) {
          fruit.x = 95;
          fruit.vx =
            -Math.abs(fruit.vx);
        }
      }

      /*
       * ==================================
       * MOVE SLICED FRUITS
       * ==================================
       */

      for (
        let i =
          slicedFruitsRef.current
            .length -
          1;
        i >= 0;
        i--
      ) {
        const fruit =
          slicedFruitsRef.current[i];

        fruit.x +=
          fruit.vx *
          frameTime;

        fruit.y +=
          fruit.vy *
          frameTime;

        fruit.vy +=
          0.00012 *
          frameTime;

        fruit.rotation +=
          fruit.rotationSpeed *
          frameTime;

        if (fruit.y >= 115) {
          slicedFruitsRef.current.splice(
            i,
            1,
          );
        }
      }

      /*
       * ==================================
       * HAND + SLASH
       * ==================================
       */

      const hand =
        handPositionRef.current;

      if (hand) {
        const currentX =
          hand.x * 100;

        const currentY =
          hand.y * 100;

        trailRef.current.push({
          x: currentX,
          y: currentY,
          time: currentTime,
        });

        if (
          trailRef.current.length >
          MAX_TRAIL_POINTS
        ) {
          trailRef.current.shift();
        }

        const previous =
          previousHandRef.current;

        if (previous) {
          const movementDistance =
            distance(
              previous.x,
              previous.y,
              currentX,
              currentY,
            );

          const movementTime =
            currentTime -
            previous.time;

          if (
            movementDistance >=
              MIN_SLASH_DISTANCE &&
            movementTime <=
              MAX_SLASH_TIME
          ) {
            playSlashSound();

            /*
             * Iterate backwards so
             * removing fruits is safe.
             */

            const currentFruits =
              [...fruitsRef.current];

            for (
              let i = 0;
              i < currentFruits.length;
              i++
            ) {
              const fruit =
                currentFruits[i];

              if (
                slicedFruitIdsRef.current.has(
                  fruit.id,
                )
              ) {
                continue;
              }

              const hitDistance =
                pointToSegmentDistance(
                  fruit.x,
                  fruit.y,
                  previous.x,
                  previous.y,
                  currentX,
                  currentY,
                );

              if (
                hitDistance <=
                SLASH_HIT_DISTANCE
              ) {
                sliceObject(fruit);
              }
            }
          }
        }

        previousHandRef.current = {
          x: currentX,
          y: currentY,
          time: currentTime,
        };
      } else {
        previousHandRef.current =
          null;
      }

      /*
       * ==================================
       * TRAIL CLEANUP
       * ==================================
       */

      trailRef.current =
        trailRef.current.filter(
          (point) =>
            currentTime -
              point.time <=
            TRAIL_LIFETIME,
        );

      /*
       * ==================================
       * PARTICLES
       * ==================================
       */

      for (
        let i =
          juiceParticlesRef.current
            .length -
          1;
        i >= 0;
        i--
      ) {
        const particle =
          juiceParticlesRef.current[i];

        particle.x +=
          particle.vx *
          frameTime;

        particle.y +=
          particle.vy *
          frameTime;

        particle.vy +=
          0.00015 *
          frameTime;

        particle.life -=
          0.04;

        if (
          particle.life <= 0
        ) {
          juiceParticlesRef.current.splice(
            i,
            1,
          );
        }
      }

      /*
       * ==================================
       * HIT EFFECT CLEANUP
       * ==================================
       */

      hitEffectsRef.current =
        hitEffectsRef.current.filter(
          (effect) =>
            currentTime -
              effect.createdAt <
            500,
        );

      /*
       * ==================================
       * MISSED FRUITS
       * ==================================
       */

      let missedCount = 0;

      for (
        let i =
          fruitsRef.current.length -
          1;
        i >= 0;
        i--
      ) {
        const fruit =
          fruitsRef.current[i];

        if (
          fruit.y > 108
        ) {
          /*
           * Bombs don't cost a life
           * when they simply fall.
           */

          if (!fruit.isBomb) {
            missedCount++;
          }

          fruitsRef.current.splice(
            i,
            1,
          );
        }
      }

      if (missedCount > 0) {
        comboRef.current = 0;

        setCombo(0);

        livesRef.current =
          Math.max(
            0,
            livesRef.current -
              missedCount,
          );

        setLives(
          livesRef.current,
        );

        if (
          livesRef.current <= 0
        ) {
          endGame();
          return;
        }
      }

      /*
       * ==================================
       * CONTROLLED RENDER
       *
       * Around 30 FPS for React.
       * Physics still runs at 60 FPS.
       * ==================================
       */

      if (
        currentTime -
          lastRenderTimeRef.current >=
        33
      ) {
        lastRenderTimeRef.current =
          currentTime;

        renderTick();
      }

      animationFrame.current =
        requestAnimationFrame(
          gameLoop,
        );
    };

    animationFrame.current =
      requestAnimationFrame(
        gameLoop,
      );

    return () => {
      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current,
        );

        animationFrame.current = null;
      }
    };
  }, [
    gameStarted,
    endGame,
    playSlashSound,
    renderTick,
    sliceObject,
  ]);

  /*
   * ========================================
   * CLEANUP
   * ========================================
   */

  useEffect(() => {
    return () => {
      gameStartedRef.current = false;

      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current,
        );
      }
    };
  }, []);

  /*
   * ========================================
   * BLADE PATH
   * ========================================
   */

  const trail =
    trailRef.current;

  const trailPath =
    trail.length >= 2
      ? trail
          .map(
            (point, index) =>
              `${
                index === 0
                  ? "M"
                  : "L"
              } ${point.x} ${point.y}`,
          )
          .join(" ")
      : "";

  /*
   * ========================================
   * CURRENT GAME OBJECTS
   * ========================================
   */

  const fruits =
    fruitsRef.current;

  const slicedFruits =
    slicedFruitsRef.current;

  const juiceParticles =
    juiceParticlesRef.current;

  const hitEffects =
    hitEffectsRef.current;

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

            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45">

              <div className="flex flex-col items-center rounded-3xl bg-black/75 px-10 py-10 text-center backdrop-blur-md">

                <div className="text-8xl">
                  🍎
                </div>

                <h2 className="mt-5 text-4xl font-bold text-white">
                  Fruit Slash
                </h2>

                <p className="mt-3 max-w-md text-gray-300">
                  Slice fruits,
                  build combos,
                  and avoid bombs!
                </p>

                <button
                  onClick={
                    startGame
                  }
                  className="mt-8 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-black transition hover:scale-105 hover:bg-gray-200"
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

          {/* LIGHT OVERLAY */}

          <div className="pointer-events-none absolute inset-0 z-10 bg-black/10" />

          {/* ================================= */}
          {/* HUD */}
          {/* ================================= */}

          <div className="absolute left-6 right-6 top-6 z-50 flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-300">
                Score
              </p>

              <p className="text-3xl font-bold text-white">
                {score}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-300">
                Combo
              </p>

              <p
                className={`text-3xl font-bold ${
                  combo >= 3
                    ? "text-orange-400"
                    : "text-white"
                }`}
              >
                {combo}x
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-300">
                Difficulty
              </p>

              <p className="font-bold text-white">
                {difficulty}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-300">
                Lives
              </p>

              <p className="text-2xl">
                {"❤️".repeat(lives)}
                {"🖤".repeat(
                  STARTING_LIVES -
                    lives,
                )}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-300">
                Time
              </p>

              <p className="text-3xl font-bold text-white">
                {timeLeft}s
              </p>
            </div>

          </div>

          {/* ================================= */}
          {/* BLADE */}
          {/* ================================= */}

          <svg
            className="pointer-events-none absolute inset-0 z-40 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {trailPath && (
              <>
                <path
                  d={trailPath}
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.25"
                  vectorEffect="non-scaling-stroke"
                />

                <path
                  d={trailPath}
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>

          {/* ================================= */}
          {/* OBJECTS */}
          {/* ================================= */}

          <div className="absolute inset-0 z-20 overflow-hidden">

            {/* FRUITS + BOMBS */}

            {fruits.map(
              (fruit) => (
                <button
                  key={fruit.id}
                  onClick={() =>
                    sliceObject(
                      fruit,
                    )
                  }
                  aria-label={
                    fruit.isBomb
                      ? "Bomb"
                      : "Slice fruit"
                  }
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    left: `${fruit.x}%`,
                    top: `${fruit.y}%`,

                    width: `${FRUIT_SIZE}px`,
                    height: `${FRUIT_SIZE}px`,

                    transform:
                      `translate3d(-50%, -50%, 0) rotate(${fruit.rotation}deg)`,

                    fontSize:
                      `${FRUIT_EMOJI_SIZE}px`,

                    willChange:
                      "transform",

                    /*
                     * Removed expensive
                     * drop-shadow filters.
                     */

                    userSelect: "none",

                    WebkitTapHighlightColor:
                      "transparent",
                  }}
                >
                  {fruit.emoji}
                </button>
              ),
            )}

            {/* ================================= */}
            {/* SLICED FRUITS */}
            {/* ================================= */}

            {slicedFruits.map(
              (fruit) => (
                <div
                  key={fruit.id}
                  className="pointer-events-none absolute flex items-center justify-center"
                  style={{
                    left: `${fruit.x}%`,
                    top: `${fruit.y}%`,

                    width:
                      `${FRUIT_SIZE / 2}px`,

                    height:
                      `${FRUIT_SIZE}px`,

                    overflow: "hidden",

                    transform:
                      `translate3d(-50%, -50%, 0) rotate(${fruit.rotation}deg)`,

                    willChange:
                      "transform",
                  }}
                >
                  <div
                    style={{
                      position:
                        "absolute",

                      left:
                        fruit.side ===
                        "left"
                          ? "0"
                          : "-100%",

                      width:
                        `${FRUIT_SIZE}px`,

                      height:
                        `${FRUIT_SIZE}px`,

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      fontSize:
                        `${FRUIT_EMOJI_SIZE}px`,
                    }}
                  >
                    {fruit.emoji}
                  </div>
                </div>
              ),
            )}

            {/* ================================= */}
            {/* PARTICLES */}
            {/* ================================= */}

            {juiceParticles.map(
              (particle) => (
                <div
                  key={particle.id}
                  className={`pointer-events-none absolute rounded-full ${
                    particle.isBomb
                      ? "bg-orange-500"
                      : "bg-red-400"
                  }`}
                  style={{
                    left:
                      `${particle.x}%`,

                    top:
                      `${particle.y}%`,

                    width:
                      `${particle.size}px`,

                    height:
                      `${particle.size}px`,

                    opacity:
                      particle.life,

                    transform:
                      "translate3d(-50%, -50%, 0)",

                    /*
                     * No box-shadow.
                     */

                    willChange:
                      "transform, opacity",
                  }}
                />
              ),
            )}

            {/* ================================= */}
            {/* HIT EFFECT */}
            {/* ================================= */}

            {hitEffects.map(
              (effect) => (
                <div
                  key={effect.id}
                  className="pointer-events-none absolute z-50 flex flex-col items-center"
                  style={{
                    left:
                      `${effect.x}%`,

                    top:
                      `${effect.y}%`,

                    transform:
                      "translate3d(-50%, -50%, 0)",
                  }}
                >
                  <span
                    className={
                      effect.isBomb
                        ? "text-6xl"
                        : "text-5xl"
                    }
                  >
                    {effect.isBomb
                      ? "💥"
                      : "✨"}
                  </span>

                  <span
                    className={`text-xl font-bold ${
                      effect.isBomb
                        ? "text-red-500"
                        : "text-white"
                    }`}
                  >
                    {effect.isBomb
                      ? "BOMB!"
                      : `+${effect.points}`}
                  </span>
                </div>
              ),
            )}

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

          <div className="absolute inset-0 z-40 flex min-h-[600px] flex-col items-center justify-center bg-black/80 px-6 backdrop-blur-sm">

            <div className="text-7xl">
              🏆
            </div>

            <h2 className="mt-6 text-4xl font-bold text-white">
              Game Over
            </h2>

            <p className="mt-4 text-lg text-gray-400">
              Final Score
            </p>

            <p className="mt-1 text-5xl font-bold text-white">
              {score}
            </p>

            <button
              onClick={
                startGame
              }
              className="mt-8 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-black transition hover:scale-105 hover:bg-gray-200"
            >
              Play Again
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default FruitSlashGame;