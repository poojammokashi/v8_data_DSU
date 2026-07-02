import { Link, useLocation } from 'react-router-dom';
import { HiChevronRight } from 'react-icons/hi2';

function toLabel(segment) {
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-ink-muted">
      {segments.map((segment, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            {i > 0 && <HiChevronRight className="h-3 w-3 text-ink-faint" />}
            {isLast ? (
              <span className="text-ink font-medium">{toLabel(segment)}</span>
            ) : (
              <Link to={path} className="hover:text-ink transition-colors">
                {toLabel(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
