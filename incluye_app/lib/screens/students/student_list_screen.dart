import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:incluye_app/screens/students/student_profile_screen.dart';
import 'package:incluye_app/screens/students/student_create_screen.dart';
import 'package:incluye_app/screens/documents/student_documents_screen.dart'; // Importamos la pantalla de documentos


class StudentListScreen extends StatefulWidget {
  const StudentListScreen({super.key});

  @override
  State<StudentListScreen> createState() => _StudentListScreenState();
}

class _StudentListScreenState extends State<StudentListScreen> {
  List<dynamic> _students = [];
  List<dynamic> _filteredStudents = [];
  bool _isLoading = true;
  
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
    final students = await StudentService.getAllStudents();
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
      _filteredStudents = _students.where((student) {
        switch (_selectedFilter) {
          case 'Nombre':
            final fullName = '${student['nombres']} ${student['apellidos']}'.toLowerCase();
            return fullName.contains(lowerCaseQuery);
          case 'RUT':
            return student['rut']?.toLowerCase().contains(lowerCaseQuery) ?? false;
          case 'Carrera':
            return student['carrera']?.toLowerCase().contains(lowerCaseQuery) ?? false;
          default:
            return false;
        }
      }).toList();
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

    // Verificar si el widget sigue montado después de mostrar el diálogo
    if (!mounted) return;

    if (confirm == true) {
      final success = await StudentService.deleteStudent(id);
      
      // Verificar si el widget sigue montado después de la operación asíncrona
      if (!mounted) return;
      
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
                          children: _filterOptions.map((filter) => 
                            Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: ChoiceChip(
                                label: Text(filter),
                                selected: _selectedFilter == filter,
                                onSelected: (selected) {
                                  if (selected) {
                                    setState(() {
                                      _selectedFilter = filter;
                                      // Aplicar el filtro actual
                                      _filterStudents(_searchController.text);
                                    });
                                  }
                                },
                              ),
                            )
                          ).toList(),
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
                  title: Text('${student['nombres']} ${student['apellidos']}'),
                  // Subtítulo con el email del estudiante
                  subtitle: Text(student['email']),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Botón para ver perfil del estudiante
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
                      // Botón de documentos - Nuevo botón agregado
                      IconButton(
                        icon: const Icon(Icons.description),
                        tooltip: 'Documentos',
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => StudentDocumentsScreen(studentId: student['_id']),
                            ),
                          );
                        },
                      ),
                      // Botón para editar estudiante
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
                      // Botón para eliminar estudiante
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
                ),
              ],
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
