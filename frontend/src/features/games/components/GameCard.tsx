import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Game } from "../types";

interface GameCardProps {
  game: Game;
}

function GameCard({ game }: GameCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-cyan-400/30"
    >
      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10">
        <span className="text-7xl transition-transform duration-300 group-hover:scale-110">
          {game.icon}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{game.title}</h2>

          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
            {game.difficulty}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          {game.description}
        </p>

        <div className="mt-4 text-xs uppercase tracking-wider text-cyan-400">
          {game.category}
        </div>

        <Link
          to={`/games/${game.id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          Play
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}

export default GameCard;