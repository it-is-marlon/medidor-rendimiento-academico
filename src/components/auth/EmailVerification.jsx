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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        {/* Ícono de email */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Verifica tu Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Te hemos enviado un correo de verificación a{' '}
            <span className="font-medium text-gray-900">{user?.email}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 text-red-500 text-center bg-red-50 border border-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 text-green-500 text-center bg-green-50 border border-green-200 rounded-md text-sm">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Haz clic en el enlace del correo y luego presiona el botón de abajo:
            </p>
            
            <button
              onClick={handleCheckVerification}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Verificando...
                </>
              ) : (
                'Ya verifiqué mi email'
              )}
            </button>
          </div>

          <div className="text-center border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-3">
              ¿No recibiste el correo?
            </p>
            
            <button
              onClick={handleResendVerification}
              disabled={isLoading || countdown > 0}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0 
                ? `Reenviar en ${countdown}s` 
                : 'Reenviar correo de verificación'
              }
            </button>
          </div>

          <div className="text-center border-t border-gray-200 pt-4">
            <button
              onClick={authService.signOutUser}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Consejo:</strong> Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}