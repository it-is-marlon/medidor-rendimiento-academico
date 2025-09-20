import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { AdministradorDashboard } from './pages/AdministradorDashboard';
import { StudentManagement } from './pages/StudentManagement';

function App() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Routes>
        {userProfile?.role === "docente" && (
          <>
            <Route 
              path="/" 
              element={<TeacherDashboard user={user} userProfile={userProfile} />} 
            />
            <Route 
              path="/course/:courseId" 
              element={<StudentManagement />} 
            />
          </>
        )}
        {userProfile?.role === "apoderado" && (
          <Route 
            path="/" 
            element={<ParentDashboard user={user} userProfile={userProfile} />} 
          />
        )}
        {userProfile?.role === "administrador" && (
          <Route 
            path="/" 
            element={<AdministradorDashboard user={user} userProfile={userProfile} />} 
          />
        )}
        {/* Ruta por defecto - redirige al login */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;