import {
  ArrowRight,
  Camera,
  Sparkles,
  Play,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function CTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.045] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
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
          }}
          transition={{
            duration: 0.7,
          }}
          className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
        >
          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Glow */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/[0.08] blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-500/[0.08] blur-[100px]" />

          <div className="relative">

            {/* Icon */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.08)]"
            >
              <Camera size={28} />
            </motion.div>

            {/* Badge */}
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-gray-400">
              <Sparkles
                size={13}
                className="text-cyan-400"
              />

              AI-powered gaming
            </div>

            {/* Heading */}
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
              Ready to turn your
              <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                {" "}
                movements
              </span>{" "}
              into gameplay?
            </h2>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-500">
              Grab your camera, choose a game, and experience gaming without
              a traditional controller.
            </p>

            {/* CTA */}
            <Link
              to="/games"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-black shadow-[0_0_35px_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-gray-200"
            >
              <Play
                size={17}
                fill="currentColor"
              />

              Start Playing

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            {/* Trust indicators */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                No controller required
              </span>

              <span className="hidden h-3 w-px bg-white/10 sm:block" />

              <span className="flex items-center gap-1.5">
                <Camera size={14} />
                Webcam powered
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;