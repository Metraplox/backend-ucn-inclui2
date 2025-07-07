db.users.updateOne(
  {email: 'coordinador@test.ucn.cl'}, 
  {$set: {password_hash: '$2b$10$.fcV2z3DuIgNsOcbi/ZWleiXQIxLug1LdCCcjUt34VPuNGGF27M6q'}}
);
print('Hash actualizado correctamente');

const user = db.users.findOne({email: 'coordinador@test.ucn.cl'});
print('Usuario verificado:', JSON.stringify(user));
