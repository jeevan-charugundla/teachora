import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';

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
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
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

  // Default redirect
  { path: '/', element: <Navigate to="/app" replace /> },
  { path: '*', element: <Navigate to="/app" replace /> },
]);
