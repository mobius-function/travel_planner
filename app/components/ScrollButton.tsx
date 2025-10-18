interface ScrollButtonProps {
  direction: 'up' | 'down';
  onClick: () => void;
  className?: string;
}

export default function ScrollButton({ direction, onClick, className = '' }: ScrollButtonProps) {
  const isUp = direction === 'up';

  return (
    <button
      onClick={onClick}
      className={`fixed bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 ${className}`}
      aria-label={`Scroll to ${direction === 'up' ? 'top' : 'bottom'}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isUp ? (
          <path d="M12 19V5M5 12l7-7 7 7" />
        ) : (
          <path d="M12 5v14M19 12l-7 7-7-7" />
        )}
      </svg>
    </button>
  );
}
