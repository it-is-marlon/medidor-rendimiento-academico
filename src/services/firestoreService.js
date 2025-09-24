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
  startAfter,
  writeBatch,
} from "firebase/firestore";
import { db, appId } from "./firebaseConfig";

// Servicio de Firestore
const firestoreService = {
  // ===== FUNCIONES DE USUARIOS =====
  
  // Obtiene el perfil de un usuario específico
  getUserProfile: async (userId) => {
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  // Obtiene todos los usuarios y sus perfiles en tiempo real
  getUsersListener: (callback) => {
    const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
    return onSnapshot(usersCollectionRef, async (snapshot) => {
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
          return null;
        }
      });
      const profiles = await Promise.all(profilePromises);
      const validProfiles = profiles.filter((profile) => profile !== null);
      callback(validProfiles);
    });
  },

  // Actualiza el perfil de un usuario
  updateUserProfile: async (userId, dataToUpdate) => {
    const userRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
    await updateDoc(userRef, {
      ...dataToUpdate,
      updatedAt: new Date()
    });
  },

  // Elimina el perfil de un usuario de Firestore
  deleteUserProfile: async (userId) => {
    const userRef = doc(db, `artifacts/${appId}/users/${userId}/profile/data`);
    await deleteDoc(userRef);
  },

  // ===== FUNCIONES DE CURSOS =====

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
      createdAt: new Date(),
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
    await updateDoc(courseRef, {
      ...dataToUpdate,
      updatedAt: new Date()
    });
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

  // ===== FUNCIONES DE ESTUDIANTES =====

  // Crea un nuevo estudiante
  createStudent: async (studentData) => {
    const studentsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/students`
    );
    return await addDoc(studentsCollectionRef, {
      name: studentData.name,
      parentEmail: studentData.parentEmail,
      photoUrl: studentData.photoUrl || 'https://via.placeholder.com/150?text=Estudiante',
      courseIds: studentData.courseIds || [],
      createdAt: new Date(),
      reconocible: "si",
      ...studentData
    });
  },

  // Crea múltiples estudiantes por lotes
  createBulkStudents: async (studentsData) => {
    const batch = writeBatch(db);
    const studentsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/students`
    );

    const results = [];
    for (const studentData of studentsData) {
      const studentRef = doc(studentsCollectionRef);
      batch.set(studentRef, {
        name: studentData.name,
        parentEmail: studentData.parentEmail,
        photoUrl: studentData.photoUrl || 'https://via.placeholder.com/150?text=Estudiante',
        courseIds: studentData.courseIds || [],
        createdAt: new Date(),
        reconocible: "si",
        ...studentData
      });
      results.push({ id: studentRef.id, ...studentData });
    }

    await batch.commit();
    return results;
  },

  // Obtiene todos los estudiantes en tiempo real
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

  // Obtiene estudiantes paginados
  getStudentsPaginated: async (limitCount = 20, lastDoc = null) => {
    let q = query(
      collection(db, `artifacts/${appId}/public/data/students`),
      orderBy("name"),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      _doc: doc // Para paginación
    }));

    return {
      students,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === limitCount
    };
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

  // Busca estudiantes por nombre
  searchStudentsByName: async (searchTerm) => {
    const studentsRef = collection(db, `artifacts/${appId}/public/data/students`);
    const snapshot = await getDocs(studentsRef);
    
    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return students.filter(student => 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // Actualiza los datos de un estudiante
  updateStudentProfile: async (studentId, dataToUpdate) => {
    const studentRef = doc(
      db,
      `artifacts/${appId}/public/data/students`,
      studentId
    );
    await updateDoc(studentRef, {
      ...dataToUpdate,
      updatedAt: new Date()
    });
  },

  // Elimina el perfil de un estudiante
  deleteStudentProfile: async (studentId) => {
    await deleteDoc(
      doc(db, `artifacts/${appId}/public/data/students`, studentId)
    );
  },

  // Asigna un estudiante a un curso
  assignStudentToCourse: async (studentId, courseId) => {
    const studentRef = doc(db, `artifacts/${appId}/public/data/students`, studentId);
    await updateDoc(studentRef, {
      courseIds: arrayUnion(courseId),
      updatedAt: new Date()
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

  // Obtiene registros con filtros avanzados
  getRecordsWithFilters: async (filters) => {
    let q = collection(db, `artifacts/${appId}/public/data/records`);

    // Aplicar filtros
    const constraints = [];

    if (filters.courseId) {
      constraints.push(where("courseId", "==", filters.courseId));
    }
    if (filters.studentId) {
      constraints.push(where("studentId", "==", filters.studentId));
    }
    if (filters.teacherId) {
      constraints.push(where("teacherId", "==", filters.teacherId));
    }
    if (filters.type && filters.type !== 'all') {
      constraints.push(where("type", "==", filters.type));
    }

    // Ordenar por timestamp
    constraints.push(orderBy("timestamp", "desc"));

    // Limitar resultados
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }

    q = query(q, ...constraints);

    const snapshot = await getDocs(q);
    let records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtros adicionales que no se pueden hacer en Firestore
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      records = records.filter(record => {
        const recordDate = record.timestamp?.toDate?.() || new Date(record.timestamp);
        return recordDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      records = records.filter(record => {
        const recordDate = record.timestamp?.toDate?.() || new Date(record.timestamp);
        return recordDate <= toDate;
      });
    }

    if (filters.minValue) {
      records = records.filter(record => record.value >= parseInt(filters.minValue));
    }

    if (filters.maxValue) {
      records = records.filter(record => record.value <= parseInt(filters.maxValue));
    }

    return records;
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
    await updateDoc(recordRef, {
      ...dataToUpdate,
      updatedAt: new Date()
    });
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
    const batch = writeBatch(db);
    const recordsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/records`
    );

    const results = [];
    for (const studentId of studentIds) {
      const recordRef = doc(recordsCollectionRef);
      const newRecord = {
        studentId: studentId,
        courseId: courseId,
        teacherId: teacherId,
        type: type,
        value: value,
        note: note,
        timestamp: new Date(),
        createdAt: new Date(),
        reconocible: "si",
      };
      
      batch.set(recordRef, newRecord);
      results.push({ id: recordRef.id, ...newRecord });
    }

    await batch.commit();
    return results;
  },

  // ===== FUNCIONES DE ESTADÍSTICAS =====

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

  // Obtiene estadísticas globales de la institución
  getGlobalStats: async () => {
    try {
      const [studentsSnapshot, coursesSnapshot, recordsSnapshot] = await Promise.all([
        getDocs(collection(db, `artifacts/${appId}/public/data/students`)),
        getDocs(collection(db, `artifacts/${appId}/public/data/courses`)),
        getDocs(query(
          collection(db, `artifacts/${appId}/public/data/records`),
          orderBy("timestamp", "desc"),
          limit(1000) // Últimos 1000 registros para estadísticas
        ))
      ]);

      const totalStudents = studentsSnapshot.size;
      const totalCourses = coursesSnapshot.size;
      const totalRecords = recordsSnapshot.size;

      const records = recordsSnapshot.docs.map(doc => doc.data());

      // Calcular promedios globales
      const globalStats = {
        participacion: { total: 0, count: 0, average: 0 },
        comportamiento: { total: 0, count: 0, average: 0 },
        puntualidad: { total: 0, count: 0, average: 0 },
      };

      records.forEach(record => {
        if (globalStats[record.type]) {
          globalStats[record.type].total += record.value;
          globalStats[record.type].count += 1;
        }
      });

      Object.keys(globalStats).forEach(type => {
        if (globalStats[type].count > 0) {
          globalStats[type].average = globalStats[type].total / globalStats[type].count;
        }
      });

      // Estudiantes por rendimiento
      const studentPerformance = {
        excelente: 0, // promedio >= 4.5
        destacado: 0, // promedio >= 3.5
        satisfactorio: 0, // promedio >= 2.5
        necesitaApoyo: 0 // promedio < 2.5
      };

      // Calcular rendimiento por estudiante
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      for (const student of studentsData) {
        const studentRecordsQuery = query(
          collection(db, `artifacts/${appId}/public/data/records`),
          where("studentId", "==", student.id)
        );
        
        try {
          const studentRecordsSnapshot = await getDocs(studentRecordsQuery);
          const studentRecords = studentRecordsSnapshot.docs.map(doc => doc.data());
          
          if (studentRecords.length > 0) {
            const totalValue = studentRecords.reduce((sum, record) => sum + record.value, 0);
            const average = totalValue / studentRecords.length;
            
            if (average >= 4.5) studentPerformance.excelente++;
            else if (average >= 3.5) studentPerformance.destacado++;
            else if (average >= 2.5) studentPerformance.satisfactorio++;
            else studentPerformance.necesitaApoyo++;
          }
        } catch (error) {
          console.error(`Error calculando rendimiento para estudiante ${student.id}:`, error);
        }
      }

      return {
        totals: {
          students: totalStudents,
          courses: totalCourses,
          records: totalRecords
        },
        averages: globalStats,
        studentPerformance
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas globales:", error);
      throw error;
    }
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
            const allRecordsQuery = query(
              collection(db, `artifacts/${appId}/public/data/records`),
              where("studentId", "==", student.id)
            );

            const recordsSnapshot = await getDocs(allRecordsQuery);
            const totalRecords = recordsSnapshot.size;

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
      const studentStats = await firestoreService.getStudentStats(
        studentId,
        courseId
      );

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