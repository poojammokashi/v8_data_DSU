import { Component } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Button from '@components/ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Hook point for sending to an error-tracking service (Sentry, etc.)
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-border-subtle bg-surface-raised">
          <div className="h-12 w-12 rounded-2xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center mb-4">
            <HiOutlineExclamationTriangle className="h-6 w-6 text-danger-500" />
          </div>
          <h3 className="text-sm font-semibold text-ink">This section couldn't load</h3>
          <p className="mt-1.5 text-sm text-ink-muted max-w-sm">
            Something broke while rendering this part of the page. The rest of the dashboard is unaffected.
          </p>
          <Button variant="secondary" size="sm" className="mt-5" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
