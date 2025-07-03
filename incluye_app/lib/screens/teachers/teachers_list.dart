import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:incluye_app/models/department_model.dart';
import 'package:incluye_app/models/fullUser_model.dart';
import 'package:incluye_app/models/teacherStats_model.dart';
import 'package:incluye_app/screens/teachers/teacher_stats.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/services/career_service.dart';
import 'package:incluye_app/services/department_service.dart';
import 'package:incluye_app/services/user_service.dart';
import 'package:incluye_app/widgets/edit_user_dialog.dart';

class TeachersListScreen extends StatefulWidget {
  const TeachersListScreen({super.key});
  @override
  State<TeachersListScreen> createState() => _TeachersListScreenState();
}

class _TeachersListScreenState extends State<TeachersListScreen> {
  List<dynamic> _teachers = [];
  List<Department> _departments = [];

  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'Nombre';
  List<String> _filterOptions = ['Nombre', 'Correo', 'Departamento'];

  List<dynamic> _filteredTeachers = [];

  Future<void> _fetchTeachers() async {
    final teachers = await CareerService.getAllTeachers();
    final departments = await DepartmentService.getDepartments();

    setState(() {
      _teachers = teachers;
      _filteredTeachers = teachers;
      _departments = departments;
    });
  }

  String getDepartmentName(List<dynamic> departmentIds) {
    if (departmentIds.isEmpty) return 'N/A';

    final id = departmentIds.first;
    final match = _departments.firstWhere(
      (dep) => dep.id == id,
      orElse:
          () => Department(
            id: '',
            name: 'Desconocido',
            code: 'N/A',
            faculty: 'N/A',
            campus: 'N/A',
          ),
    );
    return match.name;
  }

  void _filterTeachers(String query) {
    if (!mounted) return;

    List<dynamic> tempList = [];
    if (query.isEmpty) {
      tempList = List.from(_teachers);
    } else {
      final lowerCaseQuery = query.toLowerCase();
      tempList =
          _teachers.where((teacher) {
            final name = teacher['nombreCompleto']?.toLowerCase() ?? '';
            final email = teacher['email']?.toLowerCase() ?? '';
            final deptIds =
                teacher['additionalResponsibilities']?['departmentIds'] ?? [];

            final deptName = getDepartmentName(deptIds).toLowerCase();

            switch (_selectedFilter) {
              case 'Nombre':
                return name.contains(lowerCaseQuery);
              case 'Correo':
                return email.contains(lowerCaseQuery);
              case 'Departamento':
                return deptName.contains(lowerCaseQuery);
              default:
                return false;
            }
          }).toList();
    }

    setState(() {
      _filteredTeachers = tempList;
    });
  }

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      _filterTeachers(_searchController.text);
    });
    _fetchTeachers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Docentes")),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Buscar...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12.0),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12.0),
                      borderSide: BorderSide(color: Colors.grey.shade300),
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
                    ),
                    filled: true,
                    fillColor: Theme.of(
                      context,
                    ).colorScheme.surfaceVariant.withOpacity(0.5),
                    suffixIcon:
                        _searchController.text.isNotEmpty
                            ? IconButton(
                              icon: const Icon(Icons.clear, size: 20),
                              onPressed: () {
                                _searchController.clear();
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
                                padding: const EdgeInsets.only(right: 8.0),
                                child: ChoiceChip(
                                  label: Text(filter),
                                  selected: _selectedFilter == filter,
                                  selectedColor: Theme.of(context).primaryColor,
                                  labelStyle: TextStyle(
                                    color:
                                        _selectedFilter == filter
                                            ? Theme.of(
                                              context,
                                            ).colorScheme.onPrimary
                                            : Theme.of(
                                              context,
                                            ).textTheme.bodyLarge?.color,
                                    fontWeight:
                                        _selectedFilter == filter
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                  ),
                                  checkmarkColor:
                                      Theme.of(context).colorScheme.onPrimary,
                                  onSelected: (selected) {
                                    if (selected) {
                                      setState(() {
                                        _selectedFilter = filter;
                                        _filterTeachers(_searchController.text);
                                      });
                                    }
                                  },
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  side: BorderSide(color: Colors.grey.shade300),
                                  backgroundColor:
                                      Theme.of(context).colorScheme.surface,
                                  elevation: _selectedFilter == filter ? 2 : 0,
                                ),
                              ),
                            )
                            .toList(),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child:
                _filteredTeachers.isEmpty
                    ? Center(
                      child: Text(
                        _searchController.text.isEmpty
                            ? 'No hay docentes registrados.'
                            : 'No se encontraron docentes con los criterios de búsqueda.',
                        style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                        textAlign: TextAlign.center,
                      ),
                    )
                    : ListView.separated(
                      padding: const EdgeInsets.all(8.0),
                      itemCount: _filteredTeachers.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final teacher = _filteredTeachers[index];

                        return Card(
                          elevation: 3,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          margin: const EdgeInsets.symmetric(
                            vertical: 6,
                            horizontal: 8,
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            leading: CircleAvatar(
                              backgroundColor:
                                  Theme.of(context).primaryColorLight,
                              child: Text(
                                teacher['nombreCompleto']
                                        ?.substring(0, 1)
                                        .toUpperCase() ??
                                    '?',
                                style: TextStyle(
                                  color: Theme.of(context).primaryColorDark,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              teacher['nombreCompleto'] ??
                                  'Nombre no disponible',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 16,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Text(teacher['email'] ?? 'Sin correo'),
                                const SizedBox(height: 2),
                                Text(
                                  'Departamento: ${getDepartmentName(teacher['additionalResponsibilities']['departmentIds'] ?? [])}',
                                ),
                                const SizedBox(height: 2),
                              ],
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.person_outline),
                                  tooltip: 'Ver perfil',
                                  onPressed: () {
                                    final teacherObj = TeacherStats.fromJson(
                                      teacher,
                                    );
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (context) => TeacherStatsScreen(
                                              teacher: teacherObj,
                                            ),
                                      ),
                                    );
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined),
                                  tooltip: 'Editar',
                                  onPressed: () {
                                    // Aquí va la lógica para editar
                                    _showEditTeacherDialog(teacher);
                                  },
                                ),
                                IconButton(
                                  icon: Icon(
                                    Icons.delete_outline,
                                    color: Colors.red.shade700,
                                  ),
                                  tooltip: 'Eliminar',
                                  onPressed: () {
                                    // Aquí va la lógica para borrar
                                    _confirmDeleteTeacher(teacher);
                                  },
                                ),
                              ],
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

  void _showEditTeacherDialog(Map<String, dynamic> teacher) {
    showDialog(
      context: context,
      builder:
          (context) => EditUserDialog(
            user: FullUser.fromJson(
              teacher,
            ), // o como conviertas tu mapa a FullUser
            onUpdated: (updatedUser) {
              // Actualizar la lista de profesores con el usuario editado
              setState(() {
                int index = _teachers.indexWhere(
                  (t) => t['_id'] == updatedUser.id,
                );
                if (index != -1) {
                  _teachers[index] =
                      updatedUser.toJson(); // o actualizar como guardas
                }
              });
            },
          ),
    );
  }

  void _confirmDeleteTeacher(Map<String, dynamic> teacher) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Confirmar eliminación'),
            content: Text(
              '¿Seguro que quieres eliminar al docente ${teacher['nombreCompleto']}?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancelar'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _deleteTeacher(
                    teacher['_id'],
                  ); // ← esta llama la versión no estática
                },
                child: const Text(
                  'Eliminar',
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
    );
  }

  void _deleteTeacher(String teacherId) async {
    try {
      await UserService.deleteUser(teacherId);

      if (!mounted) return;
      // Mostrar mensaje corto abajo
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Profesor eliminado correctamente"),
          backgroundColor: Color.fromARGB(255, 125, 128, 125),
        ),
      );

      // Refrescar lista
      _fetchTeachers();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Error al eliminar profesor"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Widget _buildTeacherCard(Map<String, dynamic> teacher, BuildContext context) {
    final String departmentName = getDepartmentName(
      teacher['additionalResponsibilities']['departmentIds'] ?? [],
    );

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: Theme.of(context).primaryColorLight,
        child: Text(
          teacher['nombreCompleto']?.substring(0, 1).toUpperCase() ?? '?',
          style: TextStyle(
            color: Theme.of(context).primaryColorDark,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      title: Text(
        teacher['nombreCompleto'] ?? 'Nombre no disponible',
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
      ),
      subtitle: Text(
        '${teacher['email'] ?? 'Sin correo'}\nDepartamento: $departmentName',
      ),
      isThreeLine: true,
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.bar_chart),
            tooltip: 'Ver estadísticas',
            onPressed: () {
              final teacherObj = TeacherStats.fromJson(teacher);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TeacherStatsScreen(teacher: teacherObj),
                ),
              );
            },
          ),
          // Aquí puedes agregar más IconButtons si necesitas (editar, eliminar, etc.)
        ],
      ),
      onTap: () {
        final teacherObj = TeacherStats.fromJson(teacher);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TeacherStatsScreen(teacher: teacherObj),
          ),
        );
      },
    );
  }
}
