import Spinner from '@components/ui/Spinner';

export default function PageLoader() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    </div>
  );
}
