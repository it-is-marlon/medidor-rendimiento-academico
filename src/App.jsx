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
      <div>
        Cargando...
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