import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

const MAX_FILES = 5;
// Photos are compressed before upload (lib/compressImage), so large originals
// are fine; GIFs are sent as-is and must stay small.
const MAX_SIZE = 20 * 1024 * 1024;
const MAX_GIF_SIZE = 2 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const isAllowed = (file) =>
  ACCEPT.includes(file.type) && file.size <= (file.type === 'image/gif' ? MAX_GIF_SIZE : MAX_SIZE);

/** Pick up to 5 photos (click or drag & drop) with instant previews. */
export default function ImagePicker({ files, onChange, className }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(isAllowed);
    setError(valid.length < incoming.length ? 'Only JPG, PNG or WEBP photos up to 20MB (GIFs up to 2MB)' : '');
    onChange([...files, ...valid].slice(0, MAX_FILES));
  };

  const removeAt = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div className={className}>
      <p className="mb-1.5 text-sm font-semibold text-ink">
        Photos <span className="font-normal text-muted">({files.length}/{MAX_FILES})</span>
      </p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        <AnimatePresence initial={false}>
          {previews.map((url, index) => (
            <motion.div
              key={url}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-line"
            >
              <img src={url} alt="" className="size-full object-cover" />
              {index === 0 && (
                <span className="on-brand absolute bottom-1.5 left-1.5 rounded-full bg-brand-400 px-2 py-0.5 text-[10px] font-bold text-ink">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove photo ${index + 1}`}
                className="focus-ring absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white transition hover:bg-red-500"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {files.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              'focus-ring flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-xs font-semibold transition',
              dragging
                ? 'border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-400/10'
                : 'border-line text-muted hover:border-brand-300 hover:text-ink',
            )}
          >
            <ImagePlus className="size-6" />
            Add photo
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
