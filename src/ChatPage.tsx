import React, { useEffect, useRef, useState } from 'react';
import { TextAreaBox, Detail, type Details } from 'react-textarea-enhanced';
import 'react-textarea-enhanced/dist/index.css';
// import TextAreaBox from './components/TextAreaBox';
// import { Detail, type Details } from './components/types';
// import './style/index.css';
import { Link } from 'react-router-dom';

type ChatMessage = {
  id: string;
  text: string;
  content: React.ReactNode;
  timestamp: number;
  sender: 'me' | 'other';
};

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composeDetails, setComposeDetails] = useState<Details>(new Detail());
  const [composerKey, setComposerKey] = useState<number>(0);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  function sendMessage() {
    const text = composeDetails.text.trim();
    if (!text || composeDetails.charsLeft < 0) return;

    const newMsg: ChatMessage = {
      id: `${Date.now()}`,
      text,
      content: <>{composeDetails.highlightedText}</>,
      timestamp: Date.now(),
      sender: 'me',
    };
    setMessages(prev => [...prev, newMsg]);

    // Clear composer: reset details and remount TextAreaBox
    composeDetails.clearText();
    setComposerKey(k => k + 1);

    // Demo: simulate a reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-r`,
          text: 'Got it! Thanks for the message. 📨',
          content: <>Got it! Thanks for the message. 📨</>,
          timestamp: Date.now(),
          sender: 'other',
        },
      ]);
    }, 600);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      return;
    }
    // Also support Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.value);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="chat-page" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: '1rem' }}>
        <div className='navigation'>
          <Link to="/">Home</Link>
          <Link to="/chat">Chat</Link>
        </div>
      <h2>Chat</h2>
      <div ref={messagesRef} className="messages" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: 8, border: '1px solid #333', borderRadius: 8, background: '#0b1220' }}>
        {messages.length === 0 && (
          <div style={{ opacity: 0.7 }}>No messages yet. Press Enter to send, Shift+Enter for newline.</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`} style={{ alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start', background: msg.sender === 'me' ? '#1f2937' : '#111827', color: 'white', padding: '8px 12px', borderRadius: 12, maxWidth: '80%' }}>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div className="composer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TextAreaBox
          key={composerKey}
          charLimit={10000}
          minHeight={16}
          getDetails={setComposeDetails}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Write a message..."
          fontFamily="Courier New, Courier, monospace"
          highlightColor="oklch(0.84 0.21 108.12)"
          style={{ color: 'white !important', caretColor: 'white', padding: '10px', background: '#111827' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="tweet-button"
            onClick={sendMessage}
            disabled={composeDetails.text.length === 0 || composeDetails.charsLeft < 0}
          >
            Send
          </button>
          <div className={`char-counter ${composeDetails.charsLeft <= 20 ? 'warning' : ''} ${composeDetails.charsLeft <= 0 ? 'error' : ''}`}>
            {composeDetails.charsLeft}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;


