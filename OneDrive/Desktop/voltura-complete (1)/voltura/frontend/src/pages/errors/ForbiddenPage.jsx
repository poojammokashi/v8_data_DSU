import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShieldExclamation, HiOutlineHome } from 'react-icons/hi2';
import Button from '@components/ui/Button';
import { ROUTE_PATHS } from '@routes/routePaths';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-sm"
      >
        <div className="h-14 w-14 rounded-2xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center mx-auto mb-5">
          <HiOutlineShieldExclamation className="h-7 w-7 text-danger-500" />
        </div>
        <h1 className="text-xl font-semibold text-ink">You don't have access to this</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Your current role doesn't include permission for this page. Contact your administrator if you believe
          this is a mistake.
        </p>
        <Link to={ROUTE_PATHS.DASHBOARD} className="inline-block mt-6">
          <Button leftIcon={HiOutlineHome} variant="secondary">
            Back to dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
