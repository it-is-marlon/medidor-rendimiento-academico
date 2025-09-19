// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Importaciones de servicios locales
import { auth } from "./authService.js";

// Configuración global proporcionada por el entorno
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== "undefined" ? __firebase_config : "{}"
);
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// Inicializa la aplicación de Firebase y el servicio de Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Función que añade un nuevo registro de rendimiento a la base de datos.
 * La estructura de los datos se define aquí.
 * @param {string} userId - ID del usuario actual.
 * @param {string} studentId - ID del estudiante.
 * @param {object} recordData - Datos del registro (ej. { tipo: 'participación', valor: 1, fecha: new Date() }).
 */
export const addPerformanceRecord = async (userId, studentId, recordData) => {
  try {
    // La colección 'records' se almacena dentro de un sub-directorio para cada usuario.
    const recordsCollectionRef = collection(
      db,
      "artifacts",
      appId,
      "users",
      userId,
      "records"
    );
    await addDoc(recordsCollectionRef, {
      studentId: studentId,
      ...recordData,
      createdAt: new Date(),
    });
    console.log("Registro añadido con éxito.");
  } catch (error) {
    console.error("Error al añadir el registro:", error);
    throw error;
  }
};

/**
 * Función para obtener los registros de un estudiante en tiempo real.
 * Utiliza un listener en tiempo real de Firestore.
 * @param {string} userId - ID del usuario actual.
 * @param {string} studentId - ID del estudiante.
 * @param {function} onDataChange - Callback que se ejecuta cuando los datos cambian.
 * @returns {function} - Función para desuscribirse del listener.
 */
export const subscribeToStudentRecords = (userId, studentId, onDataChange) => {
  const recordsCollectionRef = collection(
    db,
    "artifacts",
    appId,
    "users",
    userId,
    "records"
  );
  const recordsQuery = query(
    recordsCollectionRef,
    where("studentId", "==", studentId)
  );

  // onSnapshot es el listener en tiempo real.
  const unsubscribe = onSnapshot(recordsQuery, (snapshot) => {
    const records = [];
    snapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    // Llama al callback con los nuevos datos.
    onDataChange(records);
  });

  return unsubscribe;
};

// Exportamos la instancia de Firestore para que otros servicios puedan usarla.
export { db };
