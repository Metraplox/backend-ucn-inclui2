// Script para crear usuario de test con credenciales correctas

db = db.getSiblingDB('ucn_inclui2_test');

print('🔧 Creando usuario de test para validación...');

try {
  // Eliminar usuario existente si existe
  db.users.deleteOne({ email: 'coordinador@test.ucn.cl' });
  
  // Crear usuario con credenciales del script de validación
  db.users.insertOne({
    _id: ObjectId('653000000000000000000001'),
    email: 'coordinador@test.ucn.cl',
    password_hash: '$2b$10$sF9KtRN0Gtwt/5YYQPuvPOr8KCDvP2eUDl4NLmS47d5MDGGleyz6e', // test123
    nombreCompleto: 'Usuario Test Coordinador',
    roles: ['COORDINADOR'],
    isActive: true,
    isProfileComplete: true,
    additionalResponsibilities: {
      isDepartmentHead: false,
      isCareerHead: false,
      isDIDDECStaff: false,
      departmentIds: [],
      careerIds: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ Usuario de test creado exitosamente:');
  print('   Email: coordinador@test.ucn.cl');
  print('   Password: test123');
  print('   Roles: COORDINADOR');
  
} catch (e) {
  print('❌ Error creando usuario: ' + e);
}
