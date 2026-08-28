import { useMemo } from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import { useGameStore } from "../store/gameStore";

function LeaderboardPage() {
  const scores = useGameStore((state) => state.scores);

  const leaderboard = useMemo(() => {
    return [...scores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [scores]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-16">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10">
            <Trophy className="text-yellow-400" size={32} />
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Game Arcade
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Leaderboard
          </h1>

          <p className="mt-4 text-gray-400">
            See who is dominating the arcade.
          </p>
        </div>

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <Trophy
              size={48}
              className="mx-auto text-gray-600"
            />

            <h2 className="mt-5 text-xl font-semibold text-white">
              No scores yet
            </h2>

            <p className="mt-2 text-gray-400">
              Play a game to get your first score on the leaderboard.
            </p>
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

            {/* Table Header */}
            <div className="grid grid-cols-[70px_1fr_180px] border-b border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-medium text-gray-400">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Score</span>
            </div>

            {leaderboard.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[70px_1fr_180px] items-center border-b border-white/5 px-6 py-5 last:border-b-0"
              >

                {/* Rank */}
                <div>
                  {index === 0 ? (
                    <Crown className="text-yellow-400" size={22} />
                  ) : index === 1 ? (
                    <Medal className="text-gray-300" size={22} />
                  ) : index === 2 ? (
                    <Medal className="text-orange-400" size={22} />
                  ) : (
                    <span className="text-gray-500">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Player */}
                <div>
                  <p className="font-semibold text-white">
                    {item.playerName}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.gameTitle}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-xl font-bold text-cyan-400">
                    {item.score}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default LeaderboardPage;