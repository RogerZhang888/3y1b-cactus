import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import axios from 'axios';
import './App.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  model_used?: string;
};

type ChatResponse = {
  session_id: string;
  reply: string;
  model_used: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedSession = localStorage.getItem('session_id');
    if (storedSession) setSessionId(storedSession);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post<ChatResponse>('http://localhost:3000/chat', {
        session_id: sessionId,
        message: input,
      });

      const { reply, session_id, model_used } = response.data;

      if (!sessionId) {
        localStorage.setItem('session_id', session_id);
        setSessionId(session_id);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: reply,
        model_used,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="container">
      <h1>Adaptive Router Demo</h1>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
            {msg.role === 'assistant' && <small>Model: {msg.model_used}</small>}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default App;