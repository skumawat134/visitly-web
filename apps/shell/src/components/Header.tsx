
import { useAuthStore } from '@visitly/app-store';
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const user = useAuthStore();

  // const remoteUrl = import.meta.env.VITE_AUTH_MFE_REMOTE_URL;
  console.log("Remote URL is:", process.env.VITE_AUTH_MFE_REMOTE_URL);

  return (
    <header className="tw:sticky tw:top-0 tw:z-50 tw:w-full tw:border-b tw:border-white/5 tw:bg-[#0b0f1a]/80 tw:backdrop-blur-xl" data-testid="header">
      <div className="tw:container tw:mx-auto tw:flex tw:h-20 tw:items-center tw:justify-between tw:px-4 tw:sm:px-8">

        {/* Brand Section */}
        <div className="tw:flex tw:items-center tw:gap-3" data-testid="header-brand">
          <div className="tw:relative tw:flex tw:h-11 tw:w-11 tw:items-center tw:justify-center tw:rounded-xl tw:bg-gradient-to-tr tw:from-[#6366f1] tw:to-[#a855f7] tw:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <span className="tw:text-2xl tw:font-black tw:text-white">V</span>
            {/* Glow effect background */}
            <div className="tw:absolute tw:-z-10 tw:h-full tw:w-full tw:animate-pulse tw:rounded-xl tw:bg-indigo-500/20 tw:blur-lg"></div>
          </div>
          <div className="tw:flex tw:flex-col">
            <span className="tw:text-2xl tw:font-extrabold tw:tracking-tight tw:text-white">
              Visitly<span className="tw:text-indigo-500">.</span>
            </span>
            <span className="tw:text-[10px] tw:font-bold tw:uppercase tw:tracking-widest tw:text-slate-500">
              V4 Platform
            </span>
          </div>
        </div>

        {/* Center Navigation - V4 Style links */}
        <nav className="tw:hidden tw:items-center tw:gap-10 tw:lg:flex" data-testid="header-nav">
          {['Products', 'Solutions', 'Pricing', 'Docs'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="tw:text-sm tw:font-semibold tw:text-slate-400 tw:transition-all tw:duration-200 hover:tw:text-white hover:tw:translate-y-[-1px]"
              data-testid={`nav-link-${item.toLowerCase()}`}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="tw:flex tw:items-center tw:gap-5">
          <a
            href="/login"
            className="tw:hidden tw:text-sm tw:font-bold tw:text-slate-300 tw:transition-colors hover:tw:text-white tw:md:block"
            data-testid="header-signin-link"
          >
            Sign In
          </a>

          <button className="tw:group tw:relative tw:flex tw:items-center tw:gap-2 tw:rounded-full tw:bg-white tw:px-6 tw:py-2.5 tw:text-sm tw:font-bold tw:text-black tw:transition-all hover:tw:bg-slate-100 active:tw:scale-95" data-testid="header-get-started-button">
            Get Started
            <svg
              className="tw:h-4 tw:w-4 tw:transition-transform tw:duration-200 group-hover:tw:translate-x-1"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          {/* Mobile Toggle */}
          <button className="tw:flex tw:h-10 tw:w-10 tw:items-center tw:justify-center tw:rounded-lg tw:bg-slate-900 tw:text-white tw:lg:hidden" data-testid="header-mobile-toggle">
            <svg className="tw:h-6 tw:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
