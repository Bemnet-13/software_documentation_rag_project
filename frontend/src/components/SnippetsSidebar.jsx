import React, { useState } from 'react';
import { Copy, Check, Code, X } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';

const SnippetsSidebar = ({ snippets, onClose }) => {
  return (
    <motion.aside 
      className="snippets-sidebar"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Code size={20} color="var(--accent)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Code Snippets</h3>
        </div>
        <button className="action-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="snippets-list">
        {snippets.length === 0 ? (
          <div className="empty-state">
            <Code size={40} strokeWidth={1} style={{ opacity: 0.3 }} />
            <p>Generated code snippets will appear here for quick access.</p>
          </div>
        ) : (
          snippets.map((snippet, idx) => (
            <SnippetItem key={idx} snippet={snippet} index={idx} />
          ))
        )}
      </div>
    </motion.aside>
  );
};

const SnippetItem = ({ snippet, index }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className="snippet-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="snippet-header">
        <span className="lang-tag">{snippet.language}</span>
        <button className="copy-btn mini" onClick={copyToClipboard}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      <div className="snippet-preview">
        <SyntaxHighlighter
          language={snippet.language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '0.5rem',
            fontSize: '0.7rem',
            backgroundColor: 'transparent',
            borderRadius: '0 0 8px 8px'
          }}
          wrapLines={true}
          lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
        >
          {snippet.code.slice(0, 150) + (snippet.code.length > 150 ? '...' : '')}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
};

export default SnippetsSidebar;
