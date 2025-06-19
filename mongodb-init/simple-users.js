// Script simple para crear usuarios de prueba
use ucn_inclui2_test;

// Insertar departamentos básicos
db.departments.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "Departamento de Ingeniería",
    code: "ING",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439012"),
    name: "Departamento de Educación",
    code: "EDU", 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insertar usuarios de prueba - password es 'Test123!' hasheado
db.users.insertMany([
  {
    email: "coordinadora@ucn.cl",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    roles: ["coordinadora"],
    isActive: true,
    profile: {
      firstName: "Coordinadora",
      lastName: "Test",
      rut: "12345678-9"
    },
    department: ObjectId("507f1f77bcf86cd799439011"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "educadora@ucn.cl", 
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    roles: ["educadora"],
    isActive: true,
    profile: {
      firstName: "Educadora",
      lastName: "Test", 
      rut: "87654321-0"
    },
    department: ObjectId("507f1f77bcf86cd799439012"),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "diddec@ucn.cl",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", 
    roles: ["diddec"],
    isActive: true,
    profile: {
      firstName: "DIDDEC",
      lastName: "Admin",
      rut: "11111111-1"
    },
    department: ObjectId("507f1f77bcf86cd799439011"),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✅ Usuarios de prueba creados exitosamente");
print("📧 Usuarios disponibles:");
print("   - coordinadora@ucn.cl (password: Test123!)");
print("   - educadora@ucn.cl (password: Test123!)");
print("   - diddec@ucn.cl (password: Test123!)"); 