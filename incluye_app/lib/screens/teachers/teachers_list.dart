import 'package:flutter/material.dart';
import 'package:incluye_app/models/department_model.dart';
import 'package:incluye_app/models/fullUser_model.dart';
import 'package:incluye_app/models/teacherStats_model.dart';
import 'package:incluye_app/screens/teachers/teacher_stats.dart';
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
  final List<String> _filterOptions = ['Nombre', 'Correo', 'Departamento'];

  List<dynamic> _filteredTeachers = [];

  Future<void> _fetchTeachers() async {
    final teachers = await CareerService.getTeachersByCareer();
    final departments = await DepartmentService.getDepartments();
    setState(() {
      _teachers = teachers;
      _departments = departments;
      _filteredTeachers = List.from(teachers);
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
    final lowerQuery = query.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredTeachers = List.from(_teachers);
      } else {
        _filteredTeachers =
            _teachers.where((teacher) {
              final name =
                  teacher['teacherName']?.toLowerCase() ??
                  teacher['nombreCompleto']?.toLowerCase() ??
                  '';
              final email =
                  teacher['teacherEmail']?.toLowerCase() ??
                  teacher['email']?.toLowerCase() ??
                  '';
              final deptName =
                  (teacher['department'] ??
                          getDepartmentName(
                            teacher['additionalResponsibilities']?['departmentIds'] ??
                                [],
                          ))
                      .toLowerCase();

              switch (_selectedFilter) {
                case 'Nombre':
                  return name.contains(lowerQuery);
                case 'Correo':
                  return email.contains(lowerQuery);
                case 'Departamento':
                  return deptName.contains(lowerQuery);
                default:
                  return false;
              }
            }).toList();
      }
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
                    filled: true,
                    fillColor: Theme.of(
                      context,
                    ).colorScheme.surfaceVariant.withOpacity(0.5),
                    suffixIcon:
                        _searchController.text.isNotEmpty
                            ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () => _searchController.clear(),
                            )
                            : null,
                  ),
                ),
                const SizedBox(height: 12.0),
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
                                  setState(() => _selectedFilter = filter);
                                  _filterTeachers(_searchController.text);
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
          Expanded(
            child:
                _filteredTeachers.isEmpty
                    ? Center(
                      child: Text(
                        _searchController.text.isEmpty
                            ? 'No hay docentes registrados.'
                            : 'No se encontraron docentes con los criterios de búsqueda.',
                      ),
                    )
                    : ListView.separated(
                      padding: const EdgeInsets.all(8.0),
                      itemCount: _filteredTeachers.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder:
                          (context, index) => _buildTeacherCard(
                            _filteredTeachers[index],
                            context,
                          ),
                    ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeacherCard(Map<String, dynamic> teacher, BuildContext context) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).primaryColorLight,
          child: Text(
            (teacher['teacherName'] ?? teacher['nombreCompleto'] ?? '?')
                .toString()
                .substring(0, 1)
                .toUpperCase(),
            style: TextStyle(
              color: Theme.of(context).primaryColorDark,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          teacher['teacherName'] ?? teacher['nombreCompleto'] ?? 'Sin nombre',
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(teacher['teacherEmail'] ?? teacher['email'] ?? 'Sin correo'),
            const SizedBox(height: 2),
            Text(
              'Departamento: ${teacher['department'] ?? getDepartmentName(teacher['additionalResponsibilities']?['departmentIds'] ?? [])}',
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.person_outline),
              tooltip: 'Ver perfil',
              onPressed: () {
                final teacherObj = TeacherStats.fromJson(teacher);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder:
                        (context) => TeacherStatsScreen(teacher: teacherObj),
                  ),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Editar',
              onPressed: () => _showEditTeacherDialog(teacher),
            ),
            IconButton(
              icon: Icon(Icons.delete_outline, color: Colors.red.shade700),
              tooltip: 'Eliminar',
              onPressed: () => _confirmDeleteTeacher(teacher),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditTeacherDialog(Map<String, dynamic> teacher) {
    showDialog(
      context: context,
      builder:
          (context) => EditUserDialog(
            user: FullUser.fromJson(teacher),
            onUpdated: (updatedUser) {
              setState(() {
                int index = _teachers.indexWhere(
                  (t) => t['_id'] == updatedUser.id,
                );
                if (index != -1) {
                  _teachers[index] = updatedUser.toJson();
                  _filterTeachers(_searchController.text);
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
              '¿Seguro que quieres eliminar al docente ${teacher['teacherName'] ?? teacher['nombreCompleto']}?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancelar'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _deleteTeacher(teacher['_id']);
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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Profesor eliminado correctamente"),
          backgroundColor: Color.fromARGB(255, 125, 128, 125),
        ),
      );
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
}
