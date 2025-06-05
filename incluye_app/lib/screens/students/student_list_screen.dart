// screens/students/student_list_screen.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/student_model.dart'; // IMPORTANTE
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:incluye_app/screens/students/student_profile_screen.dart'; // Esta es la que ve el admin por ID
import 'package:incluye_app/screens/students/student_create_screen.dart';
import 'package:incluye_app/screens/documents/student_documents_screen.dart';

class StudentListScreen extends StatefulWidget {
  const StudentListScreen({super.key});

  @override
  State<StudentListScreen> createState() => _StudentListScreenState();
}

class _StudentListScreenState extends State<StudentListScreen> {
  List<Student> _students = []; // Tipado como List<Student>
  List<Student> _filteredStudents = []; // Tipado como List<Student>
  bool _isLoading = true;

  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'Nombre';
  final List<String> _filterOptions = ['Nombre', 'RUT', 'Carrera'];

  @override
  void initState() {
    super.initState();
    _fetchStudents();
    _searchController.addListener(() {
      _filterStudents(_searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchStudents() async {
    if (!mounted) return;
    setState(() { _isLoading = true; }); // Mostrar loading al refrescar
    final studentsData = await StudentService.getAllStudents(); // Devuelve List<Student>
    if (!mounted) return;
    setState(() {
      _students = studentsData;
      _filteredStudents = studentsData;
      _isLoading = false;
    });
  }

  void _filterStudents(String query) {
    if (query.isEmpty) {
      if (!mounted) return;
      setState(() { _filteredStudents = _students; });
      return;
    }

    final lowerCaseQuery = query.toLowerCase();
    if (!mounted) return;
    setState(() {
      _filteredStudents = _students.where((student) { // student es un objeto Student
        switch (_selectedFilter) {
          case 'Nombre':
            return student.nombreCompleto.toLowerCase().contains(lowerCaseQuery);
          case 'RUT':
            return student.rut.toLowerCase().contains(lowerCaseQuery);
          case 'Carrera':
            return student.carreraNombre?.toLowerCase().contains(lowerCaseQuery) ?? false;
          default:
            return false;
        }
      }).toList();
    });
  }

  Future<void> _deleteStudent(String studentDocId) async { // Renombrado para claridad
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

    if (!mounted || confirm != true) return;

    final success = await StudentService.deleteStudent(studentDocId);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Estudiante eliminado')));
      _fetchStudents();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al eliminar estudiante')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lista de Estudiantes (Admin)')), // Título actualizado
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column( /* ... (SearchBar y Filtros sin cambios funcionales) ... */ ),
                ),
                Expanded(
                  child: ListView.separated(
                    itemCount: _filteredStudents.length,
                    separatorBuilder: (_, __) => const Divider(),
                    itemBuilder: (context, index) {
                      final student = _filteredStudents[index]; // student es un objeto Student
                      return ListTile(
                        title: Text(student.nombreCompleto),
                        subtitle: Text(student.email), // Email del Student
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
                                    // Se pasa el ID del documento Student
                                    builder: (_) => StudentProfileScreen(studentId: student.id),
                                  ),
                                ).then((_) { _fetchStudents(); }); // Refrescar al volver
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.description),
                              tooltip: 'Documentos',
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    // Se pasa el ID del documento Student
                                    builder: (_) => StudentDocumentsScreen(studentId: student.id),
                                  ),
                                );
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.edit),
                              tooltip: 'Editar',
                              onPressed: () async {
                                final result = await showDialog<bool>(
                                  context: context,
                                  builder: (_) => EditStudentDialog(
                                    student: student, // Pasa el objeto Student completo
                                    onUpdated: (updatedStudent) {
                                      Navigator.of(context).pop(true); // Indicar que hubo actualización
                                    },
                                  ),
                                );
                                if (result == true) {
                                  _fetchStudents();
                                }
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete),
                              tooltip: 'Eliminar',
                              onPressed: () => _deleteStudent(student.id), // Pasa el ID del Student
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (context) => const StudentCreateScreen()),
          );
          if (result == true) {
            _fetchStudents();
          }
        },
        tooltip: 'Crear estudiante',
        child: const Icon(Icons.add),
      ),
    );
  }
}