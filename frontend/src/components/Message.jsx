import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import CodeBlock from './CodeBlock';

const Message = ({ role, content }) => {
  const isAi = role === 'ai';

  return (
    <div className={`message ${role}`}>
      <div className="avatar">
        {isAi ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="message-content">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <CodeBlock
                  language={match[1]}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Message;
