import React, { useState, useEffect } from 'react';
import './App.css';
import { useWebRTC } from './hooks/useWebRTC';
import SlidingPuzzle from './components/SlidingPuzzle';
import Settings from './components/Settings';
import HiddenCaller from './components/HiddenCaller';
import IncomingCall from './components/IncomingCall';

function App() {
  const webrtc = useWebRTC();
  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Power Button Detection Simulation:
  // Detects when the user locks their screen or hides the browser tab during a call,
  // and instantly hangs up the WebRTC voice channel.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && webrtc.activeCall.status !== 'idle') {
        console.log('Screen locked / tab hidden detected during call. Hanging up...');
        webrtc.hangUp();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [webrtc.activeCall.status, webrtc.hangUp]);

  // Automatically open the support caller panel when a call transitions
  // to ringing, calling, or connected so that the call screen shows up.
  useEffect(() => {
    if (webrtc.activeCall.status !== 'idle') {
      setShowSupport(true);
    }
  }, [webrtc.activeCall.status]);

  return (
    <>
      {/* 1. Header Area */}
      <header className="game-header">
        <h1 className="game-title">Number Slide</h1>
        
        {/* Settings gear button */}
        <button 
          className="icon-btn" 
          onClick={() => setShowSettings(true)}
          aria-label="Open settings"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* 2. Main Game View */}
      <main className="app-content">
        <SlidingPuzzle />
      </main>

      {/* 3. Global Notification Popups */}
      {/* Show incoming call notification, visible on top of any screen */}
      <IncomingCall
        incomingCall={webrtc.incomingCall}
        onAccept={webrtc.acceptCall}
        onDeny={webrtc.denyCall}
      />

      {/* 4. Settings Overlay */}
      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)} 
          onOpenSupport={() => {
            setShowSettings(false);
            setShowSupport(true);
          }}
        />
      )}

      {/* 5. Hidden Calling Portal Overlay */}
      {showSupport && (
        <HiddenCaller 
          webrtc={webrtc} 
          onClose={() => setShowSupport(false)} 
        />
      )}
    </>
  );
}

export default App;
