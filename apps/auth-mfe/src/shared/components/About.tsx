import React from "react";
// import webpackLogo from "../assets/webpack.png";

const About = ({ msg }: { msg: string }) => {
  return (
    <section className="relative overflow-hidden bg-blue-1000 py-24 sm:py-32">
      {/* Decorative background glow */}
      <div className="absolute -top-24 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium leading-6 text-blue-400">
              New: Visitly Auth v4 is here
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Secure Access for <span className="text-blue-500">Modern Teams</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Streamline your authentication workflow with our plug-and-play MFE.
            Built for scale, security, and seamless integration.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-95">
              Start Building
            </button>
            <button className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors">
              Live Demo <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { title: 'Encapsulated', desc: 'Runs in its own scope.' },
            { title: 'Tailwind v4', desc: 'CSS-first configuration.' },
            { title: 'Federated', desc: 'Built for monorepos.' }
          ].map((feature, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

}

export default About;
