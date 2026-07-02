import { cn } from '@utils/cn';

function Card({ className, children, glass = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-subtle shadow-card',
        glass ? 'glass-panel' : 'bg-surface-raised',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex items-start justify-between gap-3 p-5 pb-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-sm font-semibold text-ink', className)} {...props}>
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs text-ink-muted mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('flex items-center gap-3 p-5 pt-0 border-t border-border-subtle mt-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
