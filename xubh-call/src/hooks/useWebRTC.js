import { useState, useEffect, useRef } from 'react';

// For simplicity, we detect API URL dynamically based on where client runs.
// Default to localhost:5000 if running locally, otherwise use current origin (for Vercel deployment)
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return 'https://xubh-call-api.vercel.app';
  }
  return '';
};

const API_URL = getApiUrl();

export function useWebRTC() {
  const [myId, setMyId] = useState(localStorage.getItem('support_id') || '');
  const [isRegistered, setIsRegistered] = useState(false);
  const [onlineStatuses, setOnlineStatuses] = useState([]);
  const [activeCall, setActiveCall] = useState({ peerId: null, status: 'idle', isIncoming: false });
  const [incomingCall, setIncomingCall] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingIceCandidates = useRef([]);

  // Create persistent audio element for background calling
  useEffect(() => {
    const audio = document.createElement('audio');
    audio.autoplay = true;
    // Allow playsinline for iOS background playback
    audio.setAttribute('playsinline', 'true');
    audio.style.display = 'none';
    document.body.appendChild(audio);
    remoteAudioRef.current = audio;

    return () => {
      if (remoteAudioRef.current) {
        document.body.removeChild(remoteAudioRef.current);
      }
    };
  }, []);

  // 1. Fetch online statuses of all 10 numbers
  const checkStatuses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/status`);
      const data = await res.json();
      if (data.success) {
        setOnlineStatuses(data.statuses);
      }
    } catch (err) {
      console.error('Error checking user statuses:', err);
    }
  };

  // Check online statuses on load and periodically
  useEffect(() => {
    checkStatuses();
    const interval = setInterval(checkStatuses, 4000);
    return () => clearInterval(interval);
  }, []);

  // 2. Register user to a 2-digit number
  const register = async (id) => {
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setMyId(id);
        localStorage.setItem('support_id', id);
        setIsRegistered(true);
        checkStatuses();
        return true;
      } else {
        setErrorMsg(data.message || 'Number already taken. Select another.');
        return false;
      }
    } catch (err) {
      setErrorMsg('Failed to connect to signaling server.');
      console.error(err);
      return false;
    }
  };

  // Re-verify registration on mount if stored in localStorage
  useEffect(() => {
    if (myId) {
      register(myId);
    }
  }, []);

  // Send a signaling message
  const sendSignal = async (to, type, data) => {
    if (!myId) return;
    try {
      await fetch(`${API_URL}/api/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: myId, to, type, data })
      });
    } catch (err) {
      console.error('Failed to send signal:', err);
    }
  };

  // 3. Heartbeat and Polling Loop when registered
  useEffect(() => {
    if (!myId || !isRegistered) return;

    // Heartbeat every 5s
    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`${API_URL}/api/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: myId })
        });
      } catch (err) {
        console.error('Heartbeat failed:', err);
      }
    }, 5000);

    // Poll for signals every 1.5s
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/poll?id=${myId}`);
        const data = await res.json();
        if (data.success && data.signals && data.signals.length > 0) {
          for (const signal of data.signals) {
            await handleIncomingSignal(signal);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1500);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
    };
  }, [myId, isRegistered, activeCall, incomingCall]);

  // Clean up WebRTC peer connection
  const closeConnection = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    pendingIceCandidates.current = [];
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  // 4. Hang up active call
  const hangUp = async () => {
    const peerId = activeCall.peerId || (incomingCall ? incomingCall.peerId : null);
    if (peerId) {
      await sendSignal(peerId, 'hangup', null);
    }
    closeConnection();
    setActiveCall({ peerId: null, status: 'idle', isIncoming: false });
    setIncomingCall(null);
  };

  // Setup WebRTC peer connection
  const setupPeerConnection = async (peerId) => {
    closeConnection();

    // Request audio only (microphone)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local audio tracks to the peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(peerId, 'candidate', event.candidate);
      }
    };

    // Receive Remote Audio Track
    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // 5. Initiate call to another 2-digit number
  const startCall = async (peerId) => {
    if (!myId) return;
    try {
      setActiveCall({ peerId, status: 'calling', isIncoming: false });

      const pc = await setupPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendSignal(peerId, 'offer', offer);
      
      // Setup connection timeout if they don't answer in 30s
      setTimeout(() => {
        if (pcRef.current && pcRef.current.connectionState !== 'connected' && activeCall.status === 'calling') {
          hangUp();
        }
      }, 30000);

    } catch (err) {
      console.error('Error starting call:', err);
      hangUp();
    }
  };

  // 6. Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;
    const { peerId, offer } = incomingCall;

    try {
      setActiveCall({ peerId, status: 'connected', isIncoming: true });
      setIncomingCall(null);

      const pc = await setupPeerConnection(peerId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendSignal(peerId, 'answer', answer);

      // Process any cached ICE candidates
      while (pendingIceCandidates.current.length > 0) {
        const candidate = pendingIceCandidates.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }

    } catch (err) {
      console.error('Error accepting call:', err);
      hangUp();
    }
  };

  // 7. Deny incoming call
  const denyCall = async () => {
    if (!incomingCall) return;
    await sendSignal(incomingCall.peerId, 'hangup', null);
    setIncomingCall(null);
    setActiveCall({ peerId: null, status: 'idle', isIncoming: false });
  };

  // 8. Handle signaling messages from polling
  const handleIncomingSignal = async (signal) => {
    const { from, type, data } = signal;

    switch (type) {
      case 'offer':
        // Only accept call if we are idle
        if (activeCall.status === 'idle' && !incomingCall) {
          setIncomingCall({ peerId: from, offer: data });
          setActiveCall({ peerId: from, status: 'ringing', isIncoming: true });
        } else {
          // Busy: decline call automatically
          await fetch(`${API_URL}/api/signal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: myId, to: from, type: 'hangup', data: null })
          });
        }
        break;

      case 'answer':
        if (pcRef.current && activeCall.peerId === from) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
          setActiveCall(prev => ({ ...prev, status: 'connected' }));
        }
        break;

      case 'candidate':
        if (activeCall.peerId === from) {
          if (pcRef.current && pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data));
          } else {
            // Cache candidates until remote description is set
            pendingIceCandidates.current.push(data);
          }
        }
        break;

      case 'hangup':
        if (activeCall.peerId === from || (incomingCall && incomingCall.peerId === from)) {
          closeConnection();
          setActiveCall({ peerId: null, status: 'idle', isIncoming: false });
          setIncomingCall(null);
        }
        break;

      default:
        break;
    }
  };

  // Unregister user (Logout)
  const unregister = async () => {
    if (!myId) return;
    try {
      await fetch(`${API_URL}/api/unregister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: myId })
      });
      localStorage.removeItem('support_id');
      setMyId('');
      setIsRegistered(false);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return {
    myId,
    isRegistered,
    onlineStatuses,
    activeCall,
    incomingCall,
    errorMsg,
    register,
    unregister,
    startCall,
    acceptCall,
    denyCall,
    hangUp,
    checkStatuses
  };
}
