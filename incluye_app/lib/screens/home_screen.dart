import 'package:flutter/material.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/widgets/app_scaffold.dart';
import 'package:incluye_app/widgets/course_widget.dart';
import 'package:incluye_app/services/notification_service.dart';
import 'package:incluye_app/screens/students/student_own_profile_screen.dart';
import 'package:incluye_app/screens/adjustment/adjustment_history_screen.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/screens/students/student_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isStudent = false;
  bool _isAdmin = false;
  String? _currentUserId;
  bool _isLoading = true;
  int _pendingAdjustmentsCount = 0;
  
  // Variables para el panel de coordinadora
  List<Student> _students = [];
  int _totalStudents = 0;
  int _totalAdjustments = 0;
  int _pendingAlerts = 0;

  @override
  void initState() {
    super.initState();
    _initialize();
  }
  
  Future<void> _initialize() async {
    await _checkRole();
    
    if (_isStudent && _currentUserId != null) {
      await _checkForNotifications();
    } else if (_isAdmin) {
      // Cargar datos para el panel de coordinadora
      await _loadCoordinadoraData();
    }
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  // Método para cargar datos del panel de coordinadora
  Future<void> _loadCoordinadoraData() async {
    try {
      // Cargar lista de estudiantes
      final students = await StudentService.getAllStudents();
      
      // Calcular estadísticas básicas
      final totalStudents = students.length;
      
      // Simular datos de ajustes y alertas (en una implementación real vendrían de la API)
      final totalAdjustments = totalStudents * 2; // Aproximadamente 2 ajustes por estudiante
      final pendingAlerts = (totalStudents / 8).round(); // Aproximadamente 1 alerta por cada 8 estudiantes
      
      if (mounted) {
        setState(() {
          _students = students;
          _totalStudents = totalStudents;
          _totalAdjustments = totalAdjustments;
          _pendingAlerts = pendingAlerts;
        });
      }
    } catch (e) {
      print('Error al cargar datos de coordinadora: $e');
    }
  }
  
  Future<void> _checkForNotifications() async {
  await NotificationService.checkForPendingAdjustments(
    getPendingCount: () async {
      final ajustes = await AdjustmentService.getAdjustmentHistory(_currentUserId!);

      final count = ajustes
        .where((a) => (a as Adjustment).isPending || 
                    ((a as Adjustment).expirationDate != null &&
                      DateTime.tryParse((a as Adjustment).expirationDate!)?.isAfter(DateTime.now()) == true))
        .length;


      if (mounted) {
        setState(() {
          _pendingAdjustmentsCount = count;
        });
      }

      return count;
    },
    onAdjustmentsTap: () {
      if (_currentUserId != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AdjustmentHistoryScreen(studentId: _currentUserId!),
          ),
        );
      }
    },
  );
}



  Future<void> _checkRole() async {
    final isStudent = await StudentService.isStudent();
    final isAdmin = await StudentService.isAdmin();
    
    final userInfo = await StudentService.getCurrentUserInfo();
    
    if (mounted) {
      setState(() {
        _isStudent = isStudent;
        _isAdmin = isAdmin;
        _currentUserId = userInfo?['id'];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: _isStudent
          ? 'Mis Asignaturas y Ajustes'
          : _isAdmin
              ? 'Panel de Coordinadora'
              : '',
      isStudent: _isStudent,
      isAdmin: _isAdmin,
      floatingActionButton: _isStudent && _currentUserId != null
          ? FloatingActionButton(
              onPressed: _viewOwnProfile,
              tooltip: 'Ver mi perfil',
              child: const Icon(Icons.person),
            )
          : null,
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _isStudent
              ? SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  // Mensaje de bienvenida con opción para ver perfil
                  Card(
                    child: ListTile(
                      leading: const CircleAvatar(
                        child: Icon(Icons.person),
                      ),
                      title: const Text('Mi perfil y documentos'),
                      subtitle: const Text('Ver ajustes y gestionar consentimientos'),
                      trailing: const Icon(Icons.arrow_forward),
                      onTap: _viewOwnProfile,
                    ),
                  ),
                  
                  // Mostrar tarjeta de ajustes pendientes si hay alguno
                  if (_pendingAdjustmentsCount > 0) ...[  
                    const SizedBox(height: 16),
                    Card(
                      color: Colors.blue.shade50,
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue,
                          child: Text(_pendingAdjustmentsCount.toString()),
                        ),
                        title: Text(
                          _pendingAdjustmentsCount == 1
                              ? 'Tienes 1 ajuste activo'
                              : 'Tienes $_pendingAdjustmentsCount ajustes activos'
                        ),
                        subtitle: const Text('Ver historial de ajustes'),
                        trailing: const Icon(Icons.arrow_forward),
                        onTap: () {
                          if (_currentUserId != null) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => AdjustmentHistoryScreen(studentId: _currentUserId!),
                              ),
                            );
                          }
                        },
                      ),
                    ),
                  ],
                  
                  const SizedBox(height: 20),
                  
                  // Sección de asignaturas
                  const Text(
                    'Mis asignaturas con ajustes',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  
                  const SizedBox(height: 12),
                  
                  CourseWidget(
                    courseName: 'Cálculo II',
                    professor: 'Jorge Díaz',
                    adjustments: [
                      'Más tiempo en evaluaciones',
                      'Letras más grandes',
                      'Audífonos',
                    ],
                    onEdit: _onEditDemo,
                  ),
                  CourseWidget(
                    courseName: 'Álgebra II',
                    professor: 'Pablo Díaz',
                    adjustments: [
                      'Más tiempo en evaluaciones',
                      'Letras más grandes',
                      'Audífonos',
                    ],
                    onEdit: _onEditDemo,
                  ),
                  CourseWidget(
                    courseName: 'Química',
                    professor: 'Lionel Messi',
                    adjustments: [
                      'Más tiempo en evaluaciones',
                      'Letras más grandes',
                      'Audífonos',
                    ],
                    onEdit: _onEditDemo,
                  ),
                ],
              ),
            )
          : _isAdmin
              ? _buildAdminDashboard()
              : const Center(child: Text('Bienvenido, ¡debes iniciar sesión!')),
    );
  }

  // Método para abrir la pantalla de perfil del estudiante
  void _viewOwnProfile() {
    if (_currentUserId != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => StudentOwnProfileScreen(studentId: _currentUserId!),
        ),
      );
    } else {
      // Mostrar mensaje de error si el ID no está disponible
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo cargar tu perfil. Inténtalo más tarde.')),
      );
    }
  }

  // Método demo para la edición de ajustes
  static void _onEditDemo() {
    // Demo: aquí ejecutarías Navigator.push(...) a la pantalla de edición
  }
  
  // Método para construir el panel de administración de la coordinadora (Programa Incluye)
  Widget _buildAdminDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tarjeta de bienvenida
          Card(
            color: Colors.blue.shade50,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Bienvenida, Coordinadora',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Panel de administración del Programa Incluye UCN',
                    style: TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatCard('Estudiantes', _totalStudents.toString(), Icons.people, Colors.blue),
                      _buildStatCard('Ajustes Activos', _totalAdjustments.toString(), Icons.settings_accessibility, Colors.green),
                      _buildStatCard('Alertas', _pendingAlerts.toString(), Icons.notifications_active, Colors.red),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Sección de alertas y notificaciones
          const Text(
            'Alertas y Notificaciones',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          
          // Alertas de nuevos ingresos
          _buildAlertCard(
            'Nuevos Ingresos',
            '${(_students.length * 0.2).round()} estudiantes nuevos requieren revisión de ajustes',
            Icons.person_add,
            Colors.orange,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => StudentListScreen(),
                ),
              );
            },
          ),
          
          // Alertas de actualización de ajustes
          _buildAlertCard(
            'Actualización de Ajustes',
            '${(_students.length * 0.1).round()} estudiantes han solicitado actualización de ajustes',
            Icons.update,
            Colors.blue,
            onTap: () {
              // Mostrar un diálogo con la lista de estudiantes que requieren actualización
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Solicitudes de Actualización'),
                  content: SizedBox(
                    width: double.maxFinite,
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: (_students.length * 0.1).round(),
                      itemBuilder: (context, index) {
                        // Mostrar estudiantes aleatorios de la lista
                        final student = _students[index % _students.length];
                        return ListTile(
                          title: Text(student.nombreCompleto),
                          subtitle: Text('${student.carrera ?? 'Sin carrera'} - ${student.rut}'),
                          leading: const CircleAvatar(child: Icon(Icons.person)),
                        );
                      },
                    ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cerrar'),
                    ),
                  ],
                ),
              );
            },
          ),
          
          // Alertas de docentes que no han revisado ajustes
          _buildAlertCard(
            'Docentes sin revisar ajustes',
            '${(_totalStudents / 3).round()} docentes aún no han revisado los ajustes asignados',
            Icons.warning,
            Colors.red,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Funcionalidad en desarrollo')),
              );
            },
          ),
          
          const SizedBox(height: 24),
          
          // Sección de gestión de estudiantes
          const Text(
            'Gestión de Estudiantes',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          
          // Tarjeta para listar estudiantes
          _buildFeatureCard(
            'Listado de Estudiantes',
            'Ver todos los estudiantes registrados en el programa',
            Icons.list_alt,
            Colors.indigo,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => StudentListScreen(),
                ),
              );
            },
          ),
          
          // Tarjeta para gestionar diagnósticos
          _buildFeatureCard(
            'Gestión de Diagnósticos',
            'Ingresar o actualizar información de diagnóstico',
            Icons.medical_services,
            Colors.teal,
            onTap: () {
              // Mostrar un diálogo con la lista de diagnósticos disponibles
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Categorías de Diagnósticos'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        leading: const Icon(Icons.category),
                        title: const Text('Discapacidad Visual'),
                        trailing: const Icon(Icons.edit),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.category),
                        title: const Text('Discapacidad Auditiva'),
                        trailing: const Icon(Icons.edit),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.category),
                        title: const Text('Discapacidad Motora'),
                        trailing: const Icon(Icons.edit),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.category),
                        title: const Text('TEA'),
                        trailing: const Icon(Icons.edit),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.add_circle),
                        title: const Text('Agregar nueva categoría'),
                        onTap: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cerrar'),
                    ),
                  ],
                ),
              );
            },
          ),
          
          // Tarjeta para gestionar ajustes razonables
          _buildFeatureCard(
            'Ajustes Razonables',
            'Configurar y actualizar ajustes para estudiantes',
            Icons.settings_accessibility,
            Colors.purple,
            onTap: () {
              // Mostrar un diálogo con la lista de ajustes razonables disponibles
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Categorías de Ajustes Razonables'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        leading: const Icon(Icons.access_time),
                        title: const Text('Tiempo extra en evaluaciones'),
                        subtitle: const Text('30 minutos adicionales'),
                        trailing: const Icon(Icons.edit),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.text_fields),
                        title: const Text('Material en formato accesible'),
                        subtitle: const Text('Textos adaptados'),
                        trailing: const Icon(Icons.edit),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.record_voice_over),
                        title: const Text('Intérprete de señas'),
                        subtitle: const Text('Durante clases y evaluaciones'),
                        trailing: const Icon(Icons.edit),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.add_circle),
                        title: const Text('Agregar nuevo ajuste'),
                        onTap: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cerrar'),
                    ),
                  ],
                ),
              );
            },
          ),
          
          const SizedBox(height: 24),
          
          // Sección de reportes y seguimiento
          const Text(
            'Reportes y Seguimiento',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          
          // Tarjeta para reportes de seguimiento
          _buildFeatureCard(
            'Reportes de Seguimiento',
            'Ver informes de implementación de ajustes',
            Icons.assessment,
            Colors.amber,
            onTap: () {
              // Mostrar un diálogo con opciones de reportes
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Reportes de Seguimiento'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        leading: const Icon(Icons.bar_chart),
                        title: const Text('Ajustes por carrera'),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.pie_chart),
                        title: const Text('Distribución de diagnósticos'),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.trending_up),
                        title: const Text('Implementación de ajustes'),
                        subtitle: const Text('Seguimiento mensual'),
                        onTap: () => Navigator.pop(context),
                      ),
                      ListTile(
                        leading: const Icon(Icons.people),
                        title: const Text('Cumplimiento docente'),
                        subtitle: const Text('Revisión de ajustes'),
                        onTap: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cerrar'),
                    ),
                  ],
                ),
              );
            },
          ),
          
          // Tarjeta para exportar datos
          _buildFeatureCard(
            'Exportar Datos',
            'Generar reportes en formato Excel',
            Icons.file_download,
            Colors.green,
            onTap: () {
              // Mostrar un diálogo de confirmación para exportar datos
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Exportar Datos'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Seleccione el tipo de reporte a exportar:'),
                      const SizedBox(height: 16),
                      ListTile(
                        leading: const Icon(Icons.people),
                        title: const Text('Listado de estudiantes'),
                        trailing: const Icon(Icons.download),
                        onTap: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Exportando listado de estudiantes a Excel...')),
                          );
                        },
                      ),
                      ListTile(
                        leading: const Icon(Icons.settings_accessibility),
                        title: const Text('Ajustes implementados'),
                        trailing: const Icon(Icons.download),
                        onTap: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Exportando ajustes implementados a Excel...')),
                          );
                        },
                      ),
                      ListTile(
                        leading: const Icon(Icons.assignment),
                        title: const Text('Reporte completo'),
                        trailing: const Icon(Icons.download),
                        onTap: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Exportando reporte completo a Excel...')),
                          );
                        },
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancelar'),
                    ),
                  ],
                ),
              );
            },
          ),
          
          const SizedBox(height: 24),
          
          // Sección de recursos
          const Text(
            'Recursos y Material de Apoyo',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          
          // Tarjeta para gestionar recursos
          _buildFeatureCard(
            'Gestionar Recursos',
            'Subir o actualizar material de apoyo para docentes',
            Icons.upload_file,
            Colors.deepOrange,
          ),
          
          // Tarjeta para categorías de ajustes
          _buildFeatureCard(
            'Categorías de Ajustes',
            'Agregar o editar categorías de ajustes razonables',
            Icons.category,
            Colors.blueGrey,
          ),
          
          // Tarjeta para gestión de consentimientos
          _buildFeatureCard(
            'Gestión de Consentimientos',
            'Revisar y aprobar documentos de consentimiento firmados',
            Icons.fact_check,
            Colors.brown,
          ),
          
          const SizedBox(height: 24),
          
          // Sección de comunicación
          const Text(
            'Comunicación con Unidades de Apoyo',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          
          // Lista de unidades de apoyo
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Unidades de Apoyo', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  _buildUnitItem('DEA', 'Acompañamientos académicos y psicoeducativos'),
                  _buildUnitItem('Programa AORA', 'Apoyo y orientación'),
                  _buildUnitItem('DGPRE', 'Dirección General de Pregrado'),
                  _buildUnitItem('Registro Curricular', 'Gestión académica'),
                  _buildUnitItem('Coordinación de Salas', 'Asignación de espacios'),
                  _buildUnitItem('DPI', 'Dirección de Pregrado Institucional'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  // Widget para crear tarjetas de estadísticas
  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(title, style: const TextStyle(fontSize: 14)),
          ],
        ),
      ),
    );
  }
  
  // Widget para crear tarjetas de alertas
  Widget _buildAlertCard(String title, String description, IconData icon, Color color, {VoidCallback? onTap}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color,
          child: Icon(icon, color: Colors.white),
        ),
        title: Text(title),
        subtitle: Text(description),
        trailing: const Icon(Icons.arrow_forward),
        onTap: onTap ?? () {},
      ),
    );
  }
  
  // Widget para crear tarjetas de funcionalidades
  Widget _buildFeatureCard(String title, String description, IconData icon, Color color, {VoidCallback? onTap}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color,
          child: Icon(icon, color: Colors.white),
        ),
        title: Text(title),
        subtitle: Text(description),
        trailing: const Icon(Icons.arrow_forward),
        onTap: onTap ?? () {},
      ),
    );
  }
  
  // Widget para crear elementos de unidades de apoyo
  Widget _buildUnitItem(String name, String description) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          const Icon(Icons.circle, size: 10, color: Colors.blue),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(description, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.message, size: 20),
            onPressed: () {},
            tooltip: 'Enviar mensaje',
          ),
        ],
      ),
    );
  }
}
