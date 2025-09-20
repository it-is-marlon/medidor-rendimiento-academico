import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, appId } from "./firebaseConfig";

// Servicio de autenticación
const authService = {
  // Crea un nuevo usuario y su perfil en Firestore
  createUser: async (email, password, name, role) => {
    try {
      // 1. Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Paso 1: CREAR EL CAMPO EN EL DOCUMENTO PRINCIPAL DEL USUARIO (tu "profile" principal)
      // La referencia apunta a: artifacts/{appId}/users/{user.uid}
      const mainUserRef = doc(db, `artifacts/${appId}/users/${user.uid}`);

      // CAMBIO: Se agrega el campo 'reconocible' al documento principal.
      // Usamos { merge: true } para asegurarnos de no sobrescribir otros campos
      // si el documento ya existiera por alguna razón.
      await setDoc(
        mainUserRef,
        {
          reconocible: "si",
        },
        { merge: true }
      );

      // Paso 2: CREAR EL DOCUMENTO DE DATOS DETALLADO (tu "data")
      // La referencia apunta a: artifacts/{appId}/users/{user.uid}/profile/data
      const profileDataRef = doc(
        db,
        `artifacts/${appId}/users/${user.uid}/profile/data`
      );
      await setDoc(profileDataRef, {
        name: name,
        email: email,
        role: role,
        userId: user.uid,
        reconocible: "si", // Mantenemos el campo aquí por consistencia
      });

      console.log("Usuario creado y perfil guardado en Firestore.");
      return user;
    } catch (error) {
      console.error("Error al crear el usuario:", error.code, error.message);
      throw error;
    }
  },

  // Maneja el inicio de sesión del usuario
  loginUser: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Inicio de sesión exitoso.");
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error.code, error.message);
      throw error;
    }
  },

  // Cierra la sesión del usuario
  signOutUser: async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada correctamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  },
};

export { authService };
