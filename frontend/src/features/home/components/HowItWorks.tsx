import {
  Camera,
  Brain,
  Gamepad2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Connect Your Camera",
    description:
      "Allow MoveArcade to access your webcam and get ready to turn your movements into controls.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Detects Your Movement",
    description:
      "Our motion-tracking system analyzes your body movements in real time and translates them into game actions.",
  },
  {
    number: "03",
    icon: Gamepad2,
    title: "Play With Your Body",
    description:
      "Move, dodge, aim, slash, and compete without needing a traditional controller.",
  },
];

function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-white/[0.015] px-6 py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-96 -translate-x-1/2 rounded-full bg-cyan-500/[0.035] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
              How It Works
            </p>
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Your body is the controller.
          </h2>

          <p className="mt-4 leading-7 text-gray-500">
            No complicated setup. Connect your camera, let AI understand your
            movements, and start playing.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-6 md:grid-cols-3">

          {/* Connecting line */}
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-[52px] hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
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
                  delay: index * 0.12,
                }}
                className="group relative"
              >
                {/* Step number */}
                <div className="relative z-10 mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-full border border-white/10 bg-[#08090d] shadow-2xl transition duration-300 group-hover:border-cyan-400/30">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-400 transition duration-300 group-hover:scale-105 group-hover:bg-cyan-400/[0.12]">
                    <Icon size={27} />
                  </div>

                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#111217] text-[10px] font-bold text-gray-400">
                    {step.number}
                  </span>
                </div>

                {/* Card */}
                <div className="mt-7 rounded-2xl border border-white/[0.07] bg-black/20 p-7 text-center transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400/15 group-hover:bg-white/[0.025]">
                  <h3 className="text-lg font-semibold text-white">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-500">
                    {step.description}
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-gray-600 transition group-hover:text-cyan-400">
                    <CheckCircle2 size={14} />
                    Ready to play
                  </div>
                </div>

                {/* Mobile connector */}
                {index < steps.length - 1 && (
                  <div className="mx-auto my-4 flex justify-center md:hidden">
                    <ArrowRight
                      size={18}
                      className="rotate-90 text-white/10"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;