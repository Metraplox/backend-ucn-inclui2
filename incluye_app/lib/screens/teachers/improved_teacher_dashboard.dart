import 'package:flutter/material.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/models/courseWithAdjustment_model.dart';
import 'package:incluye_app/widgets/app_scaffold.dart';

class ImprovedTeacherDashboard extends StatefulWidget {
  const ImprovedTeacherDashboard({super.key});

  @override
  State<ImprovedTeacherDashboard> createState() => _ImprovedTeacherDashboardState();
}

class _ImprovedTeacherDashboardState extends State<ImprovedTeacherDashboard> {
  List<CourseAdjustment> _teacherCourses = [];
  bool _isLoading = true;
  String? _teacherName;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTeacherInfo();
  }

  Future<void> _loadTeacherInfo() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Obtener información del profesor actual
      _teacherName = await AuthService.getUserName();
      
      if (_teacherName != null) {
        await _loadCourses();
      } else {
        throw Exception('No se pudo obtener la información del profesor');
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _loadCourses() async {
    try {
      // Obtener todos los cursos disponibles
      final allCourses = await CourseService.getTeacherCourses(_teacherName!);
      
      // Filtrar cursos del profesor actual
      final teacherCourses = allCourses.where((course) {
        return course.profesor?.toLowerCase().contains(_teacherName!.toLowerCase()) ?? false;
      }).toList();

      setState(() {
        _teacherCourses = teacherCourses;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Mi Panel Docente',
      isTeacher: true,
      isStudent: false,
      isAdmin: false,
      isHead: false,
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text('Error al cargar información'),
            const SizedBox(height: 8),
            Text(_error!, style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadTeacherInfo,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadTeacherInfo,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeCard(),
            const SizedBox(height: 20),
            _buildStatsCard(),
            const SizedBox(height: 20),
            _buildCoursesSection(),
            const SizedBox(height: 20),
            _buildQuickActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.blue,
                  child: Text(
                    _teacherName?.substring(0, 1).toUpperCase() ?? '?',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bienvenido/a',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      Text(
                        _teacherName ?? 'Profesor/a',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard() {
    final coursesWithAdjustments = _teacherCourses.where((course) => 
      course.studentsWithNee.isNotEmpty
    ).length;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Resumen de Actividad',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    'Mis Cursos',
                    _teacherCourses.length.toString(),
                    Icons.book,
                    Colors.blue,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    'Con Ajustes',
                    coursesWithAdjustments.toString(),
                    Icons.settings,
                    Colors.orange,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 12),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildCoursesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Mis Asignaturas',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        
        if (_teacherCourses.isEmpty) ...[
          Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.school, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'No se encontraron cursos asignados',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Si crees que esto es un error, contacta al administrador.',
                    style: TextStyle(color: Colors.grey[500]),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ] else ...[
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _teacherCourses.length,
            itemBuilder: (context, index) {
              final course = _teacherCourses[index];
              return _buildCourseCard(course);
            },
          ),
        ],
      ],
    );
  }

  Widget _buildCourseCard(CourseAdjustment course) {
    final studentsWithAdjustments = course.studentsWithNee.length;
    final hasAdjustments = studentsWithAdjustments > 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: hasAdjustments ? Colors.orange : Colors.blue,
          child: Icon(
            hasAdjustments ? Icons.warning : Icons.book,
            color: Colors.white,
          ),
        ),
        title: Text(
          course.nombre,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('NRC: ${course.nrc}'),
            if (hasAdjustments)
              Text(
                '$studentsWithAdjustments estudiante(s) con ajustes',
                style: const TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.w500,
                ),
              ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCourseDetail('Código', course.codigo),
                _buildCourseDetail('Semestre', course.semestre ?? 'N/A'),
                _buildCourseDetail('Profesor', course.profesor ?? 'N/A'),
                
                if (hasAdjustments) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Estudiantes con Ajustes:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...course.studentsWithNee.map((adjustment) =>
                    Card(
                      color: Colors.orange.shade50,
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Colors.orange,
                          child: Icon(Icons.person, color: Colors.white),
                        ),
                        title: Text(adjustment['studentName'] ?? 'Estudiante'),
                        subtitle: Text('Tipo: ${adjustment['adjustmentType'] ?? 'N/A'}'),
                      ),
                    ),
                  ),
                ],
                
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _viewCourseDetails(course),
                      icon: const Icon(Icons.visibility),
                      label: const Text('Ver Detalles'),
                    ),
                    if (hasAdjustments)
                      ElevatedButton.icon(
                        onPressed: () => _viewAdjustments(course),
                        icon: const Icon(Icons.settings),
                        label: const Text('Ver Ajustes'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text('$label:', style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Acciones Rápidas',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 2.5,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildActionButton(
              'Notificaciones',
              Icons.notifications,
              Colors.red,
              () => _showComingSoon(context, 'Notificaciones'),
            ),
            _buildActionButton(
              'Mis Estudiantes',
              Icons.people,
              Colors.green,
              () => _showComingSoon(context, 'Lista de Estudiantes'),
            ),
            _buildActionButton(
              'Solicitar Apoyo',
              Icons.help,
              Colors.orange,
              () => _showComingSoon(context, 'Solicitar Apoyo'),
            ),
            _buildActionButton(
              'Recursos',
              Icons.library_books,
              Colors.purple,
              () => _showComingSoon(context, 'Recursos Educativos'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton(String title, IconData icon, Color color, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon),
          const SizedBox(height: 4),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }

  void _viewCourseDetails(CourseAdjustment course) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(course.nombre),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('NRC: ${course.nrc}'),
            Text('Código: ${course.codigo}'),
            Text('Semestre: ${course.semestre ?? 'N/A'}'),
            Text('Profesor: ${course.profesor ?? 'N/A'}'),
            const SizedBox(height: 8),
            Text('Estudiantes con ajustes: ${course.studentsWithNee.length}'),
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
  }

  void _viewAdjustments(CourseAdjustment course) {
    _showComingSoon(context, 'Vista detallada de ajustes');
  }

  void _showComingSoon(BuildContext context, String feature) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(feature),
        content: Text('La funcionalidad "$feature" estará disponible próximamente.\n\nActualmente implementado:\n- Vista mejorada de cursos del profesor ✓\n- Carga automática de cursos asignados ✓\n- Visualización de estudiantes con ajustes ✓'),
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
