import React, { useEffect, useState } from "react";
// Importaciones de los servicios que creaste
import { initializeAuth, auth } from "./services/authService";
import { db } from "./services/firestoreService";

// Importa aquí los demás componentes que vayas creando, como la página de login.
// import LoginPage from './pages/LoginPage.jsx';

function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null);

  // useEffect para inicializar Firebase al cargar la app.
  // El arreglo vacío [] asegura que se ejecute solo una vez.
  useEffect(() => {
    const setupFirebase = async () => {
      try {
        await initializeAuth();
        setIsAuthReady(true);
      } catch (error) {
        console.error("No se pudo inicializar Firebase:", error);
      }
    };

    setupFirebase();

    // Listener de estado de autenticación para saber si hay un usuario logueado
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Muestra un mensaje de carga hasta que la autenticación esté lista.
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Cargando...</div>
      </div>
    );
  }

  // Lógica para mostrar diferentes componentes dependiendo del estado de la sesión.
  return (
    <div className="min-h-screen bg-gray-100">
      {/*
        Aquí puedes mostrar diferentes páginas.
        Por ejemplo, si el usuario está logueado, muestra el panel de control.
        Si no, muestra la página de inicio de sesión.

        {user ? <ControlPanel /> : <LoginPage />}
      */}
      <div className="p-8 text-center text-gray-600">
        La aplicación está lista. Puedes empezar a integrar los componentes de
        tu proyecto. ID de usuario actual: {user ? user.uid : "No autenticado"}
      </div>
    </div>
  );
}

export default App;
