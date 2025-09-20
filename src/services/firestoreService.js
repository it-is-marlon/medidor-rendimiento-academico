import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  arrayUnion,
  updateDoc,
  getDocs,
  deleteDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, appId } from "./firebaseConfig";

// Servicio de Firestore
const firestoreService = {
  // Obtiene el perfil de un usuario específico
  getUserProfile: async (userId) => {
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  // Obtiene todos los usuarios y sus perfiles en tiempo real de forma robusta
  getUsersListener: (callback) => {
    const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
    return onSnapshot(usersCollectionRef, async (snapshot) => {
      // Usamos Promise.all para obtener todos los perfiles en paralelo
      const profilePromises = snapshot.docs.map(async (userDoc) => {
        try {
          const profileSnap = await getDoc(doc(userDoc.ref, "profile/data"));
          if (profileSnap.exists()) {
            return {
              id: userDoc.id,
              ...profileSnap.data(),
            };
          }
        } catch (error) {
          console.error(
            `Error al obtener el perfil para el usuario con ID ${userDoc.id}:`,
            error
          );
          return null; // Devolvemos null para filtrar los perfiles que no se pudieron obtener
        }
      });
      // Esperamos a que todas las promesas se resuelvan
      const profiles = await Promise.all(profilePromises);
      // Filtramos los perfiles nulos
      const validProfiles = profiles.filter((profile) => profile !== null);
      callback(validProfiles);
    });
  },

  // Actualiza el perfil de un usuario
  updateUserProfile: async (userId, dataToUpdate) => {
    const userRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
    await updateDoc(userRef, dataToUpdate);
  },

  // Elimina el perfil de un usuario de Firestore
  deleteUserProfile: async (userId) => {
    const userRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
    await deleteDoc(userRef);
  },

  // Crea un nuevo curso para un docente
  createCourse: async (name, teacherId) => {
    const coursesCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/courses`
    );
    await addDoc(coursesCollectionRef, {
      name: name,
      teacherId: teacherId,
      studentIds: [],
      // CAMBIO: Asegura que el documento exista
      reconocible: "si",
    });
  },

  // Actualiza los datos de un curso
  updateCourse: async (courseId, dataToUpdate) => {
    const courseRef = doc(
      db,
      `artifacts/${appId}/public/data/courses`,
      courseId
    );
    await updateDoc(courseRef, dataToUpdate);
  },

  // Obtiene todos los cursos en tiempo real
  getCoursesListener: (callback) => {
    const coursesCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/courses`
    );
    return onSnapshot(coursesCollectionRef, (snapshot) => {
      const coursesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(coursesList);
    });
  },

  // Elimina un curso específico de la base de datos
  deleteCourse: async (courseId) => {
    await deleteDoc(
      doc(db, `artifacts/${appId}/public/data/courses`, courseId)
    );
  },

  // Obtiene todos los alumnos de la base de datos en tiempo real
  getStudentsListener: (callback) => {
    const studentsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/students`
    );
    return onSnapshot(studentsCollectionRef, (snapshot) => {
      const studentsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(studentsList);
    });
  },

  // Obtiene estudiantes por el email del apoderado
  getStudentsByParentEmail: (parentEmail, callback) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/students`),
      where("parentEmail", "==", parentEmail)
    );
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(students);
    });
  },

  // Obtiene estudiantes de un curso específico
  getStudentsByCourse: (courseId, callback) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/students`),
      where("courseIds", "array-contains", courseId)
    );
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(students);
    });
  },

  // Actualiza los datos de un alumno
  updateStudentProfile: async (studentId, dataToUpdate) => {
    const studentRef = doc(
      db,
      `artifacts/${appId}/public/data/students`,
      studentId
    );
    await updateDoc(studentRef, dataToUpdate);
  },

  // Elimina el perfil de un alumno de la base de datos de Firestore
  deleteStudentProfile: async (studentId) => {
    await deleteDoc(
      doc(db, `artifacts/${appId}/public/data/students`, studentId)
    );
  },

  // Obtiene los cursos de un docente específico
  getTeacherCourses: (teacherId, callback) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/courses`),
      where("teacherId", "==", teacherId)
    );
    return onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(courses);
    });
  },

  // ===== FUNCIONES PARA REGISTROS DE RENDIMIENTO =====

  // Crea un nuevo registro de rendimiento
  createRecord: async (
    studentId,
    courseId,
    teacherId,
    type,
    value,
    note = ""
  ) => {
    const recordsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/records`
    );
    const newRecord = {
      studentId: studentId,
      courseId: courseId,
      teacherId: teacherId,
      type: type, // "participacion", "comportamiento", "puntualidad"
      value: value, // 1-5 escala
      note: note,
      timestamp: new Date(),
      createdAt: new Date(),
      // CAMBIO: Asegura que el documento exista
      reconocible: "si",
    };

    return await addDoc(recordsCollectionRef, newRecord);
  },

  // Obtiene registros por curso en tiempo real
  getRecordsByCourse: (courseId, callback) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/records`),
      where("courseId", "==", courseId),
      orderBy("timestamp", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(records);
    });
  },

  // Obtiene registros por estudiante
  getRecordsByStudent: (studentId, callback) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/records`),
      where("studentId", "==", studentId),
      orderBy("timestamp", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(records);
    });
  },

  // Obtiene registros por estudiante y curso
  getRecordsByStudentAndCourse: (studentId, courseId, callback) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/records`),
      where("studentId", "==", studentId),
      where("courseId", "==", courseId),
      orderBy("timestamp", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(records);
    });
  },

  // Actualiza un registro específico
  updateRecord: async (recordId, dataToUpdate) => {
    const recordRef = doc(
      db,
      `artifacts/${appId}/public/data/records`,
      recordId
    );
    await updateDoc(recordRef, dataToUpdate);
  },

  // Elimina un registro específico
  deleteRecord: async (recordId) => {
    await deleteDoc(
      doc(db, `artifacts/${appId}/public/data/records`, recordId)
    );
  },

  // Crea registros por lotes (múltiples estudiantes)
  createBulkRecords: async (
    studentIds,
    courseId,
    teacherId,
    type,
    value,
    note = ""
  ) => {
    const recordsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/records`
    );

    const promises = studentIds.map((studentId) => {
      const newRecord = {
        studentId: studentId,
        courseId: courseId,
        teacherId: teacherId,
        type: type,
        value: value,
        note: note,
        timestamp: new Date(),
        createdAt: new Date(),
        // CAMBIO: Asegura que el documento exista
        reconocible: "si",
      };
      return addDoc(recordsCollectionRef, newRecord);
    });

    return await Promise.all(promises);
  },

  // Obtiene estadísticas del curso (promedios por categoría)
  getCourseStats: async (courseId) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/records`),
      where("courseId", "==", courseId)
    );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((doc) => doc.data());

    // Calcular estadísticas por categoría
    const stats = {
      participacion: { total: 0, count: 0, average: 0 },
      comportamiento: { total: 0, count: 0, average: 0 },
      puntualidad: { total: 0, count: 0, average: 0 },
    };

    records.forEach((record) => {
      if (stats[record.type]) {
        stats[record.type].total += record.value;
        stats[record.type].count += 1;
      }
    });

    // Calcular promedios
    Object.keys(stats).forEach((type) => {
      if (stats[type].count > 0) {
        stats[type].average = stats[type].total / stats[type].count;
      }
    });

    return stats;
  },

  // Obtiene estadísticas de un estudiante en un curso
  getStudentStats: async (studentId, courseId) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/records`),
      where("studentId", "==", studentId),
      where("courseId", "==", courseId)
    );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((doc) => doc.data());

    // Calcular estadísticas por categoría
    const stats = {
      participacion: { total: 0, count: 0, average: 0 },
      comportamiento: { total: 0, count: 0, average: 0 },
      puntualidad: { total: 0, count: 0, average: 0 },
    };

    records.forEach((record) => {
      if (stats[record.type]) {
        stats[record.type].total += record.value;
        stats[record.type].count += 1;
      }
    });

    // Calcular promedios
    Object.keys(stats).forEach((type) => {
      if (stats[type].count > 0) {
        stats[type].average = stats[type].total / stats[type].count;
      }
    });

    return stats;
  },

  // ===== FUNCIONES ESPECÍFICAS PARA APODERADOS =====

  // Obtiene estudiantes asociados a un apoderado con más detalles
  getStudentsWithDetailsForParent: (parentEmail, callback) => {
    const q = query(
      collection(db, `artifacts/${appId}/public/data/students`),
      where("parentEmail", "==", parentEmail)
    );

    return onSnapshot(q, async (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Enriquecer con información adicional de cada estudiante
      const studentsWithDetails = await Promise.all(
        students.map(async (student) => {
          try {
            // Obtener estadísticas generales del estudiante
            const allRecordsQuery = query(
              collection(db, `artifacts/${appId}/public/data/records`),
              where("studentId", "==", student.id)
            );

            const recordsSnapshot = await getDocs(allRecordsQuery);
            const totalRecords = recordsSnapshot.size;

            // Calcular promedio general
            let totalValue = 0;
            let recordCount = 0;

            recordsSnapshot.docs.forEach((doc) => {
              const record = doc.data();
              totalValue += record.value;
              recordCount++;
            });

            const generalAverage =
              recordCount > 0 ? totalValue / recordCount : 0;

            return {
              ...student,
              totalRecords,
              generalAverage: parseFloat(generalAverage.toFixed(1)),
            };
          } catch (error) {
            console.error(
              `Error obteniendo detalles para estudiante ${student.id}:`,
              error
            );
            return {
              ...student,
              totalRecords: 0,
              generalAverage: 0,
            };
          }
        })
      );

      callback(studentsWithDetails);
    });
  },

  // Obtiene el resumen de rendimiento de un estudiante para el apoderado
  getStudentSummaryForParent: async (studentId) => {
    try {
      const q = query(
        collection(db, `artifacts/${appId}/public/data/records`),
        where("studentId", "==", studentId),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Agrupar por curso
      const recordsByCourse = {};
      records.forEach((record) => {
        if (!recordsByCourse[record.courseId]) {
          recordsByCourse[record.courseId] = [];
        }
        recordsByCourse[record.courseId].push(record);
      });

      // Calcular estadísticas por curso
      const coursesSummary = {};
      Object.keys(recordsByCourse).forEach((courseId) => {
        const courseRecords = recordsByCourse[courseId];

        const stats = {
          participacion: { total: 0, count: 0, average: 0 },
          comportamiento: { total: 0, count: 0, average: 0 },
          puntualidad: { total: 0, count: 0, average: 0 },
        };

        courseRecords.forEach((record) => {
          if (stats[record.type]) {
            stats[record.type].total += record.value;
            stats[record.type].count += 1;
          }
        });

        // Calcular promedios
        Object.keys(stats).forEach((type) => {
          if (stats[type].count > 0) {
            stats[type].average = stats[type].total / stats[type].count;
          }
        });

        coursesSummary[courseId] = {
          totalRecords: courseRecords.length,
          stats,
          lastUpdate: courseRecords[0]?.timestamp || null,
        };
      });

      return {
        totalRecords: records.length,
        recordsByCourse: recordsByCourse,
        coursesSummary,
      };
    } catch (error) {
      console.error("Error obteniendo resumen del estudiante:", error);
      return null;
    }
  },

  // Obtiene registros recientes de todos los hijos de un apoderado
  getRecentRecordsForParent: (parentEmail, limitRecords = 20, callback) => {
    // Primero obtener los estudiantes del apoderado
    const studentsQuery = query(
      collection(db, `artifacts/${appId}/public/data/students`),
      where("parentEmail", "==", parentEmail)
    );

    return onSnapshot(studentsQuery, async (studentsSnapshot) => {
      const studentIds = studentsSnapshot.docs.map((doc) => doc.id);

      if (studentIds.length === 0) {
        callback([]);
        return;
      }

      // Obtener registros recientes de todos los estudiantes
      try {
        const recordsPromises = studentIds.map(async (studentId) => {
          const recordsQuery = query(
            collection(db, `artifacts/${appId}/public/data/records`),
            where("studentId", "==", studentId),
            orderBy("timestamp", "desc"),
            limit(Math.ceil(limitRecords / studentIds.length))
          );

          const recordsSnapshot = await getDocs(recordsQuery);
          return recordsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        });

        const allRecordsArrays = await Promise.all(recordsPromises);
        const allRecords = allRecordsArrays
          .flat()
          .sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(0);
            const timeB = b.timestamp?.toDate?.() || new Date(0);
            return timeB - timeA;
          })
          .slice(0, limitRecords);

        callback(allRecords);
      } catch (error) {
        console.error("Error obteniendo registros recientes:", error);
        callback([]);
      }
    });
  },

  // Obtiene estadísticas comparativas de un estudiante vs su curso
  getComparativeStats: async (studentId, courseId) => {
    try {
      // Estadísticas del estudiante - usar this en lugar de firestoreService
      const studentStats = await firestoreService.getStudentStats(
        studentId,
        courseId
      );

      // Estadísticas del curso - usar this en lugar de firestoreService
      const courseStats = await firestoreService.getCourseStats(courseId);

      // Calcular comparaciones
      const comparisons = {};
      ["participacion", "comportamiento", "puntualidad"].forEach((type) => {
        const studentAvg = studentStats[type]?.average || 0;
        const courseAvg = courseStats[type]?.average || 0;
        const difference = studentAvg - courseAvg;

        let status = "en-linea";
        if (Math.abs(difference) >= 0.2) {
          status = difference > 0 ? "sobre-promedio" : "necesita-apoyo";
        }

        comparisons[type] = {
          studentAverage: studentAvg,
          courseAverage: courseAvg,
          difference: difference,
          status: status,
          studentCount: studentStats[type]?.count || 0,
        };
      });

      return comparisons;
    } catch (error) {
      console.error("Error obteniendo estadísticas comparativas:", error);
      return null;
    }
  },
};

export { firestoreService };
