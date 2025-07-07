import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/models/career_model.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/screens/documents/student_documents_screen.dart';
import 'package:incluye_app/screens/students/studentAdjustmentSubject_screen.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/career_service.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:incluye_app/screens/students/student_profile_screen.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';

class StudentCareerListScreen extends StatefulWidget {
  final String careerId;
  const StudentCareerListScreen({super.key, required this.careerId});

  @override
  State<StudentCareerListScreen> createState() =>
      _StudentCareerListScreenState();
}

class _StudentCareerListScreenState extends State<StudentCareerListScreen> {
  List<Student> _students = [];
  List<Student> _filteredStudents = [];
  bool _isLoading = true;
  Map<String, bool> _adjustmentChecked = {};
  bool _checkLoading = true;
  // Controlador para el campo de búsqueda
  final TextEditingController _searchController = TextEditingController();
  Career? headCareer;
  // Filtro seleccionado actualmente
  String _selectedFilter = 'Nombre';

  // Opciones de filtro disponibles
  final List<String> _filterOptions = ['Nombre', 'RUT', 'Carrera'];

  @override
  void initState() {
    super.initState();
    _fetchStudents(widget.careerId);
    _getCareer(widget.careerId);

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

  Future<void> _fetchStudents(String careerId) async {
    final students = await StudentService.getStudentByCareer(careerId);

    setState(() {
      _students = students;

      _filteredStudents = students;
      _isLoading = false;
    });
  }

  Future<void> _getCareer(String careerId) async {
    try {
      final career = await CareerService.getCareerById(careerId);
      setState(() {
        headCareer = career;
      });
    } catch (e) {
      return;
    }
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
      appBar: AppBar(title: const Text('Estudiantes por carrera')),
      body: Column(
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
                    contentPadding: const EdgeInsets.symmetric(vertical: 12.0),
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
                        _filterOptions.map((filter) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: ChoiceChip(
                              label: Text(filter),
                              selected: _selectedFilter == filter,
                              onSelected: (selected) {
                                if (selected) {
                                  setState(() {
                                    _selectedFilter = filter;
                                    _filterStudents(_searchController.text);
                                  });
                                }
                              },
                            ),
                          );
                        }).toList(),
                  ),
                ),
              ],
            ),
          ),
          // Lista de estudiantes
          Expanded(
            child:
                _filteredStudents.isEmpty && !_isLoading
                    ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text(
                          _searchController.text.isEmpty
                              ? 'No hay estudiantes registrados.'
                              : 'No se encontraron estudiantes con los criterios de búsqueda.',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[700],
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                    : ListView.separated(
                      padding: const EdgeInsets.only(top: 8.0),
                      itemCount: _filteredStudents.length,
                      separatorBuilder:
                          (_, __) => const Divider(
                            height: 1,
                            indent: 16,
                            endIndent: 16,
                          ),
                      itemBuilder: (context, index) {
                        final student = _filteredStudents[index];
                        final String careerNameDisplay =
                            headCareer?.name ?? 'Carrera no asignada';

                        return ListTile(
                          leading: CircleAvatar(
                            backgroundColor:
                                Theme.of(context).primaryColorLight,
                            child: Text(
                              student.nombres.isNotEmpty
                                  ? student.nombres[0].toUpperCase()
                                  : '?',
                              style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                              ),
                            ),
                          ),
                          title: Text(
                            student.nombreCompleto,
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: Text(
                            '${student.email}\n$careerNameDisplay - RUT: ${student.rut}',
                          ),
                          isThreeLine: true,
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.person_outline),
                                tooltip: 'Ver perfil',
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder:
                                          (_) => StudentProfileScreen(
                                            studentId: student.id,
                                            
                                          ),
                                    ),
                                  ).then((_) {
                                    _fetchStudents(widget.careerId);
                                  });
                                },
                              ),
                            ],
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder:
                                    (_) => StudentProfileScreen(
                                      studentId: student.id,
                                    ),
                              ),
                            ).then((_) {
                              _fetchStudents(widget.careerId);
                            });
                          },
                        );
                      },
                    ),
          ),
        ],
      ),
    );
  }
}
