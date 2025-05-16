import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:incluye_app/screens/students/student_profile_screen.dart';
import 'package:incluye_app/screens/students/student_create_screen.dart';


class StudentListScreen extends StatefulWidget {
  const StudentListScreen({Key? key}) : super(key: key);

  @override
  State<StudentListScreen> createState() => _StudentListScreenState();
}

class _StudentListScreenState extends State<StudentListScreen> {
  List<dynamic> _students = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    final students = await ApiService.getAllStudents();
    setState(() {
      _students = students;
      _isLoading = false;
    });
  }

  Future<void> _deleteStudent(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('¿Eliminar estudiante?'),
        content: const Text('Esta acción no se puede deshacer. ¿Estás seguro?'),
        actions: [
          TextButton(child: const Text('Cancelar'), onPressed: () => Navigator.of(context).pop(false)),
          TextButton(child: const Text('Eliminar'), onPressed: () => Navigator.of(context).pop(true)),
        ],
      ),
    );

    if (confirm == true) {
      final success = await ApiService.deleteStudent(id);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Estudiante eliminado')));
        _fetchStudents();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al eliminar')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Estudiantes')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.separated(
              itemCount: _students.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final student = _students[index];
                return ListTile(
                  title: Text('${student['nombres']} ${student['apellidos']}'),
                  subtitle: Text(student['email']),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.person),
                        tooltip: 'Ver perfil',
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => StudentProfileScreen(studentId: student['_id']),
                            ),
                          );
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit),
                        tooltip: 'Editar',
                        onPressed: () async {
                          showDialog(
                            context: context,
                            builder: (_) => EditStudentDialog(
                              student: student,
                              onUpdated: (_) => _fetchStudents(),
                            ),
                          );
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete),
                        tooltip: 'Eliminar',
                        onPressed: () => _deleteStudent(student['_id']),
                      ),
                    ],
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
  onPressed: () async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const StudentCreateScreen()),
    );
    _fetchStudents(); // Refrescar al volver
  },
  tooltip: 'Crear estudiante',
  child: const Icon(Icons.add),
),

    );
  }
}
