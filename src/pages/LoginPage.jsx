import React, { useState } from 'react';
import { authService } from '../services/authService';
import { PasswordReset } from '../components/auth/PasswordReset';
import { EmailVerification } from '../components/auth/EmailVerification';
import { useAuth } from '../hooks/useAuth';

// Componente para la página de inicio de sesión y registro
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);

  const { user } = useAuth();

  // Si hay un usuario no verificado, mostrar pantalla de verificación
  if (showEmailVerification && unverifiedUser) {
    return (
      <EmailVerification
        user={unverifiedUser}
        onVerified={() => {
          setShowEmailVerification(false);
          setUnverifiedUser(null);
        }}
      />
    );
  }

  // Si se está mostrando la recuperación de contraseña
  if (showPasswordReset) {
    return (
      <PasswordReset
        onBack={() => setShowPasswordReset(false)}
      />
    );
  }

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Lógica de registro
        if (!name.trim()) {
          setError('Por favor, ingresa tu nombre para registrarte.');
          setIsLoading(false);
          return;
        }
        
        const newUser = await authService.createUser(email, password, name, 'docente');
        console.log("Registro exitoso");
        
        // Mostrar pantalla de verificación de email
        setUnverifiedUser(newUser);
        setShowEmailVerification(true);
        
      } else {
        // Lógica de inicio de sesión
        const loggedUser = await authService.loginUser(email, password);
        
        // Verificar si el email está verificado
        if (!loggedUser.emailVerified) {
          setUnverifiedUser(loggedUser);
          setShowEmailVerification(true);
          return;
        }
        
        console.log("Inicio de sesión exitoso");
      }
    } catch (err) {
      console.error(err);
      
      // Manejo de errores más específico
      switch (err.code) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError("Correo o contraseña incorrectos. Por favor, verifica tus credenciales.");
          break;
        case 'auth/email-already-in-use':
          setError("Este correo ya está registrado. Por favor, inicia sesión.");
          break;
        case 'auth/weak-password':
          setError("La contraseña debe tener al menos 6 caracteres.");
          break;
        case 'auth/invalid-email':
          setError("El formato del correo electrónico no es válido.");
          break;
        case 'auth/too-many-requests':
          setError("Demasiados intentos fallidos. Inténtalo de nuevo más tarde.");
          break;
        case 'auth/network-request-failed':
          setError("Error de conexión. Verifica tu conexión a internet.");
          break;
        case 'auth/user-disabled':
          setError("Esta cuenta ha sido deshabilitada. Contacta al administrador.");
          break;
        default:
          setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            {isRegistering ? 'Registro de Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegistering 
              ? 'Crea tu cuenta para acceder al sistema' 
              : 'Ingresa a tu cuenta'
            }
          </p>
        </div>

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
                  required={isRegistering}
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
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Enlace de recuperación de contraseña */}
          {!isRegistering && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                  {isRegistering ? 'Registrando...' : 'Iniciando sesión...'}
                </>
              ) : (
                <>
                  {isRegistering ? 'Registrarse' : 'Ingresar'}
                  {!isLoading && (
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              clearForm();
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isRegistering 
              ? '¿Ya tienes una cuenta? Inicia Sesión' 
              : '¿No tienes una cuenta? Regístrate'
            }
          </button>
        </div>

        {/* Información adicional */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {isRegistering 
              ? 'Al registrarte, recibirás un correo de verificación.'
              : 'Si tienes problemas para acceder, contacta al administrador.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}