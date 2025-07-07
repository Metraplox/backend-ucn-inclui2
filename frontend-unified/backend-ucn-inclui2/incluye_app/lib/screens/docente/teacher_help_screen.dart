import 'package:flutter/material.dart';

class TeacherHelpScreen extends StatelessWidget {
  const TeacherHelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ayuda para Docentes'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHelpSection(
              title: 'Gestión de Estudiantes NEE',
              icon: Icons.people,
              items: [
                'Ver estudiantes con necesidades especiales en tus cursos',
                'Revisar ajustes curriculares asignados',
                'Marcar ajustes como revisados',
                'Consultar detalles específicos de cada estudiante',
              ],
            ),
            const SizedBox(height: 24),
            _buildHelpSection(
              title: 'Cursos y Asignaturas',
              icon: Icons.book,
              items: [
                'Ver todas las asignaturas asignadas',
                'Consultar lista de estudiantes por curso',
                'Acceder a información de ajustes por materia',
                'Generar reportes de seguimiento',
              ],
            ),
            const SizedBox(height: 24),
            _buildHelpSection(
              title: 'Solicitudes de Ayuda',
              icon: Icons.help,
              items: [
                'Enviar consultas sobre casos específicos',
                'Solicitar orientación pedagógica',
                'Reportar dificultades en la implementación',
                'Contactar al equipo de inclusión',
              ],
            ),
            const SizedBox(height: 24),
            _buildHelpSection(
              title: 'Notificaciones y Alertas',
              icon: Icons.notifications,
              items: [
                'Recibir avisos de nuevos ajustes',
                'Alertas de estudiantes que requieren atención',
                'Recordatorios de revisiones pendientes',
                'Comunicados importantes del sistema',
              ],
            ),
            const SizedBox(height: 32),
            _buildContactSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildHelpSection({
    required String title,
    required IconData icon,
    required List<String> items,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Colors.blue),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.check_circle,
                    color: Colors.green,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      item,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildContactSection() {
    return Card(
      color: Colors.blue.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.contact_support, color: Colors.blue),
                SizedBox(width: 8),
                Text(
                  'Contacto y Soporte',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Si necesitas ayuda adicional, puedes contactar a:',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 8),
            const Text(
              '• Equipo de Inclusión: inclusion@ucn.cl',
              style: TextStyle(fontSize: 14),
            ),
            const Text(
              '• Soporte Técnico: soporte@ucn.cl',
              style: TextStyle(fontSize: 14),
            ),
            const Text(
              '• Teléfono: +56 55 2355000',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
            Builder(
              builder: (context) => ElevatedButton.icon(
                onPressed: () {
                  // Aquí se podría abrir un formulario de contacto
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Redirigiendo a formulario de contacto'),
                      backgroundColor: Colors.blue,
                    ),
                  );
                },
                icon: const Icon(Icons.email),
                label: const Text('Enviar Consulta'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
