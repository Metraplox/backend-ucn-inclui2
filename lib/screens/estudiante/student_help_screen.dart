import 'package:flutter/material.dart';
import 'package:incluye_app/widgets/shared/dashboard_scaffold.dart';

class StudentHelpScreen extends StatelessWidget {
  const StudentHelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DashboardScaffold(
      title: 'Centro de Ayuda',
      onRefresh: () async {
        // Refresh function for help content
        await Future.delayed(const Duration(milliseconds: 500));
      },
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeSection(),
            const SizedBox(height: 24),
            _buildFAQSection(),
            const SizedBox(height: 24),
            _buildQuickActionsSection(context),
            const SizedBox(height: 24),
            _buildContactSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeSection() {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.help_outline, size: 48, color: Colors.blue),
            SizedBox(height: 16),
            Text(
              '¿Necesitas ayuda?',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'Aquí encontrarás respuestas a las preguntas más frecuentes sobre tus ajustes razonables y cómo utilizar la plataforma.',
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQSection() {
    final faqs = [
      {
        'question': '¿Qué son los ajustes razonables?',
        'answer': 'Los ajustes razonables son modificaciones y adaptaciones necesarias y adecuadas que no impongan una carga desproporcionada y que permitan a estudiantes con NEE participar en el proceso educativo en igualdad de condiciones.'
      },
      {
        'question': '¿Cómo puedo ver mis ajustes actuales?',
        'answer': 'Puedes ver todos tus ajustes razonables en la sección "Mis Ajustes" desde el dashboard principal o haciendo clic en el botón "Ver mis ajustes" en la pantalla de inicio.'
      },
      {
        'question': '¿Qué debo hacer si necesito confirmar ajustes?',
        'answer': 'Cuando tengas ajustes pendientes de confirmación, aparecerá una notificación en tu dashboard. Debes revisar cada ajuste y confirmar si deseas mantenerlo para el semestre actual.'
      },
      {
        'question': '¿Cómo puedo contactar a mi profesor sobre un ajuste?',
        'answer': 'Puedes enviar un mensaje a través de la plataforma desde la sección de cada curso, o contactar directamente a través del email institucional del profesor.'
      },
      {
        'question': '¿Qué hago si no veo mis cursos actuales?',
        'answer': 'Si no aparecen tus cursos actuales, contacta al programa Incluye UCN para que verifiquen tu inscripción en el sistema académico.'
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Preguntas Frecuentes',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        ...faqs.map((faq) => Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ExpansionTile(
            title: Text(faq['question']!),
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(faq['answer']!),
              ),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildQuickActionsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Acciones Rápidas',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Card(
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.person, color: Colors.blue),
                title: const Text('Ver mi perfil'),
                subtitle: const Text('Revisa tu información personal y documentos'),
                trailing: const Icon(Icons.arrow_forward),
                onTap: () => Navigator.pop(context),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.tune, color: Colors.green),
                title: const Text('Mis ajustes razonables'),
                subtitle: const Text('Consulta tus ajustes activos e historial'),
                trailing: const Icon(Icons.arrow_forward),
                onTap: () => Navigator.pop(context),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.book, color: Colors.orange),
                title: const Text('Mis cursos'),
                subtitle: const Text('Ve los cursos donde tienes ajustes aplicados'),
                trailing: const Icon(Icons.arrow_forward),
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildContactSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Contacto y Soporte',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const Row(
                  children: [
                    Icon(Icons.phone, color: Colors.blue),
                    SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Teléfono', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text('+56 55 234 5678'),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Row(
                  children: [
                    Icon(Icons.email, color: Colors.blue),
                    SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Email', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text('incluye@ucn.cl'),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Row(
                  children: [
                    Icon(Icons.location_on, color: Colors.blue),
                    SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Ubicación', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text('Oficina DIDDEC, Edificio Central UCN'),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // Implementar envío de email o formulario de contacto
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Función de contacto directo próximamente disponible'),
                        ),
                      );
                    },
                    icon: const Icon(Icons.send),
                    label: const Text('Enviar consulta'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
