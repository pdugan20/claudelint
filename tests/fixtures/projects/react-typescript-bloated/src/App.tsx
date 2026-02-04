import React from 'react';

interface AppProps {
  title?: string;
}

export function App({ title = 'Hello World' }: AppProps) {
  return (
    <div className="app">
      <h1>{title}</h1>
      <p>This is a minimal React component for testing claudelint.</p>
    </div>
  );
}
