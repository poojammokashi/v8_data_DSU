import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineBoltSlash, HiOutlineChartBar, HiOutlineShieldCheck } from 'react-icons/hi2';

const HIGHLIGHTS = [
  { icon: HiOutlineChartBar, text: 'Real-time generation & consumption analytics' },
  { icon: HiOutlineShieldCheck, text: 'Role-based access across your organization' },
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* Brand panel — hidden on mobile, shown from lg up */}
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden bg-slate-950 text-white p-12 flex-col justify-between">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(240,162,39,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(34,211,196,0.18), transparent 50%)',
          }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500">
            <HiOutlineBoltSlash className="h-5 w-5 text-slate-950" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Voltura</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10"
        >
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Power purchase &amp; open access,
            <br />
            under one grid view.
          </h1>
          <p className="mt-4 text-slate-300 text-sm max-w-sm">
            Monitor generation, consumption, peak demand and settlement across every connection point — in one
            place.
          </p>

          <div className="mt-10 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-amber-400" />
                </span>
                <span className="text-sm text-slate-200">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-slate-500">© {new Date().getFullYear()} Voltura Grid Systems</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
