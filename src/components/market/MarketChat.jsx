import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CONDITION_STYLE = {
  'New with tags': { bg: 'rgba(74,124,89,0.1)', color: '#4A7C59' },
  'Like new':      { bg: 'rgba(74,124,89,0.1)', color: '#4A7C59' },
  'Good':          { bg: 'rgba(201,169,110,0.12)', color: '#b5893d' },
  'Fair':          { bg: 'rgba(168,168,168,0.15)', color: '#6B6B6B' },
};

export default function MarketChat({ item, preMessage, onBack }) {
  const [messages, setMessages] = useState([
    { id: 1, text: preMessage, from: 'me', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((p) => [...p, {
        id: Date.now(),
        text: `Hi! Yes, it's still available. Feel free to ask any questions!`,
        from: 'seller',
        time: new Date(),
      }]);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((p) => [...p, { id: Date.now(), text: input, from: 'me', time: new Date() }]);
    setInput('');
  };

  const condStyle = CONDITION_STYLE[item.condition] || CONDITION_STYLE['Good'];
  const sellerInitial = item.seller[0].toUpperCase();
  const fmt = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-0 bg-white z-60 flex flex-col"
      style={{ maxWidth: 448, margin: '0 auto' }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white" style={{ borderBottom: '1px solid #E8E6E1' }}>
        <button onClick={onBack}><ArrowLeft className="w-4 h-4" style={{ color: '#0F0F0F' }} /></button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-body font-semibold text-white text-sm" style={{ background: '#0F0F0F', fontFamily: 'DM Sans, sans-serif' }}>
          {sellerInitial}
        </div>
        <div className="flex-1">
          <p className="font-body font-semibold text-sm" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>{item.seller}</p>
          <p className="text-[10px] font-body" style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>Usually replies within an hour</p>
        </div>
      </div>

      {/* Item context card */}
      <div className="mx-4 mt-3 mb-2 p-3 flex items-center gap-3" style={{ background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '4px' }}>
        <div className="w-12 h-12 flex items-center justify-center text-2xl shrink-0" style={{ background: '#fff', border: '1px solid #E8E6E1', borderRadius: '2px' }}>
          {item.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-sm truncate" style={{ fontFamily: 'DM Sans, sans-serif', color: '#0F0F0F' }}>{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-body uppercase tracking-[0.04em] px-1.5 py-0.5" style={{ ...condStyle, borderRadius: '2px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{item.condition}</span>
            <span className="text-xs font-body font-semibold" style={{ color: '#C9A96E', fontFamily: 'DM Sans, sans-serif' }}>
              {item.listingType === 'swap' ? 'Swap' : `€${item.price}`}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[75%]">
              <div
                className="px-4 py-2.5 text-sm font-body leading-relaxed"
                style={msg.from === 'me'
                  ? { background: '#0F0F0F', color: '#fff', borderRadius: '4px 4px 0 4px', fontFamily: 'DM Sans, sans-serif' }
                  : { background: '#F5F4F1', border: '1px solid #E8E6E1', color: '#0F0F0F', borderRadius: '4px 4px 4px 0', fontFamily: 'DM Sans, sans-serif' }
                }
              >
                {msg.text}
              </div>
              <p className={`text-[9px] font-body mt-0.5 ${msg.from === 'me' ? 'text-right' : 'text-left'}`} style={{ color: '#A8A8A8', fontFamily: 'DM Sans, sans-serif' }}>
                {fmt(msg.time)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-8 pt-2 flex gap-2 items-center" style={{ borderTop: '1px solid #E8E6E1' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 h-11 px-4 text-sm font-body outline-none"
          style={{ fontFamily: 'DM Sans, sans-serif', background: '#F5F4F1', border: '1px solid #E8E6E1', borderRadius: '2px' }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-11 h-11 flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-90"
          style={{ background: '#0F0F0F', borderRadius: '2px' }}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </motion.div>
  );
}