import React, { useState, useEffect } from 'react';

const PRESET_NUMBERS = ['10', '20', '30', '40', '50', '60', '70', '80', '90', '99'];

export default function HiddenCaller({ 
  webrtc, 
  onClose 
}) {
  const {
    myId,
    isRegistered,
    onlineStatuses,
    activeCall,
    register,
    unregister,
    startCall,
    hangUp,
    errorMsg
  } = webrtc;

  const [selectedNum, setSelectedNum] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Call timer effect
  useEffect(() => {
    let interval;
    if (activeCall.status === 'connected') {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall.status]);

  const handleRegister = async () => {
    if (!selectedNum) return;
    setIsSubmitting(true);
    await register(selectedNum);
    setIsSubmitting(false);
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Get list of other 9 numbers
  const otherNumbers = PRESET_NUMBERS.filter(num => num !== myId);

  // Get status (online/offline) of other numbers
  const getNumberStatus = (num) => {
    const found = onlineStatuses.find(status => status.id === num);
    return found ? found.online : false;
  };

  return (
    <div className="overlay">
      {/* Header */}
      <div className="overlay-header">
        <h2 className="overlay-title" style={{ fontFamily: 'var(--font-digital)' }}>
          {activeCall.status !== 'idle' ? 'Secure Line Active' : 'Customer Support Portal'}
        </h2>
        {activeCall.status === 'idle' && (
          <button className="icon-btn" onClick={onClose} aria-label="Close support screen">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="overlay-content">
        
        {/* CASE 1: ACTIVE CALL OVERLAY */}
        {activeCall.status !== 'idle' && (
          <div className="call-screen">
            <div className={`call-avatar ${activeCall.status === 'ringing' ? 'ringing' : ''} ${activeCall.status === 'connected' ? 'active' : ''}`}>
              {activeCall.peerId}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div className="call-name">Line {activeCall.peerId}</div>
              <div className="call-status" style={{ marginTop: '10px' }}>
                {activeCall.status === 'calling' && 'Connecting...'}
                {activeCall.status === 'ringing' && 'Ringing...'}
                {activeCall.status === 'connected' && `Connected [${formatTimer(callDuration)}]`}
              </div>
            </div>

            <button className="hangup-btn" onClick={hangUp} aria-label="End call">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.1 16.5c-1.3-.2-2.5-.5-3.8-.9-1-.3-2 .1-2.7.9l-1.8 1.8c-2.9-1.5-5.3-3.9-6.8-6.8l1.8-1.8c.7-.7 1.1-1.8.8-2.7-.4-1.2-.7-2.5-.9-3.8-.2-1.1-1.1-1.9-2.2-1.9H3.3C2.1.3 1.1 1.3 1.3 2.5c.8 8.1 7.2 14.5 15.3 15.3 1.2.1 2.2-.9 2.2-2.1v-2.2c0-1.1-.8-2-1.9-2.2z" transform="rotate(135 12 12)"/>
              </svg>
            </button>
          </div>
        )}

        {/* CASE 2: REGISTRATION SCREEN */}
        {activeCall.status === 'idle' && !isRegistered && (
          <div className="caller-registration">
            <div className="registration-title">SELECT SECURE EXTENSION</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.4 }}>
              Choose a 2-digit support number. This will act as your caller identity.
            </p>

            {errorMsg && <div className="custom-alert">{errorMsg}</div>}

            <div className="number-selection-grid">
              {PRESET_NUMBERS.map(num => (
                <div
                  key={num}
                  className={`number-bubble ${selectedNum === num ? 'selected' : ''}`}
                  onClick={() => setSelectedNum(num)}
                >
                  {num}
                </div>
              ))}
            </div>

            <button
              className="glow-btn"
              style={{ marginTop: '20px', width: '100%', maxWidth: '240px' }}
              disabled={!selectedNum || isSubmitting}
              onClick={handleRegister}
            >
              {isSubmitting ? 'Verifying...' : 'Claim Extension'}
            </button>
          </div>
        )}

        {/* CASE 3: DASHBOARD SCREEN */}
        {activeCall.status === 'idle' && isRegistered && (
          <div className="caller-dashboard">
            <div className="self-info-badge">
              <div>
                <div className="badge-label">My Extension</div>
                <div className="badge-value">Line {myId}</div>
              </div>
              <button
                onClick={unregister}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-color)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-game)'
                }}
              >
                Release
              </button>
            </div>

            <div>
              <div className="dashboard-title">Active Lines</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Tap any online extension to start a secure audio call.
              </p>
            </div>

            <div className="contact-grid">
              {otherNumbers.map(num => {
                const online = getNumberStatus(num);
                return (
                  <div
                    key={num}
                    className={`contact-card ${!online ? 'offline' : ''}`}
                    onClick={() => {
                      if (online) {
                        startCall(num);
                      } else {
                        alert(`Line ${num} is offline. Open the app on another tab or device and select ${num} to connect.`);
                      }
                    }}
                  >
                    <div className="contact-number">{num}</div>
                    <div className="status-dot-container">
                      <span className={`status-dot ${online ? 'online' : ''}`}></span>
                      <span style={{ color: online ? 'var(--success-color)' : 'var(--text-muted)' }}>
                        {online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
