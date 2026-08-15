import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur">
            <span className="mr-2 h-2 w-2 rounded-full bg-cyan-400" />
            AI-Powered Motion Gaming
          </div>

          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Play with your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              body.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
            MoveArcade turns your webcam into a game controller. Use your
            movements to play, compete, and challenge yourself with
            AI-powered motion tracking.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/games"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              <Play size={18} fill="currentColor" />
              Play Now
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/games"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Explore Games
            </Link>
          </div>

          <div className="mt-10 flex gap-8 text-sm text-gray-500">
            <div>
              <p className="text-lg font-semibold text-white">AI</p>
              <p>Motion Tracking</p>
            </div>

            <div>
              <p className="text-lg font-semibold text-white">4+</p>
              <p>Mini Games</p>
            </div>

            <div>
              <p className="text-lg font-semibold text-white">∞</p>
              <p>Ways to Move</p>
            </div>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative mx-auto aspect-square max-w-lg">
            <div className="absolute inset-8 rounded-full border border-cyan-400/20" />
            <div className="absolute inset-16 rounded-full border border-purple-400/20" />

            <div className="absolute inset-24 flex items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                  <span className="text-4xl">🕺</span>
                </div>

                <p className="font-semibold text-white">Motion Detected</p>
                <p className="mt-1 text-sm text-gray-500">
                  AI tracking active
                </p>
              </div>
            </div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full border border-dashed border-white/10"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;