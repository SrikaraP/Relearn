import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentPortalMarketing from './pages/StudentPortal';
import TeacherPortalMarketing from './pages/TeacherPortal';
import ParentPortalMarketing from './pages/ParentPortal';
import StudentOnboarding from './pages/StudentOnboarding';
import StudentLayout from './pages/student/StudentLayout';
import TeacherLayout from './pages/teacher/TeacherLayout';
import ParentLayout from './pages/parent/ParentLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Generic Dashboard router component
import { useAuth } from './contexts/AuthContext';
const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  
  // Enforce onboarding for students
  if (user.role === 'student' && !user.onboardingComplete) {
    return <Navigate to="/onboarding" />;
  }

  return <Navigate to={`/dashboard/${user.role}`} />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/portal/student" element={<StudentPortalMarketing />} />
              <Route path="/portal/teacher" element={<TeacherPortalMarketing />} />
              <Route path="/portal/parent" element={<ParentPortalMarketing />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<DashboardRouter />} />
              
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/onboarding" element={<StudentOnboarding />} />
                <Route path="/dashboard/student" element={<StudentLayout />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                <Route path="/dashboard/teacher" element={<TeacherLayout />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
                <Route path="/dashboard/parent" element={<ParentLayout />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
