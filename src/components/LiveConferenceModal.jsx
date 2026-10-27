import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatars';

export default function LiveConferenceModal({ session, onClose }) {
  const { user } = useAuth();
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);

  // Timer for session
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebRTC User Media initialization
  useEffect(() => {
    let stream = null;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(s => {
        stream = s;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = s;
        }
      })
      .catch(() => {
        // Fallback gracefully if camera permissions are blocked
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleSendReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setReactions(prev => [...prev, { id, emoji, sender: user?.name?.split(' ')[0] || 'You' }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2500);
  };

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 1300, padding: 0 }}>
      <div style={{
        background: '#0f172a',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Reactions Layer */}
        <div style={{ position: 'absolute', bottom: '100px', right: '40px', display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none', zIndex: 100 }}>
          {reactions.map(r => (
            <div key={r.id} style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '0.4rem 0.85rem',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              animation: 'bounce 0.5s ease'
            }}>
              <span>{r.emoji}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.sender}</span>
            </div>
          ))}
        </div>

        {/* Top Meeting Header */}
        <div style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                Live Peer Session: {session?.topic || 'Skill Exchange Session'}
              </h3>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Mentor: {session?.tutorName || 'Rishitha'} • Room: {session?.roomId || 'skillswap-main-meet'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
              ⏱️ {formatCallTime(callDuration)}
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              End Call
            </button>
          </div>
        </div>

        {/* Video Tiles Grid */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}>
          {/* Peer / Mentor Video Tile */}
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={getAvatarUrl(session?.tutorId || 'rishitha')}
                alt="Mentor"
                style={{ width: '96px', height: '96px', borderRadius: '50%', border: '4px solid #3b82f6', marginBottom: '0.75rem' }}
              />
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{session?.tutorName || 'Rishitha'}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.2rem' }}>
                <i className="fa-solid fa-microphone" style={{ marginRight: '0.3rem' }}></i>
                Connected (WebRTC High-Def Audio)
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem' }}>
              {session?.tutorName || 'Rishitha'} (Mentor)
            </div>
          </div>

          {/* Local User Video Tile */}
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {camEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={getAvatarUrl(user?.id || 'sri')}
                  alt="You"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #10b981', marginBottom: '0.5rem' }}
                />
                <div style={{ fontSize: '1rem', fontWeight: '700' }}>{user?.name || 'You'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Camera Paused</div>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem' }}>
              {user?.name?.split(' ')[0] || 'You'} (Learner)
            </div>
          </div>
        </div>

        {/* Bottom Meeting Control Bar */}
        <div style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Mic Button */}
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: 'none',
              background: micEnabled ? '#334155' : '#ef4444',
              color: '#ffffff',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            <i className={`fa-solid ${micEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
          </button>

          {/* Camera Button */}
          <button
            onClick={() => setCamEnabled(!camEnabled)}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: 'none',
              background: camEnabled ? '#334155' : '#ef4444',
              color: '#ffffff',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={camEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            <i className={`fa-solid ${camEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
          </button>

          {/* Screen Share Button */}
          <button
            onClick={() => setScreenSharing(!screenSharing)}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: 'none',
              background: screenSharing ? '#10b981' : '#334155',
              color: '#ffffff',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={screenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <i className="fa-solid fa-arrow-up-from-bracket"></i>
          </button>

          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }}></div>

          {/* Floating Emoji Reaction Buttons */}
          {['👏', '🔥', '💡', '❤️'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
