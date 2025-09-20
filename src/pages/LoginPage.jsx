import React, { useState } from 'react';
import { authService } from '../services/authService';

// Componente para la página de inicio de sesión y registro
// Component for the login and registration page
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Maneja el envío del formulario, ya sea para inicio de sesión o registro
  // Handles form submission for either login or registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Lógica de registro - CORREGIDO: usar createUser en lugar de signUp
        // Registration logic - FIXED: use createUser instead of signUp
        if (!name) {
          setError('Por favor, ingresa tu nombre para registrarte.');
          setIsLoading(false);
          return;
        }
        await authService.createUser(email, password, name, 'docente'); // Asume el rol de docente por ahora
        console.log("Registro exitoso");
      } else {
        // Lógica de inicio de sesión
        // Login logic
        await authService.loginUser(email, password);
        console.log("Inicio de sesión exitoso");
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("Correo o contraseña incorrectos. Por favor, verifica tus credenciales.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este correo ya está registrado. Por favor, inicia sesión.");
      } else if (err.code === 'auth/weak-password') {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (err.code === 'auth/invalid-email') {
        setError("El formato del correo electrónico no es válido.");
      } else {
        setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          {isRegistering ? 'Registro de Cuenta' : 'Iniciar Sesión'}
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-red-500 text-center bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Nombre Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Correo Electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  isRegistering ? '' : 'rounded-t-md'
                }`}
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cargando...' : isRegistering ? 'Registrarse' : 'Ingresar'}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setName('');
              setEmail('');
              setPassword('');
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isRegistering ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes una cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}