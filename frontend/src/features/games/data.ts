import type { Game } from "./types";

export const games: Game[] = [
  {
    id: "fruit-slash",
    title: "Fruit Slash",
    description: "Slice flying fruits using your hand movements.",
    difficulty: "Easy",
    category: "Action",
    icon: "🍎",
  },
  {
    id: "target-shooter",
    title: "Target Shooter",
    description: "Aim and hit targets using your body gestures.",
    difficulty: "Medium",
    category: "Arcade",
    icon: "🎯",
  },
  {
    id: "fitness-challenge",
    title: "Fitness Challenge",
    description: "Complete physical exercises to earn points.",
    difficulty: "Hard",
    category: "Fitness",
    icon: "🏋️",
  },
  {
    id: "goalkeeper",
    title: "Goalkeeper",
    description: "Move your body and stop incoming shots.",
    difficulty: "Medium",
    category: "Sports",
    icon: "🥅",
  },
];