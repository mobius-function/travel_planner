'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ItineraryArtifactProps {
  content: string;
}

export default function ItineraryArtifact({ content }: ItineraryArtifactProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!content) return null;

  if (isMinimized) {
    // Minimized state - show at bottom
    return (
      <div className="fixed bottom-0 right-0 w-80 z-50 m-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-4 py-3 rounded-lg shadow-2xl cursor-pointer hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 transition-all"
          onClick={() => setIsMinimized(false)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-semibold">Travel Itinerary</span>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-full lg:w-2/5 z-40 flex flex-col shadow-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div>
              <h2 className="text-xl font-bold">
                Travel Itinerary
              </h2>
              <p className="text-blue-100 text-sm mt-1">Day-by-day travel plan</p>
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-blue-800 dark:hover:bg-blue-900 p-2 rounded-lg transition-colors"
            aria-label="Minimize itinerary"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-zinc-900 shadow-xl overflow-y-auto p-6 border-l border-zinc-200 dark:border-zinc-800">
        <div className="prose dark:prose-invert max-w-none
          prose-headings:font-semibold
          prose-h2:text-xl prose-h2:mt-0 prose-h2:mb-4 prose-h2:text-blue-900 dark:prose-h2:text-blue-300 prose-h2:border-b prose-h2:border-blue-200 dark:prose-h2:border-blue-900 prose-h2:pb-2
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-zinc-900 dark:prose-h3:text-zinc-50 prose-h3:font-bold prose-h3:bg-zinc-100 dark:prose-h3:bg-zinc-800 prose-h3:px-3 prose-h3:py-2 prose-h3:rounded-lg
          prose-h4:text-base prose-h4:mt-4 prose-h4:mb-2 prose-h4:text-zinc-900 dark:prose-h4:text-zinc-100 prose-h4:font-semibold
          first:prose-headings:mt-0
          prose-p:my-2 prose-p:leading-6 prose-p:text-zinc-600 dark:prose-p:text-zinc-400
          prose-ul:my-3 prose-ul:space-y-1.5 prose-ul:list-none prose-ul:pl-0
          prose-li:my-0 prose-li:text-zinc-700 dark:prose-li:text-zinc-300 prose-li:leading-7 prose-li:pl-0
          prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
