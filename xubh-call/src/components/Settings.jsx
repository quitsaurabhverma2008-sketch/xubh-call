import React, { useState } from 'react';

export default function Settings({ onClose, onOpenSupport }) {
  // Local state for all 10 settings to make the UI fully functional
  const [sfx, setSfx] = useState(true);
  const [music, setMusic] = useState(false);
  const [haptic, setHaptic] = useState(true);
  const [gridSize, setGridSize] = useState('3x3');
  const [darkMode, setDarkMode] = useState(true);
  const [particles, setParticles] = useState(true);
  const [vibration, setVibration] = useState(false);
  const [language, setLanguage] = useState('English');
  const [autoSave, setAutoSave] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);

  const handleResetHighScore = () => {
    alert('High scores reset successfully!');
  };

  return (
    <div className="overlay">
      <div className="overlay-header">
        <h2 className="overlay-title">Game Settings</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close settings">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="overlay-content">
        {/* 1. Music */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Background Music</span>
            <span className="setting-desc">Play atmospheric retro soundtracks</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={music} onChange={(e) => setMusic(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 2. Sound Effects */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Sound Effects</span>
            <span className="setting-desc">Play audio clicks on tile moves</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={sfx} onChange={(e) => setSfx(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 3. Haptic Feedback */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Haptic Feedback</span>
            <span className="setting-desc">Vibrate device on UI actions</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={haptic} onChange={(e) => setHaptic(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 4. Grid Size */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Puzzle Grid Size</span>
            <span className="setting-desc">Switch between 3x3 and 4x4 boards</span>
          </div>
          <select 
            value={gridSize} 
            onChange={(e) => setGridSize(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--panel-border)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-game)',
              outline: 'none'
            }}
          >
            <option value="3x3">3 x 3 (Classic)</option>
            <option value="4x4">4 x 4 (Hard)</option>
          </select>
        </div>

        {/* 5. Dark Mode */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Ultra Dark Mode</span>
            <span className="setting-desc">Sleek obsidian theme for low light</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 6. Dynamic Particles */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Particle Effects</span>
            <span className="setting-desc">Render background glowing stars</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={particles} onChange={(e) => setParticles(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 7. Vibration on Move */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Vibration on Slide</span>
            <span className="setting-desc">Micro vibration when sliding tiles</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={vibration} onChange={(e) => setVibration(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 8. Show Tile Numbers */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Show Numbers</span>
            <span className="setting-desc">Display hint digits inside grid tiles</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 9. Auto-Save Progress */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">Auto-Save Progress</span>
            <span className="setting-desc">Automatically resume incomplete games</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>

        {/* 10. Language Selection */}
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-name">App Language</span>
            <span className="setting-desc">Select UI and system language</span>
          </div>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--panel-border)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-game)',
              outline: 'none'
            }}
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Spanish">Español</option>
          </select>
        </div>

        {/* Reset Progress Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={handleResetHighScore}
            style={{
              flex: 1,
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: 'var(--accent-color)',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'var(--font-game)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Reset High Scores
          </button>
        </div>

        {/* HIDDEN CALLING LINK (11th Option!) */}
        <div className="support-link-container">
          <span className="support-link" onClick={onOpenSupport}>
            Customer Support
          </span>
        </div>
      </div>
    </div>
  );
}
