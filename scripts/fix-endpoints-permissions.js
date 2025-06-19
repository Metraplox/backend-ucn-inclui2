const fs = require('fs');
const path = require('path');

// Archivos a corregir
const fixes = [
  {
    file: 'src/students/students.controller.ts',
    description: 'Corrigir guards en StudentsController',
    changes: [
      {
        find: '@UseGuards(JwtAuthGuard, RolesGuard)\n@Controller(\'students\')',
        replace: '@Controller(\'students\')'
      },
      {
        find: '  @Get()\n  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF)',
        replace: '  @Get()\n  @UseGuards(JwtAuthGuard, RolesGuard)\n  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL, UserRole.DIDDEC_STAFF)'
      },
      {
        find: '  @Post()\n  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)',
        replace: '  @Post()\n  @UseGuards(JwtAuthGuard, RolesGuard)\n  @Roles(UserRole.COORDINADOR, UserRole.EDUCADORA_SOCIAL)'
      }
    ]
  },
  {
    file: 'src/courses/courses.controller.ts',
    description: 'Corrigir guards en CoursesController',
    changes: [
      {
        find: '@UseGuards(JwtAuthGuard, RolesGuard)\n@Controller(\'courses\')',
        replace: '@Controller(\'courses\')'
      },
      {
        find: '  @Get()\n  @Roles(',
        replace: '  @Get()\n  @UseGuards(JwtAuthGuard, RolesGuard)\n  @Roles('
      }
    ]
  }
];

async function applyFixes() {
  console.log('🔧 CORRIGIENDO PERMISOS DE ENDPOINTS');
  console.log('===================================\n');
  
  for (const fix of fixes) {
    console.log(`📝 Procesando: ${fix.file}`);
    
    try {
      const filePath = path.join(process.cwd(), fix.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  Archivo no encontrado: ${filePath}`);
        continue;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      for (const change of fix.changes) {
        if (content.includes(change.find)) {
          content = content.replace(change.find, change.replace);
          modified = true;
          console.log(`  ✅ Aplicado cambio: ${change.find.substring(0, 30)}...`);
        } else {
          console.log(`  ⚠️  No encontrado: ${change.find.substring(0, 30)}...`);
        }
      }
      
      if (modified) {
        // Crear backup
        const backupPath = `${filePath}.backup`;
        fs.copyFileSync(filePath, backupPath);
        
        // Aplicar cambios
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Archivo actualizado (backup: ${path.basename(backupPath)})`);
      } else {
        console.log(`  ℹ️  No se requieren cambios`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log();
  }
  
  console.log('🎯 CORRECCIONES COMPLETADAS');
  console.log('===========================');
  console.log('⚠️  El servidor necesita reiniciarse para aplicar cambios');
  console.log('💡 Comando: npx nest start --watch');
}

applyFixes(); 