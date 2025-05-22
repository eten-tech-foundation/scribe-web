import React from 'react';

import { RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import './i18n';

import './index.css';
import { router } from './routes';
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
