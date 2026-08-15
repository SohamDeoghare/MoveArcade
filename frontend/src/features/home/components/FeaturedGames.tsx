import { ArrowRight, Crosshair, Dumbbell, Hand, Apple } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const games = [
  {
    title: "Fruit Slash",
    description: "Slash flying fruits using your hand movements.",
    icon: Apple,
    difficulty: "Easy",
  },
  {
    title: "Target Shooter",
    description: "Aim at targets and hit them using body gestures.",
    icon: Crosshair,
    difficulty: "Medium",
  },
  {
    title: "Fitness Challenge",
    description: "Complete physical exercises to earn points.",
    icon: Dumbbell,
    difficulty: "Hard",
  },
  {
    title: "Goalkeeper",
    description: "Move your body and stop incoming shots.",
    icon: Hand,
    difficulty: "Medium",
  },
];

function FeaturedGames() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Featured Games
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Choose your challenge.
            </h2>

            <p className="mt-4 max-w-xl text-gray-400">
              Different games. Different movements. One controller — you.
            </p>
          </div>

          <Link
            to="/games"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-300 transition hover:text-white"
          >
            View all games
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game, index) => {
            const Icon = game.icon;

            return (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-cyan-400 backdrop-blur transition group-hover:scale-110">
                    <Icon size={38} />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {game.title}
                    </h3>

                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-gray-400">
                      {game.difficulty}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {game.description}
                  </p>

                  <Link
                    to="/games"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                  >
                    Play game
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturedGames;