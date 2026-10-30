import { motion } from 'framer-motion';
import { AlertCircle, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/format';

/** `status`: undefined (sent) | 'pending' | 'failed' — only for my own messages. */
export default function MessageBubble({ message, mine, status, onRetry }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn('flex', mine ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-soft sm:max-w-[70%]',
          mine ? 'on-brand rounded-br-lg bg-brand-400 text-ink' : 'rounded-bl-lg border border-line bg-surface text-ink',
          status === 'failed' && 'opacity-70',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p className={cn('mt-1 flex items-center justify-end gap-1 text-[10px]', mine ? 'text-ink/60' : 'text-muted')}>
          {formatTime(message.createdAt)}
          {mine && status === 'pending' && <Clock className="size-3" />}
          {mine && !status && <Check className="size-3" />}
        </p>
      </div>
      {status === 'failed' && (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring ml-2 flex items-center gap-1 self-center rounded-lg text-xs font-semibold text-red-500 hover:underline"
        >
          <AlertCircle className="size-4" /> Retry
        </button>
      )}
    </motion.div>
  );
}
