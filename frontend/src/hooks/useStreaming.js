import { useState, useCallback } from 'react';

export const useStreaming = (url) => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (text, file = null) => {
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // Placeholder for AI response
    const aiMessageId = Date.now();
    setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', content: '' }]);

    try {
      const formData = new FormData();
      formData.append('text', text);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunkValue = decoder.decode(value, { stream: !done });
          accumulatedContent += chunkValue;

          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
          ));
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, content: 'Error: Failed to get response from assistant.' } : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [url]);

  return { messages, sendMessage, isStreaming, setMessages };
};
