import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link
        to="/"
        className="flex items-center gap-1 text-muted-light dark:text-muted-dark hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, idx) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-light dark:text-muted-dark" />
          {item.to && idx !== items.length - 1 ? (
            <Link to={item.to} className="text-muted-light dark:text-muted-dark hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-light dark:text-ink-dark">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
