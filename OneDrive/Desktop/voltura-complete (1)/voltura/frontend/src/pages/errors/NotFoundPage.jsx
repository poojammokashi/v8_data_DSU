import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHome } from 'react-icons/hi2';
import Button from '@components/ui/Button';
import { ROUTE_PATHS } from '@routes/routePaths';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-sm"
      >
        <p className="text-7xl font-bold text-amber-500 tracking-tight tabular">404</p>
        <h1 className="mt-4 text-xl font-semibold text-ink">This page is off the grid</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to={ROUTE_PATHS.DASHBOARD} className="inline-block mt-6">
          <Button leftIcon={HiOutlineHome}>Back to dashboard</Button>
        </Link>
      </motion.div>
    </div>
  );
}
