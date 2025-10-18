'use client';

import { useState } from 'react';

export default function TextBoxInput() {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      console.log('Submitted:', input);
      // Add your submit logic here
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you today?"
          className="w-full px-4 py-4 pr-14 bg-transparent resize-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-2xl min-h-[60px] max-h-[200px]"
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
          disabled={!input.trim()}
          className={`absolute right-3 bottom-3 p-2.5 rounded-lg transition-all duration-200 ${
            input.trim()
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
              input.trim()
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
