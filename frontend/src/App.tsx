import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/ui/toast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import FriendsHub from './pages/FriendsHub';
import PlanView from './pages/PlanView';
import DayDetail from './pages/DayDetail';
import AssignedQuestions from './pages/AssignedQuestions';
import Plans from './pages/Plans';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <main className="min-h-screen font-display text-foreground">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />

              {/* Protected */}
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/friends" element={<ProtectedRoute><FriendsHub /></ProtectedRoute>} />
              <Route path="/questions" element={<ProtectedRoute><AssignedQuestions /></ProtectedRoute>} />
              <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
              <Route path="/plan/:id" element={<ProtectedRoute><PlanView /></ProtectedRoute>} />
              <Route path="/plan/:id/day/:date" element={<ProtectedRoute><DayDetail /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
