// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

/* global __firebase_config, __initial_auth_token */

// Configuración global proporcionada por el entorno
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== "undefined" ? __firebase_config : "{}"
);
const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

// Inicializa la aplicación de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Función para autenticar al usuario usando un token personalizado o de forma anónima.
 * Es crucial para inicializar la sesión en el entorno de desarrollo.
 */
export const initializeAuth = async () => {
  try {
    if (initialAuthToken) {
      await signInWithEmailAndPassword(auth, initialAuthToken);
    } else {
      // Si no hay token, iniciamos sesión de forma anónima.
      await signInAnonymously(auth);
    }
    console.log("Autenticación inicial exitosa.");
  } catch (error) {
    console.error("Error durante la autenticación inicial:", error);
    throw error;
  }
};

/**
 * Función para iniciar sesión con correo electrónico y contraseña.
 * El frontend usará esta función cuando el usuario presione el botón de "Ingresar".
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    throw error;
  }
};

// Exportamos la instancia de autenticación para que otros servicios la puedan usar.
export { auth };
