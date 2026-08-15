import { Camera, Brain, Gamepad2, ArrowDown } from "lucide-react";
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
    <section className="relative border-t border-white/5 bg-white/[0.02] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            How It Works
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Your body is the controller.
          </h2>

          <p className="mt-4 text-gray-400">
            Three simple steps are all it takes to turn your webcam into an
            interactive gaming experience.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group relative rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur-sm transition hover:border-cyan-400/30 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                    <Icon size={24} />
                  </div>

                  <span className="text-4xl font-bold text-white/5">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-400">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <ArrowDown
                    size={18}
                    className="absolute -bottom-8 left-1/2 hidden -translate-x-1/2 text-white/20 md:block"
                  />
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