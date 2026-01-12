
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-blue-1000/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-blue-500/20">
            <span className="text-xl font-bold text-white">V</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Visitly<span className="text-blue-400">.</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Home</a>
          <a href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Features</a>
          <a href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Pricing</a>
          <a href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Docs</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <a className="hidden text-sm font-semibold text-white hover:opacity-80 sm:block" href='/auth/login'>
            Sign In
          </a>
          <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-95">
            Get Started
          </button>
          
          <button className="block md:hidden text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
