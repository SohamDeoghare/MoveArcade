export type GameDifficulty = "Easy" | "Medium" | "Hard";

export interface Game {
  id: string;
  title: string;
  description: string;
  difficulty: GameDifficulty;
  category: string;
  icon: string;
}