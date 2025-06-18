const { MongoClient, ObjectId } = require('mongodb');

// 🔧 CONFIGURACIÓN PARA HISTORIAL ACADÉMICO
const CONFIG = {
  mongodb: {
    uri: 'mongodb://localhost:27017',
    database: 'ucn_inclui2_test'
  },
  academic: {
    semesters: ['202502', '202510', '202520'], // Múltiples semestres
    grades: ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0'],
    statuses: ['Aprobado', 'Reprobado', 'Retirado', 'En Curso', 'Pendiente']
  }
};

// 📊 ESCALAS DE NOTAS UCN REALISTAS
const ESCALAS_NOTAS = {
  'Excelente': ['6.5', '7.0'],
  'Muy Bueno': ['6.0', '6.5'],
  'Bueno': ['5.0', '5.5', '6.0'],
  'Suficiente': ['4.0', '4.5', '5.0'],
  'Insuficiente': ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5']
};

// 📈 PATRONES DE RENDIMIENTO ACADÉMICO
const PATRONES_RENDIMIENTO = {
  'EXCELENTE_ESTUDIANTE': { promedioBase: 6.2, variacion: 0.4, probabilidadExito: 0.95 },
  'BUEN_ESTUDIANTE': { promedioBase: 5.5, variacion: 0.6, probabilidadExito: 0.85 },
  'ESTUDIANTE_PROMEDIO': { promedioBase: 4.8, variacion: 0.8, probabilidadExito: 0.75 },
  'ESTUDIANTE_EN_RIESGO': { promedioBase: 4.2, variacion: 1.0, probabilidadExito: 0.60 },
  'ESTUDIANTE_CON_DIFICULTADES': { promedioBase: 3.5, variacion: 1.2, probabilidadExito: 0.45 }
};

let client;

async function conectarBD() {
  try {
    client = new MongoClient(CONFIG.mongodb.uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB para historial académico');
    return client.db(CONFIG.mongodb.database);
  } catch (error) {
    console.error('❌ Error conectando a BD:', error);
    throw error;
  }
}

// 🎓 FUNCIÓN PRINCIPAL PARA POBLAR HISTORIAL ACADÉMICO
async function poblarHistorialAcademico() {
  const db = await conectarBD();
  
  console.log('\n📚 INICIANDO POBLADO DE HISTORIAL ACADÉMICO DETALLADO');
  console.log('====================================================');

  try {
    // 1️⃣ Obtener datos existentes
    console.log('\n📋 1. Cargando datos existentes...');
    const estudiantes = await db.collection('students').find({}).toArray();
    const cursos = await db.collection('courses').find({}).toArray();
    const inscripciones = await db.collection('enrollments').find({}).toArray();
    
    console.log(`   📊 ${estudiantes.length} estudiantes encontrados`);
    console.log(`   📊 ${cursos.length} cursos encontrados`);
    console.log(`   📊 ${inscripciones.length} inscripciones encontradas`);
    
    // 2️⃣ Generar historial académico por semestre
    console.log('\n📈 2. Generando historial académico...');
    await generarHistorialPorSemestre(db, estudiantes, cursos, inscripciones);
    
    // 3️⃣ Generar evaluaciones específicas
    console.log('\n📝 3. Generando evaluaciones específicas...');
    await generarEvaluacionesEspecificas(db, estudiantes, cursos);
    
    // 4️⃣ Poblar historial de ajustes académicos
    console.log('\n⚙️ 4. Generando historial de ajustes...');
    await poblarHistorialAjustes(db);
    
    // 5️⃣ Generar logs de sincronización
    console.log('\n🔄 5. Generando logs de sincronización...');
    await generarLogsSincronizacion(db);
    
    // 6️⃣ Estadísticas finales
    console.log('\n📊 6. Generando estadísticas finales...');
    await generarEstadisticasAcademicas(db);
    
    console.log('\n🎉 ¡HISTORIAL ACADÉMICO COMPLETADO EXITOSAMENTE!');
    console.log('=================================================');
    
  } catch (error) {
    console.error('❌ Error durante el poblado del historial:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Conexión cerrada');
    }
  }
}

// 📈 Generar historial académico por semestre
async function generarHistorialPorSemestre(db, estudiantes, cursos, inscripciones) {
  const historiales = [];
  
  for (const estudiante of estudiantes) {
    // Asignar patrón de rendimiento según si es NEE o no
    const patron = estudiante.esNEE ? 
      getRandomElement(['ESTUDIANTE_PROMEDIO', 'ESTUDIANTE_EN_RIESGO', 'BUEN_ESTUDIANTE']) :
      getRandomElement(['EXCELENTE_ESTUDIANTE', 'BUEN_ESTUDIANTE', 'ESTUDIANTE_PROMEDIO']);
    
    const rendimiento = PATRONES_RENDIMIENTO[patron];
    
    // Generar historial para semestres pasados
    for (const semestre of ['202502', '202510']) {
      const inscripcionesSemestre = inscripciones.filter(
        ins => ins.studentId.toString() === estudiante._id.toString()
      );
      
      for (const inscripcion of inscripcionesSemestre.slice(0, 4)) { // Max 4 cursos por semestre pasado
        const curso = cursos.find(c => c._id.toString() === inscripcion.courseId.toString());
        if (!curso) continue;
        
        const nota = generarNotaConPatron(rendimiento);
        const estado = parseFloat(nota) >= 4.0 ? 'Aprobado' : 'Reprobado';
        
        historiales.push({
          studentId: estudiante._id,
          courseId: inscripcion.courseId,
          semester: semestre,
          courseCode: curso.codigo || `CURSO_${Math.floor(Math.random() * 1000)}`,
          courseName: curso.asignatura || `Asignatura ${Math.floor(Math.random() * 1000)}`,
          finalGrade: nota,
          status: estado,
          credits: Math.floor(Math.random() * 4) + 3, // 3-6 créditos
          attempts: estado === 'Reprobado' && Math.random() < 0.3 ? 2 : 1,
          enrollmentDate: new Date(`${semestre.substring(0,4)}-${semestre.substring(4) === '10' ? '03' : '08'}-15`),
          completionDate: new Date(`${semestre.substring(0,4)}-${semestre.substring(4) === '10' ? '07' : '12'}-15`),
          observations: estudiante.esNEE && Math.random() < 0.4 ? 'Estudiante con NEE - Ajustes aplicados' : null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }
  
  if (historiales.length > 0) {
    const result = await db.collection('academichistories').insertMany(historiales);
    console.log(`   ✅ ${result.insertedCount} registros de historial académico creados`);
  }
}

// 📝 Generar evaluaciones específicas por curso
async function generarEvaluacionesEspecificas(db, estudiantes, cursos) {
  const evaluaciones = [];
  
  // Tipos de evaluaciones comunes en UCN
  const tiposEvaluacion = [
    'Prueba Parcial 1', 'Prueba Parcial 2', 'Prueba Parcial 3',
    'Examen Final', 'Proyecto Final', 'Laboratorio',
    'Tarea 1', 'Tarea 2', 'Tarea 3', 'Presentación Oral'
  ];
  
  for (const curso of cursos) {
    // Obtener estudiantes inscritos en este curso
    const inscripcionesToday = await db.collection('enrollments').find({ 
      courseId: curso._id 
    }).toArray();
    
    for (const inscripcion of inscripcionesToday) {
      const estudiante = estudiantes.find(e => e._id.toString() === inscripcion.studentId.toString());
      if (!estudiante) continue;
      
      // Generar 4-6 evaluaciones por curso
      const numEvaluaciones = Math.floor(Math.random() * 3) + 4;
      
      for (let i = 0; i < numEvaluaciones; i++) {
        const tipoEval = getRandomElement(tiposEvaluacion);
        const fechaEvaluacion = new Date();
        fechaEvaluacion.setDate(fechaEvaluacion.getDate() - Math.random() * 90); // Últimos 90 días
        
        // Estudiantes NEE pueden tener ajustes aplicados
        const tieneAjustes = estudiante.esNEE && Math.random() < 0.6;
        const notaBase = Math.random() * 3 + 4; // 4.0 - 7.0
        const notaFinal = tieneAjustes ? Math.min(notaBase + 0.3, 7.0) : notaBase;
        
        evaluaciones.push({
          studentId: estudiante._id,
          courseId: curso._id,
          evaluationType: tipoEval,
          evaluationDate: fechaEvaluacion,
          grade: parseFloat(notaFinal.toFixed(1)),
          maxGrade: 7.0,
          weight: Math.random() * 0.3 + 0.1, // 10% - 40% del curso
          hasAdjustments: tieneAjustes,
          adjustmentsApplied: tieneAjustes ? getRandomElements([
            'Tiempo adicional (50%)',
            'Sala separada',
            'Formato de letra aumentado',
            'Uso de calculadora'
          ], Math.floor(Math.random() * 2) + 1) : [],
          teacherComments: Math.random() < 0.3 ? generarComentarioDocente(notaFinal, tieneAjustes) : null,
          semester: '202510',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }
  
  if (evaluaciones.length > 0) {
    const result = await db.collection('evaluations').insertMany(evaluaciones);
    console.log(`   ✅ ${result.insertedCount} evaluaciones específicas creadas`);
  }
}

// ⚙️ Poblar historial detallado de ajustes académicos
async function poblarHistorialAjustes(db) {
  const ajustes = await db.collection('adjustments').find({}).toArray();
  const actualizaciones = [];
  
  for (const ajuste of ajustes) {
    // Generar historial de cambios para cada ajuste
    const cambiosHistoricos = [];
    const fechaCreacion = ajuste.createdAt || new Date();
    
    // Evento inicial: Solicitud creada
    cambiosHistoricos.push({
      type: 'Solicitud Inicial',
      status: 'pendiente',
      requestedBy: `${ajuste.studentRut}@alumnos.ucn.cl`,
      reviewedBy: 'coordinadora.inclusion@ucn.cl',
      timestamp: fechaCreacion,
      comments: 'Solicitud de ajuste académico presentada con documentación médica'
    });
    
    // Evento: Revisión por coordinador
    if (Math.random() < 0.9) { // 90% fueron revisados
      const fechaRevision = new Date(fechaCreacion);
      fechaRevision.setDate(fechaRevision.getDate() + Math.floor(Math.random() * 7) + 1);
      
      cambiosHistoricos.push({
        type: 'Evaluación Técnica',
        status: 'en_revision',
        requestedBy: `${ajuste.studentRut}@alumnos.ucn.cl`,
        reviewedBy: 'educadora.social@ucn.cl',
        timestamp: fechaRevision,
        comments: 'Evaluación de necesidades educativas especiales completada'
      });
    }
    
    // Evento: Aprobación/Rechazo
    if (Math.random() < 0.85) { // 85% fueron aprobados
      const fechaDecision = new Date(fechaCreacion);
      fechaDecision.setDate(fechaDecision.getDate() + Math.floor(Math.random() * 14) + 3);
      
      cambiosHistoricos.push({
        type: 'Decisión Final',
        status: 'aprobado',
        requestedBy: `${ajuste.studentRut}@alumnos.ucn.cl`,
        reviewedBy: 'coordinadora.inclusion@ucn.cl',
        timestamp: fechaDecision,
        comments: 'Ajuste académico aprobado. Notificación enviada a docentes correspondientes.'
      });
    }
    
    // Actualizar el ajuste con historial
    actualizaciones.push({
      updateOne: {
        filter: { _id: ajuste._id },
        update: { 
          $set: { 
            history: cambiosHistoricos,
            ultimaModificacion: new Date()
          }
        }
      }
    });
  }
  
  if (actualizaciones.length > 0) {
    await db.collection('adjustments').bulkWrite(actualizaciones);
    console.log(`   ✅ ${actualizaciones.length} ajustes actualizados con historial detallado`);
  }
}

// 🔄 Generar logs de sincronización realistas
async function generarLogsSincronizacion(db) {
  const logs = [];
  
  // Generar logs de los últimos 30 días
  for (let i = 0; i < 30; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    
    // Log diario de sincronización automática
    logs.push({
      operation: 'sincronizacion_automatica_estudiantes',
      status: 'success',
      startTime: fecha,
      endTime: new Date(fecha.getTime() + 5 * 60 * 1000), // 5 minutos después
      recordsProcessed: Math.floor(Math.random() * 20) + 140, // 140-160 estudiantes
      recordsSuccessful: Math.floor(Math.random() * 20) + 140,
      recordsFailed: Math.floor(Math.random() * 3), // 0-2 fallos
      errorMessages: Math.random() < 0.2 ? ['Timeout en API Hawaii', 'RUT duplicado detectado'] : [],
      semester: '202510',
      triggeredBy: 'SISTEMA_AUTOMATICO',
      metadata: {
        source: 'API_HAWAII_UCN',
        endpoint: '/estudiantes',
        version: 'v2.1'
      },
      createdAt: fecha,
      updatedAt: fecha
    });
    
    // Logs ocasionales de sincronización manual
    if (Math.random() < 0.3) { // 30% de días con sincronización manual
      logs.push({
        operation: 'sincronizacion_manual_cursos',
        status: Math.random() < 0.95 ? 'success' : 'error',
        startTime: new Date(fecha.getTime() + 3 * 60 * 60 * 1000), // 3 horas después
        endTime: new Date(fecha.getTime() + 3 * 60 * 60 * 1000 + 2 * 60 * 1000), // 2 minutos de duración
        recordsProcessed: Math.floor(Math.random() * 10) + 15, // 15-25 cursos
        recordsSuccessful: Math.floor(Math.random() * 10) + 15,
        recordsFailed: 0,
        errorMessages: [],
        semester: '202510',
        triggeredBy: 'coordinadora.inclusion@ucn.cl',
        metadata: {
          source: 'API_HAWAII_UCN',
          endpoint: '/cursos',
          version: 'v2.1'
        },
        createdAt: new Date(fecha.getTime() + 3 * 60 * 60 * 1000),
        updatedAt: new Date(fecha.getTime() + 3 * 60 * 60 * 1000)
      });
    }
  }
  
  const result = await db.collection('sync_logs').insertMany(logs);
  console.log(`   ✅ ${result.insertedCount} logs de sincronización creados`);
}

// 📊 Generar estadísticas académicas finales
async function generarEstadisticasAcademicas(db) {
  const stats = {
    academicHistory: await db.collection('academichistories').countDocuments(),
    evaluations: await db.collection('evaluations').countDocuments(),
    syncLogs: await db.collection('sync_logs').countDocuments(),
    studentsWithHistory: await db.collection('academichistories').distinct('studentId').then(arr => arr.length),
    coursesWithEvaluations: await db.collection('evaluations').distinct('courseId').then(arr => arr.length),
    successfulSyncs: await db.collection('sync_logs').countDocuments({ status: 'success' }),
    failedSyncs: await db.collection('sync_logs').countDocuments({ status: 'error' })
  };
  
  console.log('\n📊 ESTADÍSTICAS DE HISTORIAL ACADÉMICO:');
  console.log('=======================================');
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`📈 ${key}: ${value}`);
  });
  
  // Estadísticas específicas NEE
  const neeStats = await generarEstadisticasNEE(db);
  console.log('\n🎯 ESTADÍSTICAS ESPECÍFICAS NEE:');
  console.log('================================');
  Object.entries(neeStats).forEach(([key, value]) => {
    console.log(`📊 ${key}: ${value}`);
  });
}

// 🎯 Generar estadísticas específicas de estudiantes NEE
async function generarEstadisticasNEE(db) {
  const neeStudents = await db.collection('students').find({ esNEE: true }).toArray();
  const neeIds = neeStudents.map(s => s._id);
  
  return {
    estudiantesNEEConHistorial: await db.collection('academichistories').distinct('studentId', { studentId: { $in: neeIds } }).then(arr => arr.length),
    evaluacionesConAjustes: await db.collection('evaluations').countDocuments({ hasAdjustments: true }),
    ajustesActivos: await db.collection('adjustments').countDocuments(),
    documentosValidados: await db.collection('documents').countDocuments({ validado: true }),
    consentimientosOtorgados: await db.collection('consents').countDocuments({ hasConsent: true }),
    notificacionesPendientes: await db.collection('notifications').countDocuments({ read: false })
  };
}

// 🛠️ FUNCIONES AUXILIARES
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generarNotaConPatron(patron) {
  const nota = Math.max(1.0, Math.min(7.0, 
    patron.promedioBase + (Math.random() - 0.5) * patron.variacion * 2
  ));
  return parseFloat(nota.toFixed(1));
}

function generarComentarioDocente(nota, tieneAjustes) {
  const comentarios = {
    excelente: ['Excelente desempeño', 'Destaca en la asignatura', 'Muy buen nivel académico'],
    bueno: ['Buen nivel de comprensión', 'Progreso satisfactorio', 'Cumple con los objetivos'],
    regular: ['Necesita reforzar conceptos', 'Debe aumentar dedicación', 'Progreso lento pero constante'],
    deficiente: ['Requiere apoyo adicional', 'Dificultades importantes', 'Necesita plan de mejora']
  };
  
  let categoria = 'regular';
  if (nota >= 6.0) categoria = 'excelente';
  else if (nota >= 5.0) categoria = 'bueno';
  else if (nota < 4.0) categoria = 'deficiente';
  
  let comentario = getRandomElement(comentarios[categoria]);
  
  if (tieneAjustes) {
    comentario += '. Ajustes académicos aplicados correctamente';
  }
  
  return comentario;
}

// 🚀 EJECUTAR SCRIPT
if (require.main === module) {
  poblarHistorialAcademico()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { poblarHistorialAcademico };