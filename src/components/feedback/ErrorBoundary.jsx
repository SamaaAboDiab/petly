import { Component } from 'react';
import { Home, RefreshCw, TriangleAlert } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

// After a new deploy, an open tab may request code-split chunks that no
// longer exist. A reload fetches the new build.
const isChunkLoadError = (error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    String(error?.message),
  );

function ErrorFallback({ error, onRetry, fullScreen }) {
  const outdated = isChunkLoadError(error);
  return (
    <div role="alert" className={cn('grid place-items-center px-6 text-center', fullScreen ? 'min-h-dvh' : 'min-h-[60vh]')}>
      <div className="max-w-md">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
          <TriangleAlert className="size-8" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-ink">
          {outdated ? 'A new version is available' : 'Something went wrong'}
        </h1>
        <p className="mt-2 text-muted">
          {outdated
            ? 'Petly was just updated. Reload to get the latest version.'
            : 'This part of the page hit an unexpected error. Please try again, or head back home.'}
        </p>
        {import.meta.env.DEV && !outdated && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-surface-2 p-3 text-left text-xs text-red-500">{String(error?.stack ?? error)}</pre>
        )}
        <div className="mt-7 flex justify-center gap-3">
          <button type="button" onClick={outdated ? () => window.location.reload() : onRetry} className={buttonStyles()}>
            <RefreshCw className="size-4" /> {outdated ? 'Reload' : 'Try again'}
          </button>
          {/* Plain <a> so it works even if the router itself is broken. */}
          <a href="/app" className={buttonStyles({ variant: 'secondary' })}>
            <Home className="size-4" /> Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Catches render errors in its subtree and shows a recoverable fallback instead
 * of a blank screen. Pass `resetKey` (e.g. the pathname) to clear the error
 * automatically when the user navigates elsewhere.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Petly UI error:', error, info.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  retry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={this.retry} fullScreen={this.props.fullScreen} />;
    }
    return this.props.children;
  }
}
