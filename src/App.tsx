import { RouterProvider } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProviders } from './app/providers/AppProviders';
import { router } from './app/routes';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Analytics />
    </AppProviders>
  );
}
