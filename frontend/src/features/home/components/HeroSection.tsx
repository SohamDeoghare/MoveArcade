import { ArrowRight, Play, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-72px)] items-center overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[15%] h-80 w-80 rounded-full bg-cyan-500/[0.08] blur-[120px]" />

        <div className="absolute bottom-[5%] right-[10%] h-96 w-96 rounded-full bg-purple-500/[0.08] blur-[140px]" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.025] blur-[100px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-sm text-cyan-300"
          >
            <Sparkles size={15} />

            <span>AI-Powered Motion Gaming</span>

            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          </motion.div>

          {/* Heading */}
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[82px]">
            Gaming without
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              boundaries.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            Turn your webcam into a controller. Move, react, compete, and
            play immersive games powered by real-time AI motion tracking.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/games"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-gray-200"
            >
              <Play
                size={17}
                fill="currentColor"
              />

              Play Now

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/games"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
            >
              Explore Games
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center gap-8 border-t border-white/[0.07] pt-7">
            <div>
              <p className="text-xl font-bold text-white">AI</p>
              <p className="mt-1 text-xs text-gray-500">
                Motion Tracking
              </p>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <p className="text-xl font-bold text-white">4+</p>
              <p className="mt-1 text-xs text-gray-500">
                Interactive Games
              </p>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <p className="text-xl font-bold text-white">∞</p>
              <p className="mt-1 text-xs text-gray-500">
                Ways to Play
              </p>
            </div>
          </div>
        </motion.div>

        {/* Interactive visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.9,
            delay: 0.2,
          }}
          className="relative hidden lg:block"
        >
          <div className="relative mx-auto aspect-square max-w-[560px]">
            {/* Outer rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-4 rounded-full border border-dashed border-cyan-400/10"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 24,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-16 rounded-full border border-dashed border-purple-400/10"
            />

            <div className="absolute inset-28 rounded-full border border-white/[0.07]" />

            {/* Floating status cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-[27%] z-20 rounded-2xl border border-white/10 bg-[#0b0c12]/80 px-4 py-3 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-400/10">
                  <Zap
                    size={17}
                    className="text-green-400"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Tracking
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Active
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-[22%] right-0 z-20 rounded-2xl border border-white/10 bg-[#0b0c12]/80 px-4 py-3 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-400/10">
                  <span className="text-lg">🎮</span>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Game
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Ready
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Main interface */}
            <div className="absolute inset-[22%] flex items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/[0.035] shadow-[0_0_80px_rgba(34,211,238,0.06)] backdrop-blur-2xl">
              {/* Corner markers */}
              <div className="absolute left-5 top-5 h-3 w-3 rounded-tl-md border-l border-t border-cyan-400/50" />
              <div className="absolute right-5 top-5 h-3 w-3 rounded-tr-md border-r border-t border-cyan-400/50" />
              <div className="absolute bottom-5 left-5 h-3 w-3 rounded-bl-md border-b border-l border-cyan-400/50" />
              <div className="absolute bottom-5 right-5 h-3 w-3 rounded-br-md border-b border-r border-cyan-400/50" />

              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.08] shadow-[0_0_50px_rgba(34,211,238,0.08)]"
                >
                  <span className="text-5xl">
                    🕺
                  </span>
                </motion.div>

                <p className="mt-6 font-semibold text-white">
                  Motion Detected
                </p>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

                  <p className="text-xs text-gray-500">
                    AI tracking active
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking points */}
            <div className="absolute left-[22%] top-[20%] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

            <div className="absolute right-[20%] top-[34%] h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />

            <div className="absolute bottom-[22%] left-[31%] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

            <div className="absolute bottom-[31%] right-[27%] h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;