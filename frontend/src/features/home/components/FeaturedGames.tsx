import {
  ArrowRight,
  Crosshair,
  Dumbbell,
  Hand,
  Apple,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const games = [
  {
    title: "Fruit Slash",
    description: "Slash flying fruits using your hand movements.",
    icon: Apple,
    emoji: "🍎",
    difficulty: "Easy",
    accent: "cyan",
  },
  {
    title: "Target Shooter",
    description: "Aim at targets and hit them using body gestures.",
    icon: Crosshair,
    emoji: "🎯",
    difficulty: "Medium",
    accent: "purple",
  },
  {
    title: "Fitness Challenge",
    description: "Complete physical exercises to earn points.",
    icon: Dumbbell,
    emoji: "🏋️",
    difficulty: "Hard",
    accent: "orange",
  },
  {
    title: "Goalkeeper",
    description: "Move your body and stop incoming shots.",
    icon: Hand,
    emoji: "🥅",
    difficulty: "Medium",
    accent: "green",
  },
];

function FeaturedGames() {
  return (
    <section className="relative border-t border-white/[0.06] px-6 py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.025] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={15}
                className="text-cyan-400"
              />

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Featured Games
              </p>
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Choose your challenge.
            </h2>

            <p className="mt-4 max-w-xl text-gray-400">
              Different games. Different movements. One controller — you.
            </p>
          </div>

          <Link
            to="/games"
            className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-gray-400 transition hover:text-white sm:self-auto"
          >
            View all games

            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        {/* Game cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game, index) => {
            const Icon = game.icon;

            return (
              <motion.div
                key={game.title}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: "-50px",
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -7,
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] transition duration-300 hover:border-cyan-400/20 hover:bg-white/[0.045]"
              >
                {/* Game visual */}
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500/[0.08] via-transparent to-purple-500/[0.08]">

                  {/* Decorative circles */}
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/[0.05]" />

                  <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full border border-white/[0.04]" />

                  {/* Glow */}
                  <div className="absolute h-32 w-32 rounded-full bg-cyan-400/[0.07] blur-3xl transition duration-500 group-hover:bg-cyan-400/[0.13]" />

                  {/* Icon */}
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      rotate: 3,
                    }}
                    className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl"
                  >
                    <Icon
                      size={34}
                      className="text-cyan-400"
                    />

                    <span className="absolute -right-3 -top-3 text-2xl">
                      {game.emoji}
                    </span>
                  </motion.div>

                  {/* Difficulty */}
                  <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-gray-300 backdrop-blur-xl">
                    {game.difficulty}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">
                    {game.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                    {game.description}
                  </p>

                  <Link
                    to="/games"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                  >
                    Play game

                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 h-px w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturedGames;