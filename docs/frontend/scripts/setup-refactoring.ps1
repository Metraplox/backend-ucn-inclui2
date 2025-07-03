# 🚀 **FLUTTER REFACTORING SETUP SCRIPT**
# Automatización completa para preparar el entorno de refactoring
# Fecha: Enero 2025
# Autor: UCN INCLUI2 Team

param(
    [string]$ProjectPath = ".",
    [switch]$SkipBackup = $false,
    [switch]$Force = $false,
    [switch]$Verbose = $false
)

# 🎨 Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# 📋 Configuración del script
$ErrorActionPreference = "Stop"
$BackupBranch = "backup-pre-refactoring-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
$RequiredDependencies = @(
    "flutter_riverpod: ^2.4.9",
    "go_router: ^12.1.3", 
    "google_fonts: ^6.1.0",
    "cached_network_image: ^3.3.0",
    "freezed: ^2.4.6",
    "json_annotation: ^4.8.1"
)

$DevDependencies = @(
    "mockito: ^5.4.4",
    "build_runner: ^2.4.7",
    "freezed: ^2.4.6",
    "json_serializable: ^6.7.1"
)

function Write-Header {
    param([string]$Message)
    Write-Host "`n🚀 ===============================================" -ForegroundColor $Blue
    Write-Host "   $Message" -ForegroundColor $Blue
    Write-Host "===============================================`n" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $Cyan
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Test-FlutterProject {
    if (-not (Test-Path "pubspec.yaml")) {
        Write-Error "No se encontró pubspec.yaml. ¿Estás en un proyecto Flutter?"
        return $false
    }
    
    $pubspecContent = Get-Content "pubspec.yaml" -Raw
    if ($pubspecContent -notmatch "flutter:") {
        Write-Error "pubspec.yaml no parece ser de un proyecto Flutter"
        return $false
    }
    
    return $true
}

function Install-Dependencies {
    Write-Header "INSTALANDO DEPENDENCIAS FLUTTER"
    
    # Leer pubspec.yaml actual
    $pubspecPath = "pubspec.yaml"
    $pubspecContent = Get-Content $pubspecPath
    
    # Backup del pubspec original
    Copy-Item $pubspecPath "$pubspecPath.backup" -Force
    Write-Info "Backup de pubspec.yaml creado: pubspec.yaml.backup"
    
    # Agregar dependencias si no existen
    $needsUpdate = $false
    
    foreach ($dep in $RequiredDependencies) {
        $depName = $dep.Split(":")[0].Trim()
        if ($pubspecContent -notmatch $depName) {
            Write-Info "Agregando dependencia: $dep"
            $needsUpdate = $true
        } else {
            Write-Success "Dependencia ya existe: $depName"
        }
    }
    
    if ($needsUpdate -or $Force) {
        Write-Info "Actualizando pubspec.yaml con nuevas dependencias..."
        
        # Crear nuevo pubspec.yaml con dependencias
        $newPubspec = @"
# Las dependencias serán agregadas automáticamente
# Ejecutar: flutter pub add flutter_riverpod go_router google_fonts cached_network_image freezed json_annotation
# Dev dependencies: flutter pub add --dev mockito build_runner json_serializable
"@
        
        Write-Warning "⚠️  IMPORTANTE: Ejecuta manualmente los siguientes comandos:"
        Write-Host "flutter pub add flutter_riverpod go_router google_fonts cached_network_image freezed json_annotation" -ForegroundColor $Yellow
        Write-Host "flutter pub add --dev mockito build_runner json_serializable" -ForegroundColor $Yellow
    }
    
    # Ejecutar flutter pub get
    Write-Info "Ejecutando flutter pub get..."
    try {
        & flutter pub get
        Write-Success "Dependencias instaladas correctamente"
    }
    catch {
        Write-Error "Error ejecutando flutter pub get: $_"
        throw
    }
}

function Create-FolderStructure {
    Write-Header "CREANDO ESTRUCTURA DE CARPETAS"
    
    $folders = @(
        "lib/providers",
        "lib/models", 
        "lib/services",
        "lib/router",
        "lib/theme",
        "lib/widgets/ucn_components",
        "test/providers",
        "test/widgets",
        "test/integration"
    )
    
    foreach ($folder in $folders) {
        if (-not (Test-Path $folder)) {
            New-Item -ItemType Directory -Path $folder -Force | Out-Null
            Write-Success "Carpeta creada: $folder"
        } else {
            Write-Info "Carpeta ya existe: $folder"
        }
    }
}

function Create-BaseFiles {
    Write-Header "CREANDO ARCHIVOS BASE"
    
    # Provider base file
    $authProviderContent = @"
// lib/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_provider.freezed.dart';

@freezed
class AuthState with _\$AuthState {
  const factory AuthState({
    @Default(false) bool isLoading,
    @Default(false) bool isAuthenticated,
    String? user,
    String? error,
  }) = _AuthState;
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState());

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      // TODO: Implementar API call real
      await Future.delayed(const Duration(seconds: 2));
      
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: email,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void logout() {
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
"@
    
    if (-not (Test-Path "lib/providers/auth_provider.dart")) {
        $authProviderContent | Out-File -FilePath "lib/providers/auth_provider.dart" -Encoding UTF8
        Write-Success "Archivo creado: lib/providers/auth_provider.dart"
    }
    
    # UCN Theme file
    $themeContent = @"
// lib/theme/ucn_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class UCNTheme {
  // Colores institucionales UCN
  static const Color primaryColor = Color(0xFF1565C0); // Azul UCN
  static const Color secondaryColor = Color(0xFF0D47A1); // Azul oscuro
  static const Color accentColor = Color(0xFF42A5F5); // Azul claro
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
      ),
      textTheme: GoogleFonts.robotoTextTheme(),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 2,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}
"@
    
    if (-not (Test-Path "lib/theme/ucn_theme.dart")) {
        $themeContent | Out-File -FilePath "lib/theme/ucn_theme.dart" -Encoding UTF8
        Write-Success "Archivo creado: lib/theme/ucn_theme.dart"
    }
    
    # Basic router file
    $routerContent = @"
// lib/router/app_router.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// TODO: Import your screens here

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const Placeholder(), // TODO: Replace with HomeScreen
      ),
      GoRoute(
        path: '/login',
        name: 'login', 
        builder: (context, state) => const Placeholder(), // TODO: Replace with LoginScreen
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Error: \${state.error}'),
      ),
    ),
  );
});
"@
    
    if (-not (Test-Path "lib/router/app_router.dart")) {
        $routerContent | Out-File -FilePath "lib/router/app_router.dart" -Encoding UTF8
        Write-Success "Archivo creado: lib/router/app_router.dart"
    }
}

function Create-GitBackup {
    if ($SkipBackup) {
        Write-Warning "Saltando backup de Git (--SkipBackup especificado)"
        return
    }
    
    Write-Header "CREANDO BACKUP GIT"
    
    # Verificar si es repositorio Git
    if (-not (Test-Path ".git")) {
        Write-Warning "No es un repositorio Git. Saltando backup..."
        return
    }
    
    try {
        # Verificar estado del repositorio
        $status = & git status --porcelain
        if ($status) {
            Write-Warning "Hay cambios sin commitear. Creando stash..."
            & git stash push -m "Pre-refactoring stash $(Get-Date)"
        }
        
        # Crear branch de backup
        $currentBranch = & git branch --show-current
        Write-Info "Branch actual: $currentBranch"
        
        & git checkout -b $BackupBranch
        Write-Success "Branch de backup creado: $BackupBranch"
        
        # Volver al branch original
        & git checkout $currentBranch
        Write-Info "Volviendo a branch: $currentBranch"
        
    }
    catch {
        Write-Error "Error creando backup Git: $_"
        throw
    }
}

function Test-Prerequisites {
    Write-Header "VERIFICANDO PREREQUISITOS"
    
    $allGood = $true
    
    # Verificar Flutter
    if (Test-Command "flutter") {
        $flutterVersion = & flutter --version | Select-String "Flutter" | Select-Object -First 1
        Write-Success "Flutter encontrado: $flutterVersion"
    } else {
        Write-Error "Flutter no encontrado en PATH"
        $allGood = $false
    }
    
    # Verificar Dart
    if (Test-Command "dart") {
        $dartVersion = & dart --version
        Write-Success "Dart encontrado: $dartVersion"
    } else {
        Write-Error "Dart no encontrado en PATH"
        $allGood = $false
    }
    
    # Verificar Git
    if (Test-Command "git") {
        $gitVersion = & git --version
        Write-Success "Git encontrado: $gitVersion"
    } else {
        Write-Warning "Git no encontrado. Backup automático deshabilitado"
    }
    
    # Verificar proyecto Flutter
    if (Test-FlutterProject) {
        Write-Success "Proyecto Flutter válido detectado"
    } else {
        Write-Error "No es un proyecto Flutter válido"
        $allGood = $false
    }
    
    return $allGood
}

function Run-PostSetupTasks {
    Write-Header "EJECUTANDO TAREAS POST-SETUP"
    
    # Ejecutar build_runner si es necesario
    if (Test-Path "lib/providers/auth_provider.dart") {
        Write-Info "Ejecutando build_runner para generar código..."
        try {
            & flutter pub run build_runner build --delete-conflicting-outputs
            Write-Success "Código generado correctamente"
        }
        catch {
            Write-Warning "Error ejecutando build_runner: $_"
            Write-Info "Puedes ejecutarlo manualmente después con: flutter pub run build_runner build"
        }
    }
    
    # Verificar que la app compila
    Write-Info "Verificando que el proyecto compila..."
    try {
        & flutter analyze --no-fatal-infos
        Write-Success "Análisis estático pasado"
    }
    catch {
        Write-Warning "Hay warnings en el análisis estático. Revisar con: flutter analyze"
    }
}

function Show-NextSteps {
    Write-Header "PRÓXIMOS PASOS"
    
    Write-Host "🎯 Setup completado! Ahora puedes:" -ForegroundColor $Green
    Write-Host ""
    Write-Host "1. 📖 Leer la guía de implementación:" -ForegroundColor $Blue
    Write-Host "   docs/07-flutter-refactoring/02_GUIA_IMPLEMENTACION.md" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "2. 🏗️  Implementar State Management (Semana 1):" -ForegroundColor $Blue
    Write-Host "   - Completar AuthProvider en lib/providers/auth_provider.dart" -ForegroundColor $Cyan
    Write-Host "   - Refactorizar HomeScreen para usar Riverpod" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "3. 🧭 Configurar GoRouter (Semana 2):" -ForegroundColor $Blue
    Write-Host "   - Completar lib/router/app_router.dart" -ForegroundColor $Cyan
    Write-Host "   - Implementar guards de autenticación" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "4. 🎨 Aplicar UCN Design System (Semana 3):" -ForegroundColor $Blue
    Write-Host "   - Usar UCNTheme en lib/theme/ucn_theme.dart" -ForegroundColor $Cyan
    Write-Host "   - Crear componentes UCN reutilizables" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "5. 🧪 Testing y Optimización (Semana 4):" -ForegroundColor $Blue
    Write-Host "   - Escribir tests para providers y widgets" -ForegroundColor $Cyan
    Write-Host "   - Optimizar performance y crear build de producción" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "📋 Usar checklist de validación:" -ForegroundColor $Green
    Write-Host "   docs/07-flutter-refactoring/07_CHECKLIST_VALIDACION.md" -ForegroundColor $Cyan
    Write-Host ""
    
    if (-not $SkipBackup -and (Test-Path ".git")) {
        Write-Host "🔄 Backup creado en branch: $BackupBranch" -ForegroundColor $Yellow
        Write-Host "   Para volver al estado anterior: git checkout $BackupBranch" -ForegroundColor $Cyan
    }
}

# 🚀 MAIN EXECUTION
try {
    Write-Header "FLUTTER REFACTORING SETUP - UCN INCLUI2"
    Write-Info "Iniciando setup automático para refactoring Flutter..."
    Write-Info "Proyecto: $ProjectPath"
    
    # Cambiar al directorio del proyecto
    if ($ProjectPath -ne ".") {
        Set-Location $ProjectPath
    }
    
    # 1. Verificar prerequisitos
    if (-not (Test-Prerequisites)) {
        Write-Error "Prerequisitos no cumplidos. Abortando setup."
        exit 1
    }
    
    # 2. Crear backup Git
    Create-GitBackup
    
    # 3. Instalar dependencias
    Install-Dependencies
    
    # 4. Crear estructura de carpetas  
    Create-FolderStructure
    
    # 5. Crear archivos base
    Create-BaseFiles
    
    # 6. Tareas post-setup
    Run-PostSetupTasks
    
    # 7. Mostrar próximos pasos
    Show-NextSteps
    
    Write-Header "✅ SETUP COMPLETADO EXITOSAMENTE"
    Write-Success "El entorno está listo para comenzar el refactoring Flutter!"
    
}
catch {
    Write-Header "❌ ERROR EN SETUP"
    Write-Error "Error durante el setup: $_"
    Write-Info "Revisar logs arriba para más detalles"
    
    if (Test-Path "pubspec.yaml.backup") {
        Write-Info "Restaurar pubspec.yaml original: Copy-Item pubspec.yaml.backup pubspec.yaml -Force"
    }
    
    exit 1
}

# 📊 Script completado
Write-Host "`n🎉 Setup script finalizado en $(Get-Date)" -ForegroundColor $Green
