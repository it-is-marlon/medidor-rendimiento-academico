import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
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

      // 2. Actualizar el perfil del usuario con el nombre
      await updateProfile(user, {
        displayName: name,
      });

      // 3. Enviar correo de verificación
      await sendEmailVerification(user);

      // 4. Crear el documento principal del usuario
      const mainUserRef = doc(db, `artifacts/${appId}/users/${user.uid}`);
      await setDoc(
        mainUserRef,
        {
          reconocible: "si",
        },
        { merge: true }
      );

      // 5. Crear el documento de datos detallado
      const profileDataRef = doc(
        db,
        `artifacts/${appId}/users/${user.uid}/profile/data`
      );
      await setDoc(profileDataRef, {
        name: name,
        email: email,
        role: role,
        userId: user.uid,
        reconocible: "si",
        emailVerified: false,
        createdAt: new Date(),
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

  // Envía un correo de restablecimiento de contraseña
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Correo de restablecimiento enviado.");
      return true;
    } catch (error) {
      console.error("Error al enviar correo de restablecimiento:", error);
      throw error;
    }
  },

  // Reenvía el correo de verificación
  resendEmailVerification: async () => {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        console.log("Correo de verificación reenviado.");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al reenviar correo de verificación:", error);
      throw error;
    }
  },

  // Verifica si el usuario tiene el email verificado
  checkEmailVerification: () => {
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  },

  // Recarga los datos del usuario actual
  reloadUser: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        return user;
      }
      return null;
    } catch (error) {
      console.error("Error al recargar datos del usuario:", error);
      throw error;
    }
  },
};

export { authService };
