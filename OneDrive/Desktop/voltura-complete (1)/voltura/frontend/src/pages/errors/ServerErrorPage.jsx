import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineExclamationTriangle, HiOutlineArrowPath, HiOutlineHome } from 'react-icons/hi2';
import Button from '@components/ui/Button';
import { ROUTE_PATHS } from '@routes/routePaths';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-sm"
      >
        <div className="h-14 w-14 rounded-2xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center mx-auto mb-5">
          <HiOutlineExclamationTriangle className="h-7 w-7 text-danger-500" />
        </div>
        <h1 className="text-xl font-semibold text-ink">Something went wrong on our end</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Our team has been notified. Please try again in a moment.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="secondary" leftIcon={HiOutlineArrowPath} onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Link to={ROUTE_PATHS.DASHBOARD}>
            <Button leftIcon={HiOutlineHome}>Dashboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
