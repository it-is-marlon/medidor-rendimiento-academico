import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously,
} from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { firestoreService } from "../services/firestoreService";

// This is a custom hook to handle authentication logic and user state
// Este es un hook personalizado para manejar la lógica de autenticación y el estado del usuario
export function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global app variables from Canvas environment
  // Variables globales de la app del entorno de Canvas
  const initialAuthToken =
    typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

  useEffect(() => {
    // Function to bootstrap authentication with a custom token or anonymously
    // Función para iniciar la autenticación con un token personalizado o de forma anónima
    const bootstrapAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Error bootstrapping auth:", e);
      }
    };

    bootstrapAuth();

    // Listener for authentication state changes
    // Listener para los cambios de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const profile = await firestoreService.getUserProfile(
            currentUser.uid
          );
          setUserProfile(profile);
        } catch (error) {
          console.error("Error getting user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initialAuthToken]);

  return { user, userProfile, loading };
}
