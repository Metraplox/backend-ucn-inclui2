import 'package:flutter/material.dart';
import 'package:incluye_app/screens/diddec/diddec_dashboard_screen.dart';
import 'package:incluye_app/screens/users/user_management_screen.dart';
import 'package:incluye_app/screens/students/student_list_screen.dart';
import 'package:incluye_app/screens/notifications/notifications_screen.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel de Administración'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text(
              'Panel de Coordinadora/Administrador',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            
            // Estadísticas rápidas
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.5,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _buildStatCard('Estudiantes', '145', Icons.school, Colors.blue),
                _buildStatCard('Ajustes Activos', '324', Icons.settings, Colors.green),
                _buildStatCard('Notificaciones', '12', Icons.notifications, Colors.orange),
                _buildStatCard('Usuarios Total', '89', Icons.people, Colors.purple),
              ],
            ),
            
            const SizedBox(height: 30),
            
            // Notificaciones y alertas
            const Text(
              'Alertas y Notificaciones',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildActionCard(
              'Notificaciones',
              'Ver todas las notificaciones del sistema',
              Icons.notifications,
              Colors.red,
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const NotificationsScreen()),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Gestión de estudiantes
            const Text(
              'Gestión de Estudiantes',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildActionCard(
              'Listado de Estudiantes',
              'Ver y gestionar todos los estudiantes',
              Icons.list_alt,
              Colors.indigo,
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const StudentListScreen()),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Gestión completa de usuarios
            const Text(
              'Gestión de Usuarios',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildActionCard(
              'Gestión Completa de Usuarios',
              'Crear, editar y eliminar usuarios del sistema',
              Icons.admin_panel_settings,
              Colors.deepPurple,
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const UserManagementScreen()),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Panel DIDDEC
            const Text(
              'Panel DIDDEC',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildActionCard(
              'Dashboard DIDDEC',
              'Estadísticas y reportes de ajustes razonables',
              Icons.analytics,
              Colors.teal,
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const DiddecDashboardScreen()),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Gestión de documentos y consentimientos
            const Text(
              'Documentos y Consentimientos',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildActionCard(
              'Gestión de Documentos',
              'Cargar y descargar documentos del sistema',
              Icons.description,
              Colors.brown,
              () => _showComingSoon(context, 'Gestión de Documentos'),
            ),
            _buildActionCard(
              'Gestión de Consentimientos',
              'Administrar consentimientos de estudiantes',
              Icons.fact_check,
              Colors.cyan,
              () => _showComingSoon(context, 'Gestión de Consentimientos'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              backgroundColor: color.withOpacity(0.1),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color,
          child: Icon(icon, color: Colors.white),
        ),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward),
        onTap: onTap,
      ),
    );
  }

  void _showComingSoon(BuildContext context, String feature) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(feature),
        content: Text('La funcionalidad "$feature" estará disponible próximamente.\n\nEsta versión incluye:\n- Vista DIDDEC completa ✓\n- Gestión completa de usuarios ✓\n- Ver todos los usuarios (no solo docentes) ✓\n- Crear/editar/eliminar usuarios ✓\n- Contraseña inicial para estudiantes (fecha nacimiento) ✓'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Entendido'),
          ),
        ],
      ),
    );
  }
}
