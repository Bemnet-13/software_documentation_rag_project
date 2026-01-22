import React, { useState } from 'react';
import { Plus, Globe, FileText, Trash2, Upload, Link as LinkIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SourcesTab = ({ sources, onAddUrl, onUploadFile, onDeleteSource }) => {
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmitUrl = (e) => {
    e.preventDefault();
    if (newUrl) {
      onAddUrl(newUrl);
      setNewUrl('');
      setShowAddUrl(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUploadFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="sources-container">
      <header className="sources-header">
        <div>
          <h2>Knowledge Base</h2>
          <p>Manage the documentation and files the agent uses for answers.</p>
        </div>
        <div className="sources-stats">
          <div className="stat-item">
            <span className="stat-value">{sources.length}</span>
            <span className="stat-label">Sources</span>
          </div>
        </div>
      </header>

      <div className="sources-actions">
        <button 
          className="add-source-btn"
          onClick={() => setShowAddUrl(!showAddUrl)}
        >
          <Globe size={18} />
          <span>Add Website</span>
        </button>
        <label className="add-file-label">
          <Upload size={18} />
          <span>Upload File</span>
          <input type="file" onChange={handleFileSelect} hidden accept=".txt,.md,.pdf" />
        </label>
      </div>

      <AnimatePresence>
        {showAddUrl && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="url-form"
            onSubmit={handleSubmitUrl}
          >
            <input 
              type="url" 
              placeholder="https://docs.example.com/..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={!newUrl}>
              <Check size={18} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div 
        className={`sources-list ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="drop-overlay">
            <Upload size={48} />
            <p>Drop file to index</p>
          </div>
        )}

        {sources.length === 0 ? (
          <div className="empty-sources">
            <div className="empty-icon">
              <LinkIcon size={32} />
            </div>
            <h3>No sources indexed</h3>
            <p>Add URLs or upload files to train the agent.</p>
          </div>
        ) : (
          sources.map((source, idx) => (
            <motion.div 
              key={idx}
              className="source-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="source-icon">
                {source.type === 'url' ? <Globe size={20} /> : <FileText size={20} />}
              </div>
              <div className="source-info">
                <h4>{source.title}</h4>
                <a href={source.url || '#'} target="_blank" rel="noopener noreferrer">
                  {source.source}
                </a>
              </div>
              <button 
                className="delete-source-btn"
                onClick={() => onDeleteSource(source.id)}
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SourcesTab;
