import { useCallback, useRef, useState } from 'react';
import { HiOutlineCloudArrowUp, HiOutlineDocumentText, HiOutlineXMark } from 'react-icons/hi2';
import { cn } from '@utils/cn';
import { formatNumber } from '@utils/formatters';

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json'];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, 1)} KB`;
  return `${formatNumber(bytes / (1024 * 1024), 1)} MB`;
}

export default function FileDropzone({ onFileSelect, accept = ACCEPTED_EXTENSIONS, maxSizeMb = 10, className }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const validateAndSet = useCallback(
    (selected) => {
      if (!selected) return;
      const ext = `.${selected.name.split('.').pop().toLowerCase()}`;
      if (!accept.includes(ext)) {
        setError(`Unsupported file type. Accepted: ${accept.join(', ')}`);
        return;
      }
      if (selected.size > maxSizeMb * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMb} MB limit.`);
        return;
      }
      setError(null);
      setFile(selected);
      onFileSelect?.(selected);
    },
    [accept, maxSizeMb, onFileSelect]
  );

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  function handleRemove() {
    setFile(null);
    setError(null);
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (file) {
    return (
      <div className={cn('flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-subtle p-4', className)}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
          <HiOutlineDocumentText className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{file.name}</p>
          <p className="text-xs text-ink-muted">{formatFileSize(file.size)}</p>
        </div>
        <button
          onClick={handleRemove}
          aria-label="Remove file"
          className="text-ink-faint hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg p-1.5 transition-colors"
        >
          <HiOutlineXMark className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors text-center',
          isDragging ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-500/5' : 'border-border hover:border-ink-faint',
          className
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-subtle">
          <HiOutlineCloudArrowUp className="h-6 w-6 text-ink-faint" />
        </span>
        <p className="text-sm font-medium text-ink">
          Drop your file here, or <span className="text-amber-500">browse</span>
        </p>
        <p className="text-xs text-ink-muted">
          Supports {accept.join(', ')} · Up to {maxSizeMb} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          onChange={(e) => validateAndSet(e.target.files?.[0])}
          className="hidden"
        />
      </div>
      {error && <p className="mt-2 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
