import { useMemo, useState } from "react";
import {
  Trophy,
  Gamepad2,
  Star,
  User,
  Pencil,
  Check,
  Calendar,
} from "lucide-react";

import { useGameStore } from "../store/gameStore";

function ProfilePage() {
  const playerName = useGameStore(
    (state) => state.playerName
  );

  const scores = useGameStore(
    (state) => state.scores
  );

  const setPlayerName = useGameStore(
    (state) => state.setPlayerName
  );

  const [isEditing, setIsEditing] =
    useState(false);

  const [nameInput, setNameInput] =
    useState(playerName);

  const totalScore = useMemo(() => {
    return scores.reduce(
      (total, item) => total + item.score,
      0
    );
  }, [scores]);

  const gamesPlayed = scores.length;

  const bestScore = useMemo(() => {
    if (scores.length === 0) {
      return 0;
    }

    return Math.max(
      ...scores.map((item) => item.score)
    );
  }, [scores]);

  const recentGames = useMemo(() => {
    return [...scores]
      .sort(
        (a, b) =>
          new Date(b.playedAt).getTime() -
          new Date(a.playedAt).getTime()
      )
      .slice(0, 5);
  }, [scores]);

  const handleSaveName = () => {
    const trimmedName =
      nameInput.trim();

    if (!trimmedName) {
      return;
    }

    setPlayerName(trimmedName);
    setNameInput(trimmedName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setNameInput(playerName);
    setIsEditing(false);
  };

  const formatDate = (
    dateString: string
  ) => {
    return new Date(
      dateString
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] px-6 py-16">
      <div className="mx-auto max-w-6xl">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
            <User
              size={38}
              className="text-cyan-400"
            />
          </div>

          {/* Player Name */}

          {!isEditing ? (
            <div className="mt-5 flex items-center justify-center gap-3">

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {playerName}
              </h1>

              <button
                onClick={() =>
                  setIsEditing(true)
                }
                aria-label="Edit player name"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <Pencil size={18} />
              </button>

            </div>
          ) : (
            <div className="mt-5 flex items-center justify-center gap-2">

              <input
                value={nameInput}
                onChange={(event) =>
                  setNameInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    handleSaveName();
                  }

                  if (
                    event.key === "Escape"
                  ) {
                    handleCancelEdit();
                  }
                }}
                autoFocus
                maxLength={20}
                className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xl font-semibold text-white outline-none transition focus:border-cyan-400/50"
              />

              <button
                onClick={
                  handleSaveName
                }
                aria-label="Save name"
                className="rounded-xl bg-cyan-400 p-3 text-black transition hover:bg-cyan-300"
              >
                <Check size={19} />
              </button>

              <button
                onClick={
                  handleCancelEdit
                }
                className="rounded-xl bg-white/5 px-4 py-3 text-sm text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>

            </div>
          )}

          <p className="mt-3 text-gray-400">
            Your MoveArcade gaming profile
          </p>

        </div>

        {/* ================================= */}
        {/* STAT CARDS */}
        {/* ================================= */}

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Score */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                <Trophy
                  size={22}
                  className="text-cyan-400"
                />
              </div>

              <span className="text-xs uppercase tracking-wider text-gray-500">
                Total
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              {totalScore}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Total Score
            </p>

          </div>

          {/* Games Played */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-400/10">
                <Gamepad2
                  size={22}
                  className="text-purple-400"
                />
              </div>

              <span className="text-xs uppercase tracking-wider text-gray-500">
                Games
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              {gamesPlayed}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Games Played
            </p>

          </div>

          {/* Best Score */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10">
                <Star
                  size={22}
                  className="text-yellow-400"
                />
              </div>

              <span className="text-xs uppercase tracking-wider text-gray-500">
                Best
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              {bestScore}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Best Score
            </p>

          </div>

          {/* Score Entries */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-400/10">
                <Calendar
                  size={22}
                  className="text-green-400"
                />
              </div>

              <span className="text-xs uppercase tracking-wider text-gray-500">
                History
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              {scores.length}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Score Entries
            </p>

          </div>

        </div>

        {/* ================================= */}
        {/* RECENT GAMES */}
        {/* ================================= */}

        <section className="mt-12">

          <div className="mb-5">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Activity
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Recent Games
            </h2>

          </div>

          {recentGames.length === 0 ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">

              <Gamepad2
                size={48}
                className="mx-auto text-gray-600"
              />

              <h3 className="mt-5 text-xl font-semibold text-white">
                No games played yet
              </h3>

              <p className="mt-2 text-gray-400">
                Play a game to see your
                activity here.
              </p>

            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

              {/* Table Header */}

              <div className="hidden grid-cols-[1fr_160px_160px] border-b border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-medium text-gray-400 sm:grid">

                <span>Game</span>

                <span className="text-right">
                  Score
                </span>

                <span className="text-right">
                  Date
                </span>

              </div>

              {recentGames.map(
                (item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 border-b border-white/5 px-6 py-5 last:border-b-0 sm:grid-cols-[1fr_160px_160px] sm:items-center"
                  >

                    {/* Game */}

                    <div>

                      <p className="font-semibold text-white">
                        {item.gameTitle}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.gameId}
                      </p>

                    </div>

                    {/* Score */}

                    <div className="text-left sm:text-right">

                      <span className="text-xl font-bold text-cyan-400">
                        {item.score}
                      </span>

                    </div>

                    {/* Date */}

                    <div className="text-left text-sm text-gray-500 sm:text-right">
                      {formatDate(
                        item.playedAt
                      )}
                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* ================================= */}
        {/* GAME PERFORMANCE */}
        {/* ================================= */}

        {scores.length > 0 && (
          <section className="mt-12">

            <div className="mb-5">

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Performance
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Game Performance
              </h2>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {Array.from(
                new Map(
                  scores.map((item) => [
                    item.gameId,
                    item,
                  ])
                ).values()
              ).map((game) => {

                const gameScores =
                  scores.filter(
                    (item) =>
                      item.gameId ===
                      game.gameId
                  );

                const gameBest =
                  Math.max(
                    ...gameScores.map(
                      (item) =>
                        item.score
                    )
                  );

                return (
                  <div
                    key={game.gameId}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <h3 className="font-semibold text-white">
                        {game.gameTitle}
                      </h3>

                      <span className="text-2xl">
                        🎮
                      </span>

                    </div>

                    <div className="mt-6">

                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Best Score
                      </p>

                      <p className="mt-1 text-3xl font-bold text-cyan-400">
                        {gameBest}
                      </p>

                    </div>

                    <div className="mt-4">

                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Times Played
                      </p>

                      <p className="mt-1 text-lg font-semibold text-white">
                        {gameScores.length}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default ProfilePage;