db.users.deleteOne({email: 'coordinador@test.ucn.cl'});

const newUser = {
  email: 'coordinador@test.ucn.cl',
  password_hash: '$2b$10$.fcV2z3DuIgNsOcbi/ZWleiXQIxLug1LdCCcjUt34VPuNGGF27M6q',
  nombreCompleto: 'Test Coordinador',
  roles: ['COORDINADOR'],
  isActive: true,
  additionalResponsibilities: {
    isDepartmentHead: false,
    isCareerHead: false,
    isDIDDECStaff: false,
    departmentIds: [],
    careerIds: []
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

db.users.insertOne(newUser);
print('Usuario completo creado');

const user = db.users.findOne({email: 'coordinador@test.ucn.cl'});
print('Usuario verificado:', JSON.stringify(user));
