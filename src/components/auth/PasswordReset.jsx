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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
          {/* Ícono de éxito */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900">
              Correo Enviado
            </h2>
            <p className="mt-4 text-sm text-gray-600 text-center">
              {message}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onBack}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al inicio de sesión
            </button>
            
            <div className="text-center">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setMessage('');
                  setEmail('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        {/* Botón de regreso */}
        <button
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver al inicio de sesión
        </button>

        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-red-500 text-center bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 text-green-500 text-center bg-green-50 border border-green-200 rounded-md">
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Enviando...
                </>
              ) : (
                'Enviar enlace de restablecimiento'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Si no tienes una cuenta, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}