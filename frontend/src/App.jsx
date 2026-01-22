import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Sun, 
  Moon, 
  MessageSquare, 
  Settings,
  X,
  Code,
  BookOpen
} from 'lucide-react';
import { useStreaming } from './hooks/useStreaming';
import Message from './components/Message';
import SnippetsSidebar from './components/SnippetsSidebar';
import SourcesTab from './components/SourcesTab'; 
import { AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'sources'
  
  // Chat State
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSnippets, setShowSnippets] = useState(true);
  const [allSnippets, setAllSnippets] = useState([]);
  
  // Sources State
  const [sources, setSources] = useState([]);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const { messages, sendMessage, isStreaming } = useStreaming('http://localhost:8001/chat');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch sources on mount
  useEffect(() => {
    fetch('http://localhost:8001/sources')
      .then(res => res.json())
      .then(data => setSources(data))
      .catch(err => console.error("Failed to fetch sources:", err));
  }, []);

  // Extract code snippets
  useEffect(() => {
    const snippets = [];
    messages.forEach(msg => {
      if (msg.role === 'ai') {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        while ((match = codeBlockRegex.exec(msg.content)) !== null) {
          snippets.push({
            language: match[1] || 'text',
            code: match[2].trim()
          });
        }
      }
    });
    setAllSnippets(snippets);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() && !selectedFile) return;
    sendMessage(inputText, selectedFile);
    setInputText('');
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Source Handlers
  const handleAddUrl = async (url) => {
    const newSource = { 
      id: Date.now(), 
      type: 'url', 
      title: url.replace(/^https?:\/\//, ''), 
      source: url, 
      url: url 
    };
    setSources([...sources, newSource]);
    
    try {
      const response = await fetch('http://localhost:8001/sources/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to index URL');
      }
    } catch (e) {
      alert(`Error adding source: ${e.message}`);
      setSources(prev => prev.filter(s => s.id !== newSource.id));
    }
  };

  const handleUploadSource = async (file) => {
    const newSource = { 
      id: Date.now(), 
      type: 'file', 
      title: file.name, 
      source: file.name 
    };
    setSources([...sources, newSource]);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8001/sources/file', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to upload source');
      }
    } catch (e) {
      alert(`Error uploading file: ${e.message}`);
      setSources(prev => prev.filter(s => s.id !== newSource.id));
    }
  };

  const handleDeleteSource = (id) => {
    setSources(sources.filter(s => s.id !== id));
    // Note: Backend delete not implemented yet
  };

  return (
    <div className="app-container">
      {/* 1. Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Bot size={20} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Doc Agent</h2>
        </div>
        
        <nav style={{ flex: 1 }}>
          <button 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={18} />
            <span>Chat</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            <BookOpen size={18} />
            <span>Sources</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      {activeTab === 'chat' ? (
        <>
          <main className="chat-main" style={{ marginRight: showSnippets ? '0' : '0' }}>
            <header className="chat-header">
              <div>
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ACTIVE SESSION</h3>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Documentation Assistant</h2>
              </div>
              {!showSnippets && (
                <button 
                  onClick={() => setShowSnippets(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <Code size={18} />
                  <span style={{ fontSize: '0.85rem' }}>Snippets</span>
                </button>
              )}
            </header>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  opacity: 0.6
                }}>
                  <Bot size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>Initialize query sequence...</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <Message key={idx} role={msg.role} content={msg.content} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              {selectedFile && (
                <div style={{ 
                  maxWidth: '800px', 
                  margin: '0 auto 0.5rem', 
                  padding: '0.5rem 1rem', 
                  background: 'var(--bg-tertiary)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Paperclip size={14} />
                    <span>{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)}><X size={14} /></button>
                </div>
              )}
              
              <div className="input-container">
                <button className="action-btn" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
                
                <textarea 
                  className="chat-input"
                  placeholder="Ask anything about the documentation..."
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                
                <button 
                  className="action-btn send-btn" 
                  disabled={isStreaming || (!inputText.trim() && !selectedFile)}
                  onClick={handleSend}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </main>

          {/* 3. Snippets Sidebar */}
          <AnimatePresence>
            {showSnippets && (
              <SnippetsSidebar 
                snippets={allSnippets} 
                onClose={() => setShowSnippets(false)} 
              />
            )}
          </AnimatePresence>
        </>
      ) : (
        <SourcesTab 
          sources={sources}
          onAddUrl={handleAddUrl}
          onUploadFile={handleUploadSource}
          onDeleteSource={handleDeleteSource}
        />
      )}
    </div>
  );
}

// Helper Bot icon Component
const Bot = ({ size, style, strokeWidth }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth || 2} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

export default App;
