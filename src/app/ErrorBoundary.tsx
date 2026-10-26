import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** What to show instead of the children after an error. `reset` clears the error and tries to render the children again. */
  fallback: (error: Error, reset: () => void) => ReactNode;
  /** When any value in this list changes, the error is cleared automatically (for example the current URL). */
  resetKeys?: unknown[];
  onError?: (error: Error, info: ErrorInfo) => void;
}
interface State {
  error: Error | null;
}

/**
 * A class component, because error boundaries are the one thing hooks cannot do (there is no hook for
 * getDerivedStateFromError). It catches errors thrown while RENDERING its children, in their lifecycle methods
 * and in their constructors. It does NOT catch errors in event handlers, in promises or timers, or in the
 * boundary itself: handle those with try/catch, or put the error in state and throw it during render.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error }; // the next render shows the fallback
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info); // the place to report to a monitoring service
  }

  componentDidUpdate(prev: Props, prevState: State) {
    const a = prev.resetKeys ?? [];
    const b = this.props.resetKeys ?? [];
    // Reset only if the boundary was ALREADY showing an error before this update. If the new key is what caused the
    // error, resetting would render the children again, fail again and report the same error twice.
    if (this.state.error && prevState.error && (a.length !== b.length || a.some((value, i) => !Object.is(value, b[i])))) this.reset();
  }

  reset = () => this.setState({ error: null });

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.reset) : this.props.children;
  }
}
