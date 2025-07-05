import 'package:flutter/material.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/services/notification_service.dart';
import 'package:incluye_app/screens/auth/login_screen.dart';
import 'package:incluye_app/screens/students/student_list_screen.dart';
import 'package:incluye_app/screens/students/student_own_profile_screen.dart';
import 'package:incluye_app/screens/settings/settings_screen.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/screens/diddec/pending_list_screen.dart';
import 'package:incluye_app/screens/diddec/resource_uploader_screen.dart';

class AppScaffold extends StatelessWidget {
  // Título para la barra de aplicación
  final String title;
  // Widget principal para el cuerpo de la pantalla
  final Widget body;
  // Indicador si el usuario es estudiante
  final bool isStudent;
  // Indicador si el usuario es administrador
  final bool isAdmin;
  // Indicador si el usuario es administrador
  final bool isTeacher;
  final bool isHead;
  final bool isDiddec;
  // Indicador de tipo de vista horizontal
  final bool isHorizontalView;
  // Callback para cambiar entre tipos de vista
  final VoidCallback? onToggleView;
  // Botón de acción flotante opcional
  final Widget? floatingActionButton;

  // Constructor con parámetros requeridos y opcionales
  const AppScaffold({
    super.key,
    required this.title,
    required this.body,
    required this.isStudent,
    this.isAdmin = false,
    this.isTeacher = false,
    this.isHead = false,
    this.isDiddec = false,
    this.isHorizontalView = false,
    this.onToggleView,
    this.floatingActionButton, // Agregado soporte para botón flotante
  });

  void _logout(BuildContext context) async {
    await AuthService.instance.logout();

    if (!context.mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Botón de acción flotante configurado desde fuera
      floatingActionButton: floatingActionButton,
      appBar: AppBar(
        title: Text(title),
        leading: Builder(
          builder:
              (ctx) => IconButton(
                icon: const Icon(Icons.menu),
                onPressed: () => Scaffold.of(ctx).openDrawer(),
              ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            tooltip: 'Notificaciones',
            onPressed: () async {
              await NotificationService.saveLastCheckTime();
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notificaciones revisadas')),
              );
            },
          ),
          if (onToggleView != null)
            IconButton(
              icon: Icon(
                isHorizontalView ? Icons.view_agenda : Icons.view_week,
              ),
              tooltip: 'Cambiar vista',
              onPressed: onToggleView,
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: () => _logout(context),
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.indigo),
              child: Text(
                'Menú',
                style: TextStyle(color: Colors.white, fontSize: 24),
              ),
            ),
            if (isStudent) ...[
              ListTile(
                leading: const Icon(Icons.person),
                title: const Text('Mi perfil'),
                onTap: () async {
                  Navigator.pop(context);
                  final userInfo = await StudentService.getCurrentUserInfo();
                  if (!context.mounted) return;

                  if (userInfo != null && userInfo['id'] != null) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => StudentOwnProfileScreen(),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('No se pudo cargar tu perfil'),
                      ),
                    );
                  }
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Configuración'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const SettingsScreen(),
                    ),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.build),
                title: const Text('Solicitar Ajuste'),
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Solicitud de ajuste: Función en desarrollo',
                      ),
                    ),
                  );
                },
              ),
            ],
            if (isAdmin) ...[
              ListTile(
                leading: const Icon(Icons.group),
                title: const Text('Ver Estudiantes'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const StudentListScreen(),
                    ),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Configuración'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen()),
                  );
                },
              ),
            ],
            if (isDiddec) ...[
              ListTile(
                leading: const Icon(Icons.cloud_upload),
                title: const Text('Recursos Pendientes'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const PendingListScreen(),
                    ),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.upload_file),
                title: const Text('Subir Recurso'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ResourceUploaderScreen(),
                    ),
                  );
                },
              ),
            ],
          ],
        ),
      ),
      body: body,
    );
  }
}
