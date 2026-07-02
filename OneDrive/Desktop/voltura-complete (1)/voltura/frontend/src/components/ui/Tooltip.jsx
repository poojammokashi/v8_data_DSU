import { cn } from '@utils/cn';

const POSITIONS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export default function Tooltip({ content, position = 'top', children, className }) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-40 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-2xs font-medium text-white',
          'opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100',
          'dark:bg-slate-700 shadow-raised',
          POSITIONS[position],
          className
        )}
      >
        {content}
      </span>
    </span>
  );
}
