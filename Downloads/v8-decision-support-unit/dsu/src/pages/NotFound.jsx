import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Compass className="h-10 w-10 text-muted-light dark:text-muted-dark" />
      <p className="text-lg font-semibold text-ink-light dark:text-ink-dark">Page not found</p>
      <p className="text-sm text-muted-light dark:text-muted-dark">This module doesn't exist in the workbook index.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to Dashboard
      </Link>
    </div>
  );
}
