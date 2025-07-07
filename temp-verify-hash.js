const bcrypt = require('bcrypt');

// Verificar el hash actual vs diferentes passwords
const hash = '$2b$10$n7bkXSJZEIF4jsot6AFe0.60UnBpAmxiH7BK/AVLZ1WYewSp7kNwa';

console.log('Verificando passwords contra el hash actual:');
console.log('password123:', bcrypt.compareSync('password123', hash));
console.log('inclui2025:', bcrypt.compareSync('inclui2025', hash));
console.log('Test123!:', bcrypt.compareSync('Test123!', hash));
console.log('admin123:', bcrypt.compareSync('admin123', hash));

// También generar y verificar un nuevo hash para estar seguros
const newHash = bcrypt.hashSync('password123', 10);
console.log('\nNuevo hash para password123:', newHash);
console.log('Verificando nuevo hash:', bcrypt.compareSync('password123', newHash));
