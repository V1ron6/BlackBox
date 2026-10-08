import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ToolBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(e) { console.error('Tool crashed:', e); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="notice err">
        <AlertTriangle size={18} /> This tool crashed, but the rest of the site is fine.
        <button onClick={() => this.setState({ error: null })}>Retry</button>
      </div>
    );
  }
}
