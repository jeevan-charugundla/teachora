import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { SplashScreen } from '@/components/common/SplashScreen';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { AuthCallbackPage } from '@/features/auth/pages/AuthCallbackPage';

// App pages
import { HomePage } from '@/features/home/pages/HomePage';
import { CreatePage } from '@/features/create/pages/CreatePage';
import { CreateStudioPage } from '@/features/create/pages/CreateStudioPage';
import { WorkspacePage } from '@/features/workspace/pages/WorkspacePage';
import { DiscoverPage } from '@/features/discover/pages/DiscoverPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { AssistantPage } from '@/features/assistant/pages/AssistantPage';
import { LessonEditorPage } from '@/features/lessons/pages/LessonEditorPage';

export const router = createBrowserRouter([
  // Root Splash screen route
  { path: '/', element: <SplashScreen /> },

  // Auth Callback route
  { path: '/auth/callback', element: <AuthCallbackPage /> },

  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // App routes (protected)
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'create', element: <CreatePage /> },

      // Create Studio routes for all 16 creation types
      { path: 'create/:type', element: <CreateStudioPage /> },

      // Legacy and direct routes
      { path: 'lesson/:id', element: <LessonEditorPage /> },
      { path: 'workspace', element: <WorkspacePage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'assistant', element: <AssistantPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },

  // Direct shortcuts for protected routes
  { path: '/dashboard', element: <Navigate to="/app" replace /> },
  { path: '/create', element: <Navigate to="/app/create" replace /> },
  { path: '/workspace', element: <Navigate to="/app/workspace" replace /> },
  { path: '/assistant', element: <Navigate to="/app/assistant" replace /> },

  // Catch-all redirect
  { path: '*', element: <Navigate to="/" replace /> },
]);
