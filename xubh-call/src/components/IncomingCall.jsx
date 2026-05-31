import React from 'react';

export default function IncomingCall({ 
  incomingCall, 
  onAccept, 
  onDeny 
}) {
  if (!incomingCall) return null;

  return (
    <div className="incoming-overlay">
      <div className="incoming-header">
        <div className="incoming-avatar">
          {incomingCall.peerId}
        </div>
        <div className="incoming-info">
          <div className="incoming-title">Customer Care Alert</div>
          <div className="incoming-caller">Line {incomingCall.peerId} is calling...</div>
        </div>
      </div>
      
      <div className="incoming-actions">
        <button 
          className="incoming-btn accept" 
          onClick={onAccept}
          aria-label="Accept customer care call"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.554-5.15-3.88-6.704-6.704l1.293-.97c.362-.271.528-.733.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          Accept
        </button>
        
        <button 
          className="incoming-btn deny" 
          onClick={onDeny}
          aria-label="Decline customer care call"
        >
          Deny
        </button>
      </div>
    </div>
  );
}
