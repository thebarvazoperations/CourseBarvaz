import React from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="card p-10 text-center max-w-md shadow-glow">
            <AlertTriangle size={48} className="text-danger mx-auto mb-4" />
            <h2 className="text-h3 font-700 mb-3">משהו השתבש</h2>
            <p className="text-muted text-sm mb-6 leading-relaxed">
              אירעה שגיאה בלתי צפויה. ניתן לנסות לרענן את הדף.
            </p>
            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              רענן דף
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
