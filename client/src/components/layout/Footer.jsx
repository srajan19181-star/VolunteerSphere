import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';

// Social icon placeholders (Lucide v3 renames Twitter/Github/Linkedin)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065a2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);


const Footer = () => (
  <footer className="relative border-t border-white/5 bg-secondary/50 backdrop-blur-sm mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-lg font-bold text-white">VolunteerSphere</span>
          </div>
          <p className="text-white/50 text-sm font-body leading-relaxed max-w-xs">
            Connecting passionate volunteers with meaningful opportunities to create lasting change across communities worldwide.
          </p>
          <div className="flex items-center gap-3">
            {[TwitterIcon, GithubIcon, LinkedinIcon].map((Icon, i) => (
              <button key={i} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-accent-purple/30 transition-all">
                <Icon />
              </button>
            ))}
          </div>

        </div>

        {/* Links */}
        <div>
          <h4 className="text-sm font-semibold text-white/80 mb-4 font-display uppercase tracking-wider">Platform</h4>
          <ul className="space-y-2">
            {['Browse Events', 'Register', 'Dashboard', 'Admin'].map((link) => (
              <li key={link}>
                <Link to="/" className="text-sm text-white/40 hover:text-white/80 transition-colors font-body">{link}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white/80 mb-4 font-display uppercase tracking-wider">Company</h4>
          <ul className="space-y-2">
            {['About', 'Privacy', 'Terms', 'Contact'].map((link) => (
              <li key={link}>
                <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors font-body">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/30 font-body">
          © {new Date().getFullYear()} VolunteerSphere. All rights reserved.
        </p>
        <p className="text-xs text-white/30 font-body flex items-center gap-1">
          Made with <Heart size={12} className="text-accent-pink fill-current" /> for communities worldwide
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
