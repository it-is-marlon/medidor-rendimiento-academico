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
    <div>
      <div>
        <div>
          <h2>
            {isRegistering ? 'Registro de Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p>
            {isRegistering 
              ? 'Crea tu cuenta para acceder al sistema' 
              : 'Ingresa a tu cuenta'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div>{error}</div>
          )}

          <div>
            {isRegistering && (
              <div>
                <label htmlFor="name">
                  Nombre Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={isRegistering}
                  placeholder="Nombre Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address">
                Correo Electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Enlace de recuperación de contraseña */}
          {!isRegistering && (
            <div>
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  {isRegistering ? 'Registrando...' : 'Iniciando sesión...'}
                </>
              ) : (
                <>
                  {isRegistering ? 'Registrarse' : 'Ingresar'}
                </>
              )}
            </button>
          </div>
        </form>

        <div>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              clearForm();
            }}
          >
            {isRegistering 
              ? '¿Ya tienes una cuenta? Inicia Sesión' 
              : '¿No tienes una cuenta? Regístrate'
            }
          </button>
        </div>

        {/* Información adicional */}
        <div>
          <p>
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