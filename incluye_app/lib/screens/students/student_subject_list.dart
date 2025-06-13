import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/screens/students/studentAdjustmentSubject_screen.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:incluye_app/screens/students/student_profile_screen.dart';

class StudentSubjectListScreen extends StatefulWidget {
  final String courseId;
  const StudentSubjectListScreen({super.key, required this.courseId});

  @override
  State<StudentSubjectListScreen> createState() =>
      _StudentSubjectListScreenState();
}

class _StudentSubjectListScreenState extends State<StudentSubjectListScreen> {
  List<Student> _students = [];
  List<Student> _filteredStudents = [];
  bool _isLoading = true;
  Map<String, bool> _adjustmentChecked = {};
  bool _checkLoading = true;
  // Controlador para el campo de búsqueda
  final TextEditingController _searchController = TextEditingController();

  // Filtro seleccionado actualmente
  String _selectedFilter = 'Nombre';

  // Opciones de filtro disponibles
  final List<String> _filterOptions = ['Nombre', 'RUT', 'Carrera'];

  @override
  void initState() {
    super.initState();
    _fetchStudents();

    // Agregar listener al controlador de búsqueda
    _searchController.addListener(() {
      _filterStudents(_searchController.text);
    });
  }

  @override
  void dispose() {
    // Limpiar el controlador cuando se destruya el widget
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchStudents() async {
    final students = await CourseService.getStudentsBySubject(widget.courseId);
    setState(() {
      _students = students;

      _filteredStudents = students;
      _isLoading = false;
    });
  }

  // Método para filtrar estudiantes según el texto de búsqueda y el filtro seleccionado
  void _filterStudents(String query) {
    if (query.isEmpty) {
      setState(() {
        _filteredStudents = _students;
      });
      return;
    }

    final lowerCaseQuery = query.toLowerCase();

    setState(() {
      _filteredStudents =
          _students.where((student) {
            switch (_selectedFilter) {
              case 'Nombre':
                final fullName =
                    '${student.nombres} ${student.apellidos}'.toLowerCase();
                return fullName.contains(lowerCaseQuery);
              case 'RUT':
                return student.rut.toLowerCase().contains(lowerCaseQuery) ??
                    false;
              case 'Carrera':
                return student.carreraNombre?.toLowerCase().contains(
                      lowerCaseQuery,
                    ) ??
                    false;
              default:
                return false;
            }
          }).toList();
      for (var student in _students) {
        _adjustmentChecked[student.id] = false;
      }
      _checkLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Estudiantes')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Column(
                children: [
                  // Barra de búsqueda y filtros
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Campo de búsqueda
                        TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Buscar estudiantes...',
                            prefixIcon: const Icon(Icons.search),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 12.0,
                            ),
                            filled: true,
                            fillColor: Colors.grey[100],
                          ),
                        ),
                        const SizedBox(height: 8.0),
                        // Opciones de filtro
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children:
                                _filterOptions
                                    .map(
                                      (filter) => Padding(
                                        padding: const EdgeInsets.only(
                                          right: 8.0,
                                        ),
                                        child: ChoiceChip(
                                          label: Text(filter),
                                          selected: _selectedFilter == filter,
                                          onSelected: (selected) {
                                            if (selected) {
                                              setState(() {
                                                _selectedFilter = filter;
                                                // Aplicar el filtro actual
                                                _filterStudents(
                                                  _searchController.text,
                                                );
                                              });
                                            }
                                          },
                                        ),
                                      ),
                                    )
                                    .toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Lista de estudiantes
                  Expanded(
                    child: ListView.separated(
                      itemCount: _filteredStudents.length,
                      separatorBuilder: (_, __) => const Divider(),
                      itemBuilder: (context, index) {
                        final student = _filteredStudents[index];
                        return ListTile(
                          // Título con nombre y apellido del estudiante
                          title: Text(
                            '${student.nombreCompleto} ',
                            style: TextStyle(
                              fontSize: 25,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          // Subtítulo con el email del estudiante
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                student.email,
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                          trailing: TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder:
                                      (context) =>
                                          StudentAdjustmentSubjectScreen(
                                            studentId: student.id,
                                            courseId: widget.courseId,
                                          ),
                                ),
                              );
                            },

                            style: TextButton.styleFrom(
                              backgroundColor: Colors.black,
                            ),
                            child: Text(
                              'Ver Ajustes',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w400,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
    );
  }
}
