// Script profesional para validar y corregir la relación userId <-> estudiante
// Última actualización: 08/07/2025

const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ucn_inclui2_prod';

const userSchema = new mongoose.Schema({
  email: String,
  roles: [String],
  isActive: Boolean,
  studentId: mongoose.Schema.Types.ObjectId,
});
const studentSchema = new mongoose.Schema({
  email: String,
  userId: mongoose.Schema.Types.ObjectId,
});

const User = mongoose.model('User', userSchema, 'users');
const Student = mongoose.model('Student', studentSchema, 'students');

async function main() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({ roles: 'ESTUDIANTE', isActive: true });
  let fixed = 0;
  for (const user of users) {
    const student = await Student.findOne({ userId: user._id });
    if (!student) {
      // Buscar por email si no hay relación userId
      const byEmail = await Student.findOne({ email: user.email });
      if (byEmail) {
        byEmail.userId = user._id;
        await byEmail.save();
        fixed++;
        console.log(`Corregido: estudiante ${byEmail.email} vinculado a usuario ${user.email}`);
      } else {
        console.warn(`FALTA: No existe estudiante para usuario ${user.email}`);
      }
    }
  }
  console.log(`Corrección finalizada. Estudiantes vinculados: ${fixed}`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
