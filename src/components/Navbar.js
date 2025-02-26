import React, { useState } from 'react';
import { RiMenu3Line, RiCloseFill } from '@remixicon/react'; 
import './Navbar.css';

const Navbar = ({ activeTab, onTabChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = (tab) => {
    onTabChange(tab);
    setMenuOpen(false); 
  };

  return (
    <nav className="navbar fixed top-0 left-0 w-full z-50">
      <div className="navbar-container flex justify-between items-center max-w-6xl mx-auto md:my-2 bg-stone-950/30 p-4 md:rounded-xl backdrop-blur-lg">
        {/* Navbar Logo */}
        <div className="navbar-logo text-white font-semibold text-lg uppercase">
          <a href="/">ScrAIbe</a>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8">
          <button
            className={`navbar-link ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => handleLinkClick('audio')}
          >
            Audio Transcription
          </button>
          <button
            className={`navbar-link ${activeTab === 'pdf' ? 'active' : ''}`}
            onClick={() => handleLinkClick('pdf')}
          >
            PDF Text Extraction
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <RiCloseFill className="w-6 h-6" />
            ) : (
              <RiMenu3Line className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      {menuOpen && (
        <div className="mobile-menu md:hidden p-2 bg-stone-950/30 backdrop-blur-lg rounded-xl flex flex-col space-y-4 max-w-6xl mx-auto">
          <button
            className={`navbar-link ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => handleLinkClick('audio')}
          >
            Audio Transcription
          </button>
          <button
            className={`navbar-link ${activeTab === 'pdf' ? 'active' : ''}`}
            onClick={() => handleLinkClick('pdf')}
          >
            PDF Text Extraction
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
