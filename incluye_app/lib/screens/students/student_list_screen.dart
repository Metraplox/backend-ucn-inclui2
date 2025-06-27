// screens/students/student_list_screen.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/career_service.dart'; // IMPORTADO
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:incluye_app/screens/students/student_profile_screen.dart';
import 'package:incluye_app/screens/students/student_create_screen.dart';
import 'package:incluye_app/screens/documents/student_documents_screen.dart';

class StudentListScreen extends StatefulWidget {
  const StudentListScreen({super.key});

  @override
  State<StudentListScreen> createState() => _StudentListScreenState();
}

class _StudentListScreenState extends State<StudentListScreen> {
  List<Student> _students = [];
  List<Student> _filteredStudents = [];
  bool _isLoading = true;

  Map<String, String> _careerNamesMap =
      {}; // Mapa para ID de carrera -> Nombre de carrera

  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'Nombre';
  final List<String> _filterOptions = ['Nombre', 'RUT', 'Carrera'];

  @override
  void initState() {
    super.initState();
    _loadInitialData(); // Carga carreras y luego estudiantes
    _searchController.addListener(() {
      _filterStudents(_searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    try {
      final careers = await CareerService.getAllCareers();
      if (!mounted) return;

      _careerNamesMap = {for (var career in careers) career.id: career.name};
      // --- INICIO DEBUG PRINTS ---
      print("StudentListScreen: ---- INICIO DEBUG CARRERAS ----");
      print(
        "StudentListScreen: Mapa de carreras (_careerNamesMap): $_careerNamesMap",
      );
      if (careers.isNotEmpty) {
        print(
          "StudentListScreen: Detalle primera carrera en mapa - ID: ${careers.first.id}, Nombre: ${careers.first.name}",
        );
      }
      print("StudentListScreen: ---- FIN DEBUG CARRERAS ----");
      // --- FIN DEBUG PRINTS ---

      final studentsData = await StudentService.getAllStudents();
      print(studentsData);
      if (!mounted) return;

      // --- INICIO DEBUG PRINTS ESTUDIANTES ---
      print("StudentListScreen: ---- INICIO DEBUG ESTUDIANTES ----");
      if (studentsData.isNotEmpty) {
        for (int i = 0; i < studentsData.length; i++) {
          final student = studentsData[i];
          print(
            "StudentListScreen: Estudiante[$i]: Nombre=${student.nombreCompleto}, CarreraID=${student.rawCarreraId}, CarreraObjetoCompleto=${student.carreraIdObject}",
          );
          // También verifica si carreraId es un String directamente en el JSON del estudiante
          // Esto es por si Student.fromJson no está parseando carreraId a un objeto Career,
          // sino que lo deja como String, lo cual es incorrecto según nuestro modelo.
          // Pero si StudentService.getAllStudents() devuelve datos crudos, podría ser un Map.
          // Si studentsData es List<Map<String,dynamic>>:
          // print("StudentListScreen: Estudiante[$i] (raw): CarreraID=${student['carreraId']}");
        }
      } else {
        print("StudentListScreen: No se obtuvieron estudiantes.");
      }
      print("StudentListScreen: ---- FIN DEBUG ESTUDIANTES ----");
      // --- FIN DEBUG PRINTS ESTUDIANTES ---

      setState(() {
        _students = studentsData;
        _filteredStudents = studentsData;
        _isLoading = false;
      });
    } catch (e, s) {
      print(
        "StudentListScreen: Error cargando datos iniciales: $e\nStacktrace: $s",
      );
      if (mounted) {
        setState(() {
          _isLoading = false;
        }); // Asegurar que el loading termine
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar datos iniciales: ${e.toString()}'),
          ),
        );
      }
    }
    // El _isLoading = false; se maneja dentro de _fetchStudentsOnly o en el catch
  }

  Future<void> _fetchStudentsOnly() async {
    // No se establece _isLoading = true aquí si _loadInitialData ya lo hizo.
    // Si se llama independientemente, sí debería.
    // Para ser seguro, si no está ya cargando:
    if (!_isLoading && mounted) {
      setState(() {
        _isLoading = true;
      });
    }

    final studentsData = await StudentService.getAllStudents();
    if (!mounted) return;

    setState(() {
      _students = studentsData;
      // Re-aplicar filtro si el searchController tiene texto, usando el mapa de carreras ya cargado
      _filterStudents(_searchController.text);
      _isLoading = false;
    });
  }

  void _filterStudents(String query) {
    if (!mounted) return;

    List<Student> tempList = [];
    if (query.isEmpty) {
      tempList = List.from(_students);
    } else {
      final lowerCaseQuery = query.toLowerCase();
      tempList =
          _students.where((student) {
            switch (_selectedFilter) {
              case 'Nombre':
                return student.nombreCompleto.toLowerCase().contains(
                  lowerCaseQuery,
                );
              case 'RUT':
                return student.rut.toLowerCase().contains(lowerCaseQuery);
              case 'Carrera':
                // Usar el mapa de nombres de carrera para filtrar
                // student.carreraId puede ser null si un estudiante no tiene carrera asignada
                final careerName = _careerNamesMap[student.rawCarreraId] ?? '';
                return careerName.toLowerCase().contains(lowerCaseQuery);
              default:
                return false;
            }
          }).toList();
    }
    setState(() {
      _filteredStudents = tempList;
    });
  }

  Future<void> _deleteStudent(String studentDocId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (_) => AlertDialog(
            title: const Text('¿Eliminar estudiante?'),
            content: const Text(
              'Esta acción no se puede deshacer. ¿Estás seguro?',
            ),
            actions: [
              TextButton(
                child: const Text('Cancelar'),
                onPressed: () => Navigator.of(context).pop(false),
              ),
              TextButton(
                child: const Text(
                  'Eliminar',
                  style: TextStyle(color: Colors.red),
                ),
                onPressed: () => Navigator.of(context).pop(true),
              ),
            ],
          ),
    );

    if (!mounted || confirm != true) return;

    final success = await StudentService.deleteStudent(studentDocId);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Estudiante eliminado'),
          backgroundColor: Colors.green,
        ),
      );
      _fetchStudentsOnly(); // Solo refrescar estudiantes
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error al eliminar estudiante'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lista de Estudiantes (Admin)')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Column(
                children: [
                  // --- BARRA DE BÚSQUEDA Y FILTROS ---
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Buscar...', // Más genérico
                            prefixIcon: const Icon(Icons.search),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(
                                12.0,
                              ), // Más redondeado
                              borderSide:
                                  BorderSide
                                      .none, // Sin borde visible por defecto
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide(
                                color: Theme.of(context).primaryColor,
                                width: 1.5,
                              ),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 14.0,
                              horizontal: 16.0,
                            ), // Ajuste de padding
                            filled: true,
                            fillColor: Theme.of(context)
                                .colorScheme
                                .surfaceVariant
                                .withOpacity(0.5), // Color sutil
                            suffixIcon:
                                _searchController.text.isNotEmpty
                                    ? IconButton(
                                      icon: const Icon(Icons.clear, size: 20),
                                      onPressed: () {
                                        _searchController
                                            .clear(); // _filterStudents se llama por el listener
                                      },
                                    )
                                    : null,
                          ),
                        ),
                        const SizedBox(height: 12.0),
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
                                          selectedColor:
                                              Theme.of(context).primaryColor,
                                          labelStyle: TextStyle(
                                            color:
                                                _selectedFilter == filter
                                                    ? Theme.of(
                                                      context,
                                                    ).colorScheme.onPrimary
                                                    : Theme.of(context)
                                                        .textTheme
                                                        .bodyLarge
                                                        ?.color,
                                            fontWeight:
                                                _selectedFilter == filter
                                                    ? FontWeight.bold
                                                    : FontWeight.normal,
                                          ),
                                          checkmarkColor:
                                              Theme.of(
                                                context,
                                              ).colorScheme.onPrimary,
                                          onSelected: (selected) {
                                            if (selected) {
                                              setState(() {
                                                _selectedFilter = filter;
                                                _filterStudents(
                                                  _searchController.text,
                                                );
                                              });
                                            }
                                          },
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                          ),
                                          side: BorderSide(
                                            color: Colors.grey.shade300,
                                          ),
                                          backgroundColor:
                                              Theme.of(
                                                context,
                                              ).colorScheme.surface,
                                          elevation:
                                              _selectedFilter == filter ? 2 : 0,
                                        ),
                                      ),
                                    )
                                    .toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // --- FIN BARRA DE BÚSQUEDA Y FILTROS ---
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
                              padding: const EdgeInsets.only(
                                top: 8.0,
                              ), // Espacio arriba de la lista
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
                                    _careerNamesMap[student.rawCarreraId] ??
                                    'Carrera no asignada';
                                print(
                                  "StudentListScreen: Mostrando estudiante: ${student.nombreCompleto}, Carrera: $careerNameDisplay",
                                );

                                return ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor:
                                        Theme.of(context).primaryColorLight,
                                    child: Text(
                                      student.nombres.isNotEmpty
                                          ? student.nombres[0].toUpperCase()
                                          : '?',
                                      style: TextStyle(
                                        color:
                                            Theme.of(context).primaryColorDark,
                                      ),
                                    ),
                                  ),
                                  title: Text(
                                    student.nombreCompleto,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w500,
                                    ),
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
                                            _fetchStudentsOnly();
                                          });
                                        },
                                      ),
                                      IconButton(
                                        icon: const Icon(
                                          Icons.folder_open_outlined,
                                        ),
                                        tooltip: 'Documentos',
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder:
                                                  (_) => StudentDocumentsScreen(
                                                    studentId: student.id,
                                                  ),
                                            ),
                                          );
                                        },
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.edit_outlined),
                                        tooltip: 'Editar',
                                        onPressed: () async {
                                          final result = await showDialog<bool>(
                                            context: context,
                                            builder:
                                                (_) => EditStudentDialog(
                                                  student: student,
                                                  onUpdated: (updatedStudent) {
                                                    Navigator.of(
                                                      context,
                                                    ).pop(true);
                                                  },
                                                ),
                                          );
                                          if (result == true) {
                                            _fetchStudentsOnly();
                                          }
                                        },
                                      ),
                                      IconButton(
                                        icon: Icon(
                                          Icons.delete_outline,
                                          color: Colors.red.shade700,
                                        ),
                                        tooltip: 'Eliminar',
                                        onPressed:
                                            () => _deleteStudent(student.id),
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
                                      _fetchStudentsOnly();
                                    });
                                  },
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
            MaterialPageRoute(
              builder: (context) => const StudentCreateScreen(),
            ),
          );
          if (result == true) {
            _fetchStudentsOnly();
          }
        },
        tooltip: 'Crear estudiante',
        child: const Icon(Icons.add),
      ),
    );
  }
}
