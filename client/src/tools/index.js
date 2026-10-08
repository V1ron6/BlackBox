import { lazy } from 'react';

// Client-side tools are lazy chunks: a broken one can't break the others.
export const CLIENT_TOOLS = {
  gpa: lazy(() => import('./Gpa.jsx')),
  'word-count': lazy(() => import('./WordCount.jsx')),
  qr: lazy(() => import('./Qr.jsx')),
};
