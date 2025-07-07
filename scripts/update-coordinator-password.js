// Script para actualizar password del usuario coordinadora
db = db.getSiblingDB('ucn_inclui2_test');

print('🔄 Actualizando password del usuario coordinadora...');

const newHash = '$2b$10$c3mrC9LUR0n84z1xp1Sao.abB/kb0dhn6r/Agfqbubum4IQ0Q.iBa'; // Test123!

const result = db.users.updateOne(
  { email: 'coordinadora@ucn.cl' },
  { $set: { password_hash: newHash } }
);

print('Resultado:', result);

// Verificar que se actualizó
const user = db.users.findOne({ email: 'coordinadora@ucn.cl' }, { email: 1, roles: 1, password_hash: 1 });
print('Usuario actualizado:', user);

print('✅ Password actualizado correctamente');
