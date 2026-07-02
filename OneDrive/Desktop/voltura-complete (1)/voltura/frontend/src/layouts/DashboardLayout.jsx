import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar/Sidebar';
import MobileSidebar from './components/Sidebar/MobileSidebar';
import Navbar from './components/Navbar/Navbar';
import ErrorBoundary from '@components/feedback/ErrorBoundary';

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Visually hidden until focused — lets keyboard users skip the
          sidebar nav and jump straight to page content (WCAG 2.4.1). */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-950"
      >
        Skip to main content
      </a>

      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-5 lg:px-7 lg:py-7 max-w-[1600px] w-full mx-auto focus:outline-none">
          <ErrorBoundary key={location.pathname}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
