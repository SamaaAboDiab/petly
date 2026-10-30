import { motion } from 'framer-motion';
import { SendHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';

const MAX_LENGTH = 1000;
const TYPING_THROTTLE_MS = 2000;

/** Enter sends, Shift+Enter adds a line. Calls `onTyping` at most every 2s. */
export default function ChatComposer({ onSend, onTyping, disabled }) {
  const [text, setText] = useState('');
  const lastTypingAt = useRef(0);
  const trimmed = text.trim();

  const submit = () => {
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleChange = (event) => {
    setText(event.target.value.slice(0, MAX_LENGTH));
    const now = Date.now();
    if (now - lastTypingAt.current > TYPING_THROTTLE_MS) {
      lastTypingAt.current = now;
      onTyping?.();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 border-t border-line bg-surface p-3"
    >
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="Write a message…"
        aria-label="Message"
        disabled={disabled}
        className="field-sizing-content max-h-32 min-h-11 flex-1 resize-none rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:ring-4 focus:ring-brand-300/30"
      />
      <motion.button
        type="submit"
        whileTap={{ scale: 0.88 }}
        disabled={!trimmed || disabled}
        aria-label="Send message"
        className={cn(
          'focus-ring on-brand grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-400 text-ink shadow-glow transition',
          'hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
        )}
      >
        <SendHorizontal className="size-5" />
      </motion.button>
    </form>
  );
}
