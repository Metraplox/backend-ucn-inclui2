async function testApi() {
  const baseUrl = 'http://localhost:3000';

  const usersToCreate = [
    { email: 'admin.script@example.com', password: 'passwordAdmin123', nombreCompleto: 'Admin Script', roles: ['administrador'] },
    { email: 'staff.script@example.com', password: 'passwordStaff123', nombreCompleto: 'Staff Script', roles: ['personal'] },
    { email: 'teacher.script@example.com', password: 'passwordTeacher123', nombreCompleto: 'Teacher Script', roles: ['docente'] },
    { email: 'student.script@example.com', password: 'passwordScript123', nombreCompleto: 'Student Script Test', roles: ['estudiante'] },
    { email: 'student2.script@example.com', password: 'passwordStudent2', nombreCompleto: 'Student Two Script', roles: ['estudiante'] },
  ];

  const createdUsers = {}; 
  const createdStudents = {}; 

  console.log('--- Fase 1: Creación/Login de Usuarios ---');
  for (const userData of usersToCreate) {
    console.log(`\nProcesando usuario: ${userData.email}`);
    try {
      let registerResponse = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      let registerData = await registerResponse.json();
      console.log(`Registro de ${userData.email}: Status ${registerResponse.status}`);
      
      if (!registerResponse.ok && registerData.statusCode === 409) {
        console.log(`Usuario ${userData.email} ya existe, intentando login.`);
      } else if (!registerResponse.ok) {
        console.error(`Error al registrar ${userData.email}. Respuesta: ${JSON.stringify(registerData)}`);
        continue;
      }
      
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, password: userData.password }),
      });
      const loginData = await loginResponse.json();
      console.log(`Login de ${userData.email}: Status ${loginResponse.status}`);
      
      if (loginResponse.ok && loginData.access_token) {
        console.log(`Token obtenido para ${userData.email}`);
        createdUsers[userData.email] = { ...loginData.user, token: loginData.access_token };
      } else {
        console.error(`Error al iniciar sesión con ${userData.email}. Respuesta: ${JSON.stringify(loginData)}`);
      }
    } catch (error) {
      console.error(`Error procesando usuario ${userData.email}:`, error);
    }
  }

  console.log('\n--- Resumen de Usuarios con Token ---');
  for (const email in createdUsers) {
    if (createdUsers[email]) {
        console.log(`${email}: UserID ${createdUsers[email]._id}, Token: ${createdUsers[email].token ? 'Sí' : 'No'}`);
    }
  }

  const adminUser = createdUsers['admin.script@example.com'];
  if (adminUser && adminUser.token) {
    const adminToken = adminUser.token;
    console.log('\n--- Fase 2: Creación/Obtención de Estudiantes (como Admin) ---');

    const studentsToProcess = [
      { nombres: 'Student', apellidos: 'Script Test', rut: '11111111-1', email: 'student.script@example.com', carrera: 'Ingeniería Informática', fechaNacimiento: '2000-01-01T00:00:00.000Z' },
      { nombres: 'Student Two', apellidos: 'Script', rut: '22222222-2', email: 'student2.script@example.com', carrera: 'Ingeniería Civil', fechaNacimiento: '2001-02-02T00:00:00.000Z' },
    ];

    for (const studentData of studentsToProcess) {
      console.log(`\nProcesando perfil de estudiante para: ${studentData.email}`);
      try {
        let studentProfile;
        const createStudentResponse = await fetch(`${baseUrl}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
          body: JSON.stringify(studentData),
        });
        studentProfile = await createStudentResponse.json();
        console.log(`Intento de Creación de Student ${studentData.email}: Status ${createStudentResponse.status}`);
        
        if (createStudentResponse.ok) {
            console.log(`Student ${studentData.email} creado exitosamente.`);
            createdStudents[studentData.email] = studentProfile;
        } else if (createStudentResponse.status === 500 && studentProfile.message === "Internal server error") {
            console.log(`Creación de Student ${studentData.email} falló (posiblemente ya existe), intentando obtenerlo...`);
            const listStudentsResponse = await fetch(`${baseUrl}/students`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${adminToken}` },
            });
            const allStudents = await listStudentsResponse.json();
            if (listStudentsResponse.ok) {
                const existingStudent = allStudents.find(s => s.rut === studentData.rut || s.email === studentData.email);
                if (existingStudent) {
                    console.log(`Student ${studentData.email} encontrado existente.`);
                    createdStudents[studentData.email] = existingStudent;
                } else {
                    console.error(`Student ${studentData.email} no pudo ser creado ni encontrado tras fallo.`);
                }
            } else {
                 console.error(`Error listando estudiantes para encontrar ${studentData.email}.`);
            }
        } else {
            console.error(`Error creando Student ${studentData.email}: ${JSON.stringify(studentProfile)}`);
        }
      } catch (error) {
        console.error(`Error procesando perfil de estudiante para ${studentData.email}:`, error);
      }
    }
  } else {
    console.log('\nNo se pudo obtener token de admin, omitiendo creación/obtención de estudiantes.');
  }

  if (adminUser && adminUser.token) {
    console.log('\n--- Fase 3: Listar Usuarios (como Admin) ---');
    try {
      const listUsersResponse = await fetch(`${baseUrl}/users`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminUser.token}` },
      });
      const listUsersData = await listUsersResponse.json();
      console.log(`Listar Usuarios: Status ${listUsersResponse.status}`);
      // console.log('Usuarios listados:', JSON.stringify(listUsersData, null, 2)); 
    } catch (error) {
      console.error('Error listando usuarios:', error);
    }
  }

  const staffUser = createdUsers['staff.script@example.com'];
  const student1ForAdjustment = createdStudents['student.script@example.com'];

  if (staffUser && staffUser.token && student1ForAdjustment && student1ForAdjustment.rut) {
    console.log(`\n--- Fase 4: Creación de Ajuste Razonable (como Staff para ${student1ForAdjustment.email}) ---`);
    const adjustmentPayload = {
      studentRut: student1ForAdjustment.rut,
      currentAdjustments: [
        {
          type: 'Tiempo adicional para exámenes',
          courseNrc: 'NRC12345', // Ejemplo
          approvedBy: staffUser._id, // ID del usuario staff
          approvedAt: new Date().toISOString(),
          requiresSemesterConfirmation: true,
          expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Expira en 1 año
        }
      ]
    };
    try {
      const createAdjustmentResponse = await fetch(`${baseUrl}/adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${staffUser.token}` },
        body: JSON.stringify(adjustmentPayload),
      });
      const createAdjustmentData = await createAdjustmentResponse.json();
      console.log(`Creación de Ajuste: Status ${createAdjustmentResponse.status}`);
      console.log('Ajuste Creado/Respuesta:', JSON.stringify(createAdjustmentData, null, 2));
    } catch (error) {
      console.error('Error creando ajuste:', error);
    }
  } else {
    let reason = [];
    if (!staffUser || !staffUser.token) reason.push("token de staff no disponible");
    if (!student1ForAdjustment) reason.push("perfil de student.script@example.com no encontrado/creado");
    if (student1ForAdjustment && !student1ForAdjustment.rut) reason.push("RUT del estudiante no disponible");
    console.log(`\nOmitiendo creación de ajuste. Razones: ${reason.join(', ')}.`);
  }
  
  console.log('\n--- Resumen Final de Usuarios y Estudiantes Procesados ---');
   for (const email in createdUsers) {
    if(!createdUsers[email]) continue;
    console.log(`Usuario: ${email}, UserID: ${createdUsers[email]._id}`);
    if (createdStudents[email]) {
        console.log(`  Perfil Estudiante: StudentID ${createdStudents[email]._id}, RUT: ${createdStudents[email].rut}`);
    }
  }

  console.log('\n--- Script de prueba finalizado ---');
}

testApi();
