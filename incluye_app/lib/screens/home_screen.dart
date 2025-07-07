// screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/courseWithAdjustment_model.dart';

import 'package:incluye_app/screens/adjustments/student_adjustments_screen.dart';
import 'package:incluye_app/screens/courses/courses_list_screen.dart';
import 'package:incluye_app/screens/notifications/notifications_screen.dart';
import 'package:incluye_app/screens/students/student_career_screen.dart';
import 'package:incluye_app/screens/teachers/teachers_by_career.dart';
import 'package:incluye_app/screens/teachers/teachers_list.dart';
import 'package:incluye_app/screens/users/users_list.dart';
import 'package:incluye_app/services/adjustment_service.dart';

import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/widgets/app_scaffold.dart';
import 'package:incluye_app/widgets/course_widget.dart'; // Asumiendo que este widget está definido
import 'package:incluye_app/services/notification_service.dart';
import 'package:incluye_app/screens/students/student_own_profile_screen.dart'; // Perfil propio del estudiante
import 'package:incluye_app/screens/adjustments/adjustment_history_screen.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/models/user_model.dart'; // IMPORTANTE: Para el tipo de userInfo
import 'package:incluye_app/screens/students/student_list_screen.dart';
import 'package:incluye_app/screens/diddec/simple_diddec_screen.dart';
import 'package:incluye_app/screens/documents/document_consent_screen.dart';
import 'package:incluye_app/screens/diddec/diddec_dashboard_screen.dart';

import '../services/course_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isStudent = false;
  bool _isAdmin = false;
  bool _isTeacher = false;
  bool _isHead = false;
  bool _isDiddec = false;
  String? _currentUserId; // Este será el ID del User logueado
  // String? _currentStudentDocId; // Podrías necesitar el ID del documento Student si eres estudiante
  String? _headCareerId;
  bool _isLoading = true;
  int _pendingAdjustmentsCount = 0;

  // Variables para el panel de coordinadora
  List<Student> _students = []; // Tipado como List<Student>
  int _totalStudents = 0;
  int _totalAdjustments = 0; // Esto es simulado, idealmente vendría de la API
  int _pendingAlerts = 0; // Esto es simulado

  // Lista de cursos para profesores.
  List<CourseAdjustment> _courses = [];

  //Lista de cursos Alumno
  List<Course> _coursesStudent = [];
  String? _idStudent;
  String? _studentName;
  String? _teacherId;

  @override
  void initState() {
    super.initState();
    _initialize();
    // _loadCourses(); // Se llama dentro de _initialize si es profesor
  }

  Future<void> _initialize() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    await _checkRoleAndId(); // Obtiene roles y _currentUserId
    await _getHeadCareerId();

    if (_isStudent && _currentUserId != null && _idStudent != null) {
      await _loadStudentData();
      // Para un estudiante, _currentUserId es el ID de su documento User.
      // AdjustmentHistoryScreen y StudentOwnProfileScreen están diseñados para esto o para el ID de Student.
      // Si AdjustmentHistoryScreen necesita el ID del DOCUMENTO STUDENT, necesitaríamos obtenerlo.
      // Por ahora, asumimos que _currentUserId (User ID) es suficiente o que las pantallas lo manejan.
      await _checkForNotifications();
    } else if (_isAdmin) {
      await _loadCoordinadoraData();
    } else if (_isTeacher) {
      await _loadCourses();
    } else if (_isHead) {
      await _loadCoordinadoraData();
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _checkRoleAndId() async {
    final isStudentRole = await StudentService.isStudent();
    final isAdminRole = await StudentService.isAdmin();
    final isTeacherRole = await StudentService.isTeacher();
    final isHeadRole = await StudentService.isHead();
    final isDiddecRole = await StudentService.isDiddec();

    User? userInfo = await StudentService.getCurrentUserInfo();
    String? idStudent;
    String? idTeacher;
    if (isStudentRole) {
      idStudent = await AuthService.getUserId();
      print(idStudent);
    }
    if (isTeacherRole) {
      idTeacher = await AuthService.getUserId();
    }

    if (mounted) {
      setState(() {
        _isStudent = isStudentRole;
        _isAdmin = isAdminRole;
        _isTeacher = isTeacherRole;
        _isHead = isHeadRole;
        _currentUserId = userInfo?.id;
        _idStudent = idStudent;
        _studentName = userInfo?.nombreCompleto;
        _teacherId = idTeacher;
        _isDiddec = isDiddecRole;
      });
    }
  }

  Future<void> _getHeadCareerId() async {
    final careerId = await StudentService.getHeadCareerId();
    setState(() {
      _headCareerId = careerId;
    });
  }

  Future<void> _loadCoordinadoraData() async {
    try {
      final studentsData = await StudentService.getAllStudents();
      final unreadNotif = await NotificationService.checkUnreadNotification();
      final totalAdjustmentsData =
          await NotificationService.getNotificationByType();

      if (!mounted) return;

      // Simulación de datos, idealmente vendrían de la API

      setState(() {
        _students = studentsData;
        _totalStudents = studentsData.length;
        _totalAdjustments = totalAdjustmentsData;
        _pendingAlerts = unreadNotif;
      });
      print(_totalAdjustments);
    } catch (e) {
      //print('HomeScreen: Error al cargar datos de coordinadora: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar datos del panel: ${e.toString()}'),
          ),
        );
      }
    }
  }

  Future<void> _loadStudentData() async {
    if (_currentUserId == null || _idStudent == null) {
      print("NO se puede cargar cursos: falta _currentUserId o _idStudent");
      return;
    }

    try {
      final cursos = await CourseService.getStudentCourses(_idStudent!);
      setState(() {
        _coursesStudent = cursos;
      });
    } catch (e) {
      print("Error al cargar cursos del estudiante: $e");
    }
  }

  Future<void> _checkForNotifications() async {
    if (_currentUserId == null) {
      //print("HomeScreen (_checkForNotifications): _currentUserId es null, no se pueden buscar notificaciones.");
      return;
    }
    // Asumimos que AdjustmentService.getAdjustmentHistory espera el ID del USER
    // o que internamente puede manejarlo para obtener los ajustes del estudiante asociado.
    // Si espera el ID del DOCUMENTO STUDENT, necesitaríamos obtenerlo primero.
    await NotificationService.checkForPendingAdjustments(
      getPendingCount: () async {
        // IMPORTANTE: getAdjustmentHistory probablemente necesite el ID del DOCUMENTO STUDENT,
        // no el _currentUserId (que es el User ID).
        // Si eres estudiante, necesitarías obtener tu Student._id primero.
        // Por ahora, si eres estudiante y _currentUserId es el User ID, esto podría fallar
        // si AdjustmentService.getAdjustmentHistory espera el Student Document ID.
        // Esto es una simplificación y puede necesitar ajuste.
        // Si AdjustmentHistoryScreen se lanza con studentId (que es User ID), también necesita manejarlo.

        // Para este ejemplo, asumiremos que AdjustmentService puede funcionar con el User ID
        // o que tienes una forma de obtener el Student ID si es necesario.
        // Si _currentUserId es el ID del *usuario*, y AdjustmentService espera el ID del *estudiante*,
        // esta lógica necesita cambiar para obtener primero el perfil del estudiante y luego su ID.

        // Para simplificar, si es estudiante, usamos el endpoint de su propio perfil para obtener ajustes (si existiera)
        // o mantenemos la lógica actual si AdjustmentService lo maneja.
        // Aquí la lógica original:
        final ajustes = await AdjustmentService.getAdjustmentHistory(
          _currentUserId!,
        ); // Pasa el User ID

        // CORREGIDO: Quitar el cast (a as Adjustment) si la lista ya es tipada
        final count =
            ajustes
                .where(
                  (a) =>
                      a.isPending ||
                      (a.expirationDate != null &&
                          DateTime.tryParse(
                                a.expirationDate!,
                              )?.isAfter(DateTime.now()) ==
                              true),
                )
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
              // CORREGIDO: AdjustmentHistoryScreen espera studentId (ID del documento Student)
              // Si _currentUserId es el User ID, y eres estudiante, necesitas pasar el Student ID.
              // Para este ejemplo, si eres estudiante, se asume que AdjustmentHistoryScreen
              // puede tomar el User ID y encontrar los ajustes. O necesitas pasar el Student ID.
              // Aquí pasamos _currentUserId, asumiendo que es el ID relevante para la pantalla de historial.
              builder:
                  (context) =>
                      AdjustmentHistoryScreen(studentId: _currentUserId!),
            ),
          );
        }
      },
    );
  }

  Future<void> _loadCourses() async {
    String? nombreCompleto = await AuthService.getUserName();

    if (mounted && nombreCompleto != null) {
      // Usamos nombreCompleto que ahora es el campo principal en User
      final coursesData = await CourseService.getTeacherCourses(nombreCompleto);
      if (mounted) {
        setState(() {
          _courses = coursesData;
          print('Cursos : ${_courses.length}');
          for (var c in _courses) {
            print('Curso: ${c.nombre}');
          }
        });
      }
    }
  }

  void _viewOwnProfile() {
    // StudentOwnProfileScreen no toma parámetros, ya que obtiene el perfil del usuario logueado.
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const StudentOwnProfileScreen()),
    );
  }

  static void _onEditDemo() {
    /* ... */
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title:
          _isStudent
              ? 'Mis Asignaturas y Ajustes'
              : _isAdmin
              ? 'Panel de Coordinadora'
              : _isTeacher
              ? 'Panel Profesor'
              : _isHead
              ? 'Panel Jefe Carrera'
              : 'Inicio',
      isStudent: _isStudent,
      isAdmin: _isAdmin,
      isTeacher: _isTeacher,
      isHead: _isHead,
      floatingActionButton:
          _isStudent // Solo mostrar FAB si es estudiante
              ? FloatingActionButton(
                onPressed: _viewOwnProfile,
                tooltip: 'Ver mi perfil',
                child: const Icon(Icons.person),
              )
              : null,
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _isStudent
              ? _buildStudentDashboard() // Extraído a un método
              : _isAdmin
              ? _buildAdminDashboard()
              : _isTeacher
              ? _buildTeacherDashboard()
              : _isHead
              ? _buildJefeDashboard()
              : _isDiddec
              ? const SimpleDiddecScreen()
              : const Center(
                child: Text(
                  'Bienvenido. Por favor, inicia sesión o contacta al administrador si no tienes un rol asignado.',
                ),
              ),
    );
  }

  Widget _buildStudentDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildFeatureCard(
            'Notificaciones',
            'Ver mis notificaciones',
            Icons.warning,
            const Color.fromARGB(255, 184, 45, 45),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NotificationsScreen(),
                ),
              );
            },
          ),
          Card(
            child: ListTile(
              leading: const CircleAvatar(child: Icon(Icons.person)),
              title: const Text('Mi perfil y documentos'),
              subtitle: const Text('Ver ajustes y gestionar consentimientos'),
              trailing: const Icon(Icons.arrow_forward),
              onTap: _viewOwnProfile, // Llama al método corregido
            ),
          ),
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
                      ? 'Tienes 1 ajuste activo/pendiente'
                      : 'Tienes $_pendingAdjustmentsCount ajustes activos/pendientes',
                ),
                subtitle: const Text('Ver historial de ajustes'),
                trailing: const Icon(Icons.arrow_forward),
                onTap: () {
                  if (_currentUserId != null) {
                    // IMPORTANTE: AdjustmentHistoryScreen espera el ID del DOCUMENTO STUDENT.
                    // Si _currentUserId es el User ID, necesitas una forma de obtener el Student ID asociado.
                    // Esto es una simplificación y puede necesitar que obtengas el Student ID primero.
                    // O que AdjustmentHistoryScreen pueda funcionar con el User ID.
                    // Para este ejemplo, asumimos que pasamos el User ID y la pantalla lo maneja.
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder:
                            (context) => AdjustmentHistoryScreen(
                              studentId: _currentUserId!,
                            ),
                      ),
                    );
                  }
                },
              ),
            ),
          ],
          const SizedBox(height: 20),
          const Text(
            'Documentos y Consentimientos',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Card(
            color: Colors.green.shade50,
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: Colors.green,
                child: Icon(Icons.description, color: Colors.white),
              ),
              title: const Text('Gestionar Documentos'),
              subtitle: const Text(
                'Ver, subir y gestionar documentos y consentimientos',
              ),
              trailing: const Icon(Icons.arrow_forward),
              onTap: () {
                if (_currentUserId != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => DocumentConsentScreen(
                            studentId: _currentUserId!,
                            studentName: _studentName ?? 'Estudiante',
                          ),
                    ),
                  );
                }
              },
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Mis asignaturas con ajustes',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap:
                true, // importante para que el ListView se ajuste a su contenido
            physics:
                const NeverScrollableScrollPhysics(), // para que no haga scroll dentro del scroll
            itemCount: _coursesStudent.length,
            itemBuilder: (context, index) {
              final course = _coursesStudent[index];
              return CourseWidget(
                courseName: course.nombre,
                professor: course.profesor!,
                onEdit: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => StudentAdjustmentsScreen(
                            studentId: _idStudent!,
                            studentName: _studentName!,
                          ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTeacherDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Alertas y notificaciones.',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          _buildAlertCard(
            'Notificaciones sin revisar.',
            '${(_totalStudents / 3).round()} notificaciones sin abrir.',
            Icons.warning,
            Colors.red,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NotificationsScreen(),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
          const Text(
            'Estudiantes con Necesidades Especiales',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          _buildAlertCard(
            'Documentos de Estudiantes',
            'Ver documentos y ajustes de estudiantes con NEE',
            Icons.accessibility,
            Colors.purple,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const StudentListScreen(),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
          const Text(
            'Mis Asignaturas',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          _buildAlertCard(
            'Asignaturas semestre actual.',
            '${_courses.length} asignaturas a cargo.',
            Icons.book,
            const Color.fromARGB(255, 90, 130, 241),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder:
                      (context) => CoursesListScreen(idTeacher: _teacherId),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildJefeDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(/* ... (Tarjeta de bienvenida con _buildStatCard) ... */),
          const SizedBox(height: 24),
          const Text(
            'Alertas y Notificaciones',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildAlertCard(
            'Nuevos Ingresos',
            '${(_students.length * 0.2).round()} estudiantes nuevos requieren revisión',
            Icons.person_add,
            Colors.orange,
            onTap: () {
              if (_headCareerId != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder:
                        (context) =>
                            StudentCareerListScreen(careerId: _headCareerId!),
                  ),
                );
              } else {
                // Mostrar algún mensaje o manejar el caso de que no hay careerId aún
              }
            },
          ),

          // ... (Otras _buildAlertCard y _buildFeatureCard usando los datos de _students donde sea apropiado)
          // ... Asegúrate de usar student.nombreCompleto y student.carreraNombre
          const SizedBox(height: 24),
          const Text(
            'Gestión de Estudiantes',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildFeatureCard(
            'Listado de Estudiantes',
            'Ver todos los estudiantes',
            Icons.list_alt,
            Colors.indigo,
            onTap: () {
              if (_headCareerId != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder:
                        (context) =>
                            StudentCareerListScreen(careerId: _headCareerId!),
                  ),
                );
              } else {
                // Mostrar algún mensaje o manejar el caso de que no hay careerId aún
              }
            },
          ),
          const SizedBox(height: 24),
          const Text(
            'Gestión de Profesores',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildFeatureCard(
            'Listado de Profesores',
            'Ver todos los Profesores',
            Icons.list_alt,
            Colors.indigo,
            onTap: () {
              if (_headCareerId != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => TeachersbyCareerScreen(),
                  ),
                );
              } else {
                // Mostrar algún mensaje o manejar el caso de que no hay careerId aún
              }
            },
          ),
          // ... más _buildFeatureCard
        ],
      ),
    );
  }

  Widget _buildAdminDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(/* ... (Tarjeta de bienvenida con _buildStatCard) ... */),
          //const SizedBox(height: 24),
          const Text(
            'Alertas y Notificaciones',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildAlertCard(
            'Notificaciones',
            '${_pendingAlerts} notificaciones sin abrir.',
            Icons.notifications,
            const Color.fromARGB(255, 221, 12, 12),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NotificationsScreen(),
                ),
              );
            },
          ),

          _buildAlertCard(
            'Nuevos Ingresos',
            '${(_students.length * 0.2).round()} estudiantes nuevos requieren revisión',
            Icons.person_add,
            Colors.orange,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const StudentListScreen(),
                ),
              );
            },
          ),
          _buildAlertCard(
            'Actualización de Ajustes',
            '$_totalAdjustments solicitudes de actualización',
            Icons.update,
            Colors.blue,
            onTap: () {
              showDialog(
                context: context,
                builder:
                    (context) => AlertDialog(
                      title: const Text('Solicitudes de Actualización'),
                      content: SizedBox(
                        width: double.maxFinite,
                        child:
                            _students.isEmpty
                                ? const Text("No hay estudiantes para mostrar.")
                                : ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: (_students.length * 0.1)
                                      .round()
                                      .clamp(
                                        0,
                                        _students.length,
                                      ), // Asegurar que no exceda
                                  itemBuilder: (context, index) {
                                    if (_students.isEmpty)
                                      return const SizedBox.shrink(); // No debería llegar aquí si se maneja arriba
                                    final student =
                                        _students[index %
                                            _students
                                                .length]; // Para evitar errores si la lista es pequeña
                                    return ListTile(
                                      title: Text(
                                        student.nombreCompleto,
                                      ), // CORREGIDO
                                      subtitle: Text(
                                        '${student.carreraNombre ?? 'Sin carrera'} - ${student.rut}',
                                      ), // CORREGIDO
                                      leading: const CircleAvatar(
                                        child: Icon(Icons.person),
                                      ),
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
          const SizedBox(height: 24),
          const Text(
            'Gestión de Documentos',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          _buildFeatureCard(
            'Documentos por Estudiante',
            'Gestionar documentos y consentimientos de estudiantes',
            Icons.folder_shared,
            Colors.indigo,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const StudentListScreen(),
                ),
              );
            },
          ),
          const SizedBox(height: 24),
          const Text(
            'Panel DIDDEC',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          _buildFeatureCard(
            'Dashboard DIDDEC',
            'Estadísticas y reportes de ajustes razonables',
            Icons.analytics,
            Colors.teal,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const TeachersListScreen(),
                ),
              );
            },
          ),

          const SizedBox(height: 24),
          const Text(
            'Gestión de Usuarios',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          _buildFeatureCard(
            'Creación, edición, eliminación de usuarios',
            'Ver todos los usuarios',
            Icons.list_alt,
            Colors.indigo,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const UsersListScreen(),
                ),
              );
            },
          ),
          _buildFeatureCard(
            'Panel DIDDEC',
            'Estadísticas y gestión DIDDEC',
            Icons.analytics,
            Colors.purple,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const SimpleDiddecScreen(),
                ),
              );
            },
          ),
          // ... más _buildFeatureCard
        ],
      ),
    );
  }

  // Widget para crear tarjetas de estadísticas
  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Text(title, style: const TextStyle(fontSize: 14)),
          ],
        ),
      ),
    );
  }

  // Widget para crear tarjetas de alertas
  Widget _buildAlertCard(
    String title,
    String description,
    IconData icon,
    Color color, {
    VoidCallback? onTap,
  }) {
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
  Widget _buildFeatureCard(
    String title,
    String description,
    IconData icon,
    Color color, {
    VoidCallback? onTap,
  }) {
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
                Text(
                  description,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
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
