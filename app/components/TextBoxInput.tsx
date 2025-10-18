'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TextBoxInput() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async () => {
    if (input.trim()) {
      const userMessage = input.trim();
      setInput('');
      setLoading(true);

      // Add user message to chat
      const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
      setMessages(newMessages);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            history: messages,
          }),
        });

        if (!res.ok) {
          setMessages([...newMessages, { role: 'assistant', content: 'Error: Failed to get response from AI model' }]);
          setLoading(false);
          return;
        }

        // Handle streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        // Add empty assistant message that we'll update
        setMessages([...newMessages, { role: 'assistant', content: '' }]);
        setLoading(false);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    assistantMessage += data.content;
                    // Update the last message with accumulated content
                    setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
      } catch (error) {
        setMessages([...newMessages, { role: 'assistant', content: 'Failed to connect to the AI model. Please try again.' }]);
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Chat History */}
      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${
                msg.role === 'user'
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
              } rounded-2xl p-4 shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user'
                    ? 'bg-zinc-900 dark:bg-zinc-100'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                }`}>
                  <span className={`text-sm font-medium ${
                    msg.role === 'user'
                      ? 'text-white dark:text-zinc-900'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </span>
                </div>
                <div className="flex-1 prose dark:prose-invert max-w-none
                  prose-headings:mt-6 prose-headings:mb-3 first:prose-headings:mt-0
                  prose-p:my-3 prose-p:leading-relaxed
                  prose-ul:my-3 prose-ul:space-y-1
                  prose-li:my-1
                  prose-strong:font-semibold">
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap m-0">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">AI</span>
            </div>
            <div className="flex-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />

      {/* Input Box */}
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Where would you like to go, and when?"
          disabled={loading}
          className="w-full px-4 py-4 pr-14 bg-transparent resize-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-2xl min-h-[60px] max-h-[200px] disabled:opacity-50"
          rows={1}
          style={{
            height: 'auto',
            minHeight: '60px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 200) + 'px';
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className={`absolute right-3 bottom-3 p-2.5 rounded-lg transition-all duration-200 ${
            input.trim() && !loading
              ? 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer'
              : 'bg-zinc-200 dark:bg-zinc-800 cursor-not-allowed'
          }`}
          aria-label="Submit"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className={`transition-colors duration-200 ${
              input.trim() && !loading
                ? 'text-white dark:text-zinc-900'
                : 'text-zinc-400 dark:text-zinc-600'
            }`}
          >
            <path
              d="M3 10L17 10M17 10L11 4M17 10L11 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
