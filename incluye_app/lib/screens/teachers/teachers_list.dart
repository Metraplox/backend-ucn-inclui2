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
  // ✅ PASO 1: Añadir una variable de estado para la carga
  bool _isLoading = true;

  List<dynamic> _teachers = [];
  List<Department> _departments = [];
  List<dynamic> _filteredTeachers = [];

  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'Nombre';
  final List<String> _filterOptions = ['Nombre', 'Correo', 'Departamento'];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      _filterTeachers(_searchController.text);
    });
    _fetchTeachers();
  }

  Future<void> _fetchTeachers() async {
    // No es necesario setear _isLoading a true aquí porque ya lo está por defecto.
    // Si esta función se llamara para refrescar, sí lo haríamos:
    // setState(() => _isLoading = true);
    
    try {
      // Hacemos las llamadas a la API
      final teachersData = await CareerService.getTeachersByCareer();
      final departmentsData = await DepartmentService.getDepartments();

      if (!mounted) return;

      // ✅ PASO 2: Actualizar el estado y poner _isLoading en false
      setState(() {
        _teachers = teachersData;
        _departments = departmentsData;
        _filteredTeachers = List.from(teachersData);
        _isLoading = false; // <-- La carga ha terminado
      });

    } catch (e) {
      if (!mounted) return;
      print("Error fetching teachers: $e");
      setState(() {
        _isLoading = false; // <-- Terminar la carga también si hay un error
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar los docentes: ${e.toString()}'), backgroundColor: Colors.red),
      );
    }
  }

  // ... (tus otros métodos como getDepartmentName, _filterTeachers, etc., se mantienen igual)
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Docentes")),
      body: Column(
        children: [
          // La barra de búsqueda se mantiene igual
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
          // ✅ PASO 3: Usar _isLoading para decidir qué mostrar
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator()) // <-- Mostrar esto mientras carga
                : _filteredTeachers.isEmpty
                    ? Center(
                        child: Text(
                          _searchController.text.isEmpty
                              ? 'No hay docentes registrados.'
                              : 'No se encontraron docentes con los criterios de búsqueda.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(8.0),
                        itemCount: _filteredTeachers.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, index) => _buildTeacherCard(
                          _filteredTeachers[index],
                          context,
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  // Tu _buildTeacherCard se mantiene igual
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
            
          ],
        ),
      ),
    );
  }
}