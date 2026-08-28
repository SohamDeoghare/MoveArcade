import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GameScore {
  id: string;
  playerName: string;
  gameId: string;
  gameTitle: string;
  score: number;
  playedAt: string;
}

interface GameStore {
  playerName: string;
  scores: GameScore[];

  setPlayerName: (name: string) => void;
  addScore: (score: Omit<GameScore, "id" | "playedAt">) => void;
  getTotalScore: () => number;
  getGamesPlayed: () => number;
  getBestScore: () => number;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      playerName: "Player",
      scores: [],

      setPlayerName: (name) => {
        set({ playerName: name });
      },

      addScore: (score) => {
        const newScore: GameScore = {
          ...score,
          id: `${Date.now()}-${Math.random()}`,
          playedAt: new Date().toISOString(),
        };

        set((state) => ({
          scores: [...state.scores, newScore],
        }));
      },

      getTotalScore: () => {
        return get().scores.reduce(
          (total, item) => total + item.score,
          0
        );
      },

      getGamesPlayed: () => {
        return get().scores.length;
      },

      getBestScore: () => {
        const scores = get().scores;

        if (scores.length === 0) {
          return 0;
        }

        return Math.max(
          ...scores.map((item) => item.score)
        );
      },
    }),
    {
      name: "movearcade-game-store",
    }
  )
);