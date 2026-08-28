import GameCard from "../features/games/components/GameCard";
import { games } from "../features/games/data"; 

function GamesPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Game Arcade
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Choose your game.
          </h1>

          <p className="mt-4 text-gray-400">
            Pick a challenge and use your movements to play.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default GamesPage;