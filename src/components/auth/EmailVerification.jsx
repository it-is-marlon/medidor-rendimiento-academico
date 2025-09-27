import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

export function EmailVerification({ user, onVerified }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleResendVerification = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.resendEmailVerification();
      setMessage('Correo de verificación enviado. Revisa tu bandeja de entrada.');
      setCountdown(60); // 60 segundos de espera
    } catch (err) {
      console.error('Error al reenviar correo de verificación:', err);
      
      if (err.code === 'auth/too-many-requests') {
        setError('Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo.');
      } else {
        setError('Error al enviar el correo. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    setError('');

    try {
      const updatedUser = await authService.reloadUser();
      if (updatedUser && updatedUser.emailVerified) {
        setMessage('¡Email verificado correctamente!');
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setError('El email aún no ha sido verificado. Revisa tu correo y haz clic en el enlace de verificación.');
      }
    } catch (err) {
      console.error('Error al verificar email:', err);
      setError('Error al verificar el estado del email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        {/* Ícono de email eliminado */}
        <div>
          <h2>
            Verifica tu Email
          </h2>
          <p>
            Te hemos enviado un correo de verificación a{' '}
            <span>{user?.email}</span>
          </p>
        </div>

        {error && (
          <div>
            {error}
          </div>
        )}

        {message && (
          <div>
            {message}
          </div>
        )}

        <div>
          <div>
            <p>
              Haz clic en el enlace del correo y luego presiona el botón de abajo:
            </p>
            <button
              onClick={handleCheckVerification}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Verificando...
                </>
              ) : (
                'Ya verifiqué mi email'
              )}
            </button>
          </div>

          <div>
            <p>
              ¿No recibiste el correo?
            </p>
            <button
              onClick={handleResendVerification}
              disabled={isLoading || countdown > 0}
            >
              {countdown > 0 
                ? `Reenviar en ${countdown}s` 
                : 'Reenviar correo de verificación'
              }
            </button>
          </div>

          <div>
            <button
              onClick={authService.signOutUser}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div>
          <div>
            <div>
              {/* icono eliminado */}
            </div>
            <div>
              <p>
                <strong>Consejo:</strong> Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}