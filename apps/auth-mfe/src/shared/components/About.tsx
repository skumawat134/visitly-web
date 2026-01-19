import React from "react";

const About = ({ msg }: { msg: string }) => {
  return (
    <section className="tw:relative tw:overflow-hidden tw:bg-blue-1000 tw:py-24 sm:tw:py-32">
      {/* Decorative background glow */}
      <div className="tw:absolute tw:-top-24 tw:left-1/2 tw:-z-10 tw:h-[600px] tw:w-[600px] tw:-translate-x-1/2 tw:rounded-full tw:bg-blue-500/10 tw:blur-3xl" />

      <div className="tw:mx-auto tw:max-w-7xl tw:px-6 lg:tw:px-8">
        <div className="tw:mx-auto tw:max-w-2xl tw:text-center">
          {/* Badge */}
          <div className="tw:mb-8 tw:flex tw:justify-center">
            <span className="tw:rounded-full tw:border tw:border-blue-500/30 tw:bg-blue-500/10 tw:px-3 tw:py-1 tw:text-sm tw:font-medium tw:leading-6 tw:text-blue-400">
              New: Visitly Auth v4 is here
            </span>
          </div>

          <h1 className="tw:text-4xl tw:font-bold tw:tracking-tight tw:text-white sm:tw:text-6xl">
            Secure Access for{" "}
            <span className="tw:text-blue-500">Modern Teams</span>
          </h1>

          <p className="tw:mt-6 tw:text-lg tw:leading-8 tw:text-slate-400">
            Streamline your authentication workflow with our plug-and-play MFE.
            Built for scale, security, and seamless integration.
          </p>

          <div className="tw:mt-10 tw:flex tw:items-center tw:justify-center tw:gap-x-6">
            <button className="tw:rounded-xl tw:bg-blue-600 tw:px-6 tw:py-3 tw:text-sm tw:font-semibold tw:text-white tw:shadow-lg tw:transition-all hover:tw:bg-blue-500 hover:tw:shadow-blue-500/25 active:tw:scale-95">
              Start Building
            </button>
            <button className="tw:text-sm tw:font-semibold tw:leading-6 tw:text-white hover:tw:text-blue-400 tw:transition-colors">
              Live Demo <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="tw:mt-20 tw:grid tw:grid-cols-1 tw:gap-8 sm:tw:grid-cols-3">
          {[
            { title: "Encapsulated", desc: "Runs in its own scope." },
            { title: "Tailwind v4", desc: "CSS-first configuration." },
            { title: "Federated", desc: "Built for monorepos." },
          ].map((feature, i) => (
            <div
              key={i}
              className="tw:rounded-2xl tw:border tw:border-white/5 tw:bg-white/5 tw:p-6 tw:backdrop-blur-sm"
            >
              <h3 className="tw:text-base tw:font-semibold tw:text-white">
                {feature.title}
              </h3>
              <p className="tw:mt-2 tw:text-sm tw:text-slate-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
