import FruitSlashGame from "../features/games/fruit-slash/FruitSlashGame";
import TargetShooterGame from "../features/games/target-shooter/TargetShooterGame";
import FitnessChallengeGame from "../features/games/fitness-challenge/FitnessChallengeGame";
import GoalkeeperGame from "../features/games/goalkeeper/GoalkeeperGame";

import {
  Link,
  useParams,
} from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { games } from "../features/games/data";

function GamePage() {
  const { gameId } =
    useParams();

  const game = games.find(
    (item) =>
      item.id === gameId,
  );

  if (!game) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <div className="text-center">

          <h1 className="text-3xl font-bold text-white">
            Game Not Found
          </h1>

          <p className="mt-3 text-gray-400">
            The game you're looking
            for doesn't exist.
          </p>

          <Link
            to="/games"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-medium text-black"
          >
            <ArrowLeft size={17} />
            Back to Games
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Games
        </Link>

        <div className="mt-8">

          {game.id ===
            "fruit-slash" && (
            <FruitSlashGame />
          )}

          {game.id ===
            "target-shooter" && (
            <TargetShooterGame />
          )}

          {game.id ===
            "fitness-challenge" && (
            <FitnessChallengeGame />
          )}

          {game.id ===
            "goalkeeper" && (
            <GoalkeeperGame />
          )}

        </div>
      </div>
    </main>
  );
}

export default GamePage;