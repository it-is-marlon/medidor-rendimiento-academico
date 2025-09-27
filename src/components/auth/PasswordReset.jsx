import React, { useState } from 'react';
import { authService } from '../../services/authService';

export function PasswordReset({ onBack }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico.');
      setIsLoading(false);
      return;
    }

    try {
      await authService.resetPassword(email);
      setIsSuccess(true);
      setMessage(
        `Se ha enviado un correo de restablecimiento a ${email}. Revisa tu bandeja de entrada y carpeta de spam.`
      );
    } catch (err) {
      console.error('Error al enviar correo de restablecimiento:', err);
      
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta asociada a este correo electrónico.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiadas solicitudes. Inténtalo de nuevo más tarde.');
      } else {
        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div>
        <div>
          {/* Ícono de éxito eliminado */}
          <div>
            <h2>Correo Enviado</h2>
            <p>{message}</p>
          </div>
          <div>
            <button onClick={onBack}>
              Volver al inicio de sesión
            </button>
            <div>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setMessage('');
                  setEmail('');
                }}
              >
                ¿No recibiste el correo? Enviar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* Botón de regreso */}
        <button onClick={onBack}>
          Volver al inicio de sesión
        </button>
        <div>
          <h2>Recuperar Contraseña</h2>
          <p>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && (
            <div>{error}</div>
          )}
          {message && (
            <div>{message}</div>
          )}
          <div>
            <label htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
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
            <button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Enviando...
                </>
              ) : (
                'Enviar enlace de restablecimiento'
              )}
            </button>
          </div>
        </form>
        <div>
          <p>
            Si no tienes una cuenta, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}