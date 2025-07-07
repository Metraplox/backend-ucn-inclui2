import 'package:flutter/material.dart';
import 'package:incluye_app/models/teacher_stats_model.dart';
import 'package:incluye_app/services/career_service.dart';

class TeachersListScreen extends StatefulWidget {
  const TeachersListScreen({super.key});

  @override
  State<TeachersListScreen> createState() => _TeachersListScreenState();
}

class _TeachersListScreenState extends State<TeachersListScreen> {
  bool _isLoading = true;
  List<TeacherStats> _teachers = [];
  List<TeacherStats> _filteredTeachers = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTeachers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadTeachers() async {
    setState(() => _isLoading = true);
    
    try {
      final teachersData = await CareerService.getTeachersByCareer();
      final teachers = teachersData
          .map((json) => TeacherStats.fromJson(json as Map<String, dynamic>))
          .toList();
      
      setState(() {
        _teachers = teachers;
        _filteredTeachers = teachers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar profesores: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _filterTeachers(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredTeachers = _teachers;
      } else {
        _filteredTeachers = _teachers.where((teacher) =>
          teacher.teacherName.toLowerCase().contains(query.toLowerCase())
        ).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lista de Profesores'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTeachers,
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _addNewTeacher,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Buscar profesor',
                hintText: 'Nombre del profesor...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: _filterTeachers,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredTeachers.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _filteredTeachers.length,
                        itemBuilder: (context, index) {
                          final teacher = _filteredTeachers[index];
                          return _buildTeacherCard(teacher);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.school_outlined,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No se encontraron profesores',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isEmpty
                ? 'No hay profesores registrados'
                : 'Intenta con otro término de búsqueda',
            style: TextStyle(
              color: Colors.grey[500],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _addNewTeacher,
            icon: const Icon(Icons.add),
            label: const Text('Agregar Profesor'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeacherCard(TeacherStats teacher) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.blue.shade100,
          child: Text(
            teacher.teacherName.split(' ').map((name) => name[0]).take(2).join(),
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
        ),
        title: Text(
          teacher.teacherName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${teacher.courseCount} cursos asignados'),
            Text('${teacher.studentCount} estudiantes a cargo'),
            if (teacher.alertCount > 0)
              Text(
                '${teacher.alertCount} alertas activas',
                style: const TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.w500,
                ),
              ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) => _handleMenuAction(value, teacher),
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'view',
              child: ListTile(
                leading: Icon(Icons.visibility),
                title: Text('Ver Perfil'),
              ),
            ),
            const PopupMenuItem(
              value: 'courses',
              child: ListTile(
                leading: Icon(Icons.book),
                title: Text('Ver Cursos'),
              ),
            ),
            const PopupMenuItem(
              value: 'edit',
              child: ListTile(
                leading: Icon(Icons.edit),
                title: Text('Editar'),
              ),
            ),
            const PopupMenuItem(
              value: 'contact',
              child: ListTile(
                leading: Icon(Icons.email),
                title: Text('Contactar'),
              ),
            ),
            if (teacher.alertCount > 0)
              const PopupMenuItem(
                value: 'alerts',
                child: ListTile(
                  leading: Icon(Icons.warning, color: Colors.red),
                  title: Text('Ver Alertas'),
                ),
              ),
          ],
        ),
        onTap: () => _viewTeacherProfile(teacher),
      ),
    );
  }

  void _handleMenuAction(String action, TeacherStats teacher) {
    switch (action) {
      case 'view':
        _viewTeacherProfile(teacher);
        break;
      case 'courses':
        _viewTeacherCourses(teacher);
        break;
      case 'edit':
        _editTeacher(teacher);
        break;
      case 'contact':
        _contactTeacher(teacher);
        break;
      case 'alerts':
        _viewTeacherAlerts(teacher);
        break;
    }
  }

  void _viewTeacherProfile(TeacherStats teacher) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Perfil de ${teacher.teacherName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('ID', teacher.teacherId),
            _buildDetailRow('Nombre', teacher.teacherName),
            _buildDetailRow('Cursos', teacher.courseCount.toString()),
            _buildDetailRow('Estudiantes', teacher.studentCount.toString()),
            _buildDetailRow('Alertas', teacher.alertCount.toString()),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _editTeacher(teacher);
            },
            child: const Text('Editar'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  void _viewTeacherCourses(TeacherStats teacher) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Cursos de ${teacher.teacherName}'),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Cursos asignados: ${teacher.courseCount}'),
              const SizedBox(height: 16),
              const Text('Lista de cursos:'),
              // Aquí se mostraría la lista real de cursos
              Container(
                height: 200,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text('Cargando cursos...'),
                ),
              ),
            ],
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
  }

  void _editTeacher(TeacherStats teacher) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Editar ${teacher.teacherName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              initialValue: teacher.teacherName,
              decoration: const InputDecoration(
                labelText: 'Nombre',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: InputDecoration(
                labelText: 'Teléfono',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Perfil de ${teacher.teacherName} actualizado'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  void _contactTeacher(TeacherStats teacher) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Contactar a ${teacher.teacherName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Selecciona el método de contacto:'),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.email),
              title: const Text('Enviar Email'),
              onTap: () {
                Navigator.pop(context);
                _sendEmail(teacher);
              },
            ),
            ListTile(
              leading: const Icon(Icons.message),
              title: const Text('Enviar Mensaje'),
              onTap: () {
                Navigator.pop(context);
                _sendMessage(teacher);
              },
            ),
            ListTile(
              leading: const Icon(Icons.phone),
              title: const Text('Llamar'),
              onTap: () {
                Navigator.pop(context);
                _callTeacher(teacher);
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
  }

  void _viewTeacherAlerts(TeacherStats teacher) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Alertas de ${teacher.teacherName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${teacher.alertCount} alertas activas',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 16),
            const Text('Estas alertas requieren atención inmediata.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Redirigiendo a gestión de alertas'),
                  backgroundColor: Colors.orange,
                ),
              );
            },
            child: const Text('Ver Alertas'),
          ),
        ],
      ),
    );
  }

  void _addNewTeacher() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Agregar Nuevo Profesor'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const TextField(
              decoration: InputDecoration(
                labelText: 'Nombre completo',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Teléfono',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Departamento',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'informatica', child: Text('Informática')),
                DropdownMenuItem(value: 'matematica', child: Text('Matemática')),
                DropdownMenuItem(value: 'ingenieria', child: Text('Ingeniería')),
              ],
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Profesor agregado exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Agregar'),
          ),
        ],
      ),
    );
  }

  void _sendEmail(TeacherStats teacher) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Abriendo cliente de email para ${teacher.teacherName}'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _sendMessage(TeacherStats teacher) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Enviando mensaje a ${teacher.teacherName}'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _callTeacher(TeacherStats teacher) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Llamando a ${teacher.teacherName}'),
        backgroundColor: Colors.orange,
      ),
    );
  }
}
