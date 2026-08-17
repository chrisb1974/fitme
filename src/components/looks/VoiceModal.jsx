import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n.jsx';

const langMap = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR',
  de: 'de-DE', it: 'it-IT', pt: 'pt-PT',
};

const voiceHints = {
  en: 'Say something like "casual dinner with friends" or "job interview"',
  es: 'Di algo como "cena informal con amigos" o "entrevista de trabajo"',
  fr: 'Dis quelque chose comme "dîner décontracté entre amis" ou "entretien d\'embauche"',
  de: 'Sag etwas wie "lockeres Abendessen mit Freunden" oder "Vorstellungsgespräch"',
  it: 'Di\' qualcosa come "cena informale con amici" o "colloquio di lavoro"',
  pt: 'Diga algo como "jantar casual com amigos" ou "entrevista de emprego"',
};

const listeningText = {
  en: '● Listening…', es: '● Escuchando…', fr: "● J'écoute…",
  de: '● Höre zu…',  it: '● In ascolto…', pt: '● A ouvir…',
};

const tapToSpeakText = {
  en: 'Tap to speak', es: 'Toca para hablar', fr: 'Appuie pour parler',
  de: 'Tippen zum Sprechen', it: 'Tocca per parlare', pt: 'Toca para falar',
};

export default function VoiceModal({ onClose, onConfirm }) {
  const { lang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  // Keep ref in sync so onend can read latest value
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const startListening = () => {
    setVoiceError('');
    setTranscript('');
    transcriptRef.current = '';

    // Chrome on iOS does not support Web Speech API — only Safari on iOS does
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isChrome = /CriOS/i.test(navigator.userAgent);
    if (isIOS && isChrome) {
      setVoiceError('Voice input is not supported in Chrome on iPhone. Please use Safari instead.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input not supported on this browser. Try Safari on iPhone.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = langMap[lang] || 'en-US';
    recognition.continuous = false;
    // interimResults causes issues on iOS Safari — keep it off on iOS
    recognition.interimResults = !isIOS;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const current = Array.from(event.results).map((r) => r[0].transcript).join('');
      setTranscript(current);
      transcriptRef.current = current;
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error === 'not-allowed') {
        setVoiceError('Microphone access denied. Please allow it in your browser settings.');
      } else {
        setVoiceError('Could not capture voice. Please try again.');
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleConfirm = () => {
    if (transcript) {
      onConfirm(transcript);
    }
    onClose();
    setTranscript('');
  };

  const handleClose = () => {
    stopListening();
    onClose();
    setTranscript('');
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); }
          50% { box-shadow: 0 0 0 20px rgba(255, 59, 48, 0); }
        }
      `}</style>

      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
        onClick={handleClose}
      >
        <div
          style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '32px 28px 48px', width: '100%', maxWidth: 430, margin: '0 auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '0 auto 28px' }} />

          <h3 style={{ fontWeight: 900, fontSize: 22, margin: '0 0 8px', textAlign: 'center', fontFamily: 'Playfair Display, serif' }}>
            Speak your vibe
          </h3>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', margin: '0 0 36px', fontFamily: 'DM Sans, sans-serif' }}>
            {voiceHints[lang] || voiceHints.en}
          </p>

          {/* Mic button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: isListening ? '#ff3b30' : '#000',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
                boxShadow: isListening ? '0 0 0 16px rgba(255,59,48,0.15)' : '0 8px 24px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                animation: isListening ? 'pulse 1.5s infinite' : 'none',
              }}
            >
              🎤
            </button>
            <p style={{ color: isListening ? '#ff3b30' : '#888', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
              {isListening ? (listeningText[lang] || listeningText.en) : (tapToSpeakText[lang] || tapToSpeakText.en)}
            </p>
          </div>

          {/* Live transcript */}
          {transcript && (
            <div style={{ background: '#f5f5f5', borderRadius: 16, padding: '14px 18px', marginBottom: 20, textAlign: 'center' }}>
              <p style={{ color: '#000', fontSize: 15, fontWeight: 600, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>"{transcript}"</p>
            </div>
          )}

          {/* Error */}
          {voiceError && (
            <p style={{ color: '#ff3b30', fontSize: 13, textAlign: 'center', marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>{voiceError}</p>
          )}

          {/* Confirm button */}
          {transcript && !isListening && (
            <button
              onClick={handleConfirm}
              style={{ width: '100%', background: '#000', color: '#fff', border: 'none', borderRadius: 20, padding: '16px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginBottom: 0 }}
            >
              Use this → "{transcript.slice(0, 30)}{transcript.length > 30 ? '…' : ''}"
            </button>
          )}

          {/* Cancel */}
          <button
            onClick={handleClose}
            style={{ width: '100%', background: 'none', border: 'none', color: '#aaa', fontSize: 14, cursor: 'pointer', marginTop: 12, padding: 8, fontFamily: 'DM Sans, sans-serif' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}