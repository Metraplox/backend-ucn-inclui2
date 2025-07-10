// screens/users/users_list_screen.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/user_model.dart';
import 'package:incluye_app/models/fullUser_model.dart'; // Importar el modelo completo
import 'package:incluye_app/services/user_service.dart';
import 'package:incluye_app/widgets/edit_user_dialog.dart';
import 'package:incluye_app/screens/users/user_create_screen.dart';
// import 'package:incluye_app/screens/users/user_create_screen.dart'; 

class UsersListScreen extends StatefulWidget {
  const UsersListScreen({super.key});

  @override
  State<UsersListScreen> createState() => _UsersListScreenState();
}

class _UsersListScreenState extends State<UsersListScreen> {
  // ... (tus variables de estado y métodos initState, dispose, _loadUsers, _filterUsers, _deleteUser se mantienen igual)
  List<User> _users = [];
  List<User> _filteredUsers = [];
  bool _isLoading = true;

  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'Nombre';
  final List<String> _filterOptions = ['Nombre', 'Email', 'Rol'];

  @override
  void initState() {
    super.initState();
    _loadUsers();
    _searchController.addListener(() {
      _filterUsers(_searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadUsers() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    try {
      final usersData = await UserService.getAllUsers();
      if (!mounted) return;

      setState(() {
        _users = usersData;
        _filteredUsers = usersData;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar usuarios: ${e.toString()}')),
        );
      }
    }
  }

  void _filterUsers(String query) {
    if (!mounted) return;

    List<User> tempList = [];
    if (query.isEmpty) {
      tempList = List.from(_users);
    } else {
      final lowerCaseQuery = query.toLowerCase();
      tempList = _users.where((user) {
        switch (_selectedFilter) {
          case 'Nombre':
            return user.nombreCompleto.toLowerCase().contains(lowerCaseQuery);
          case 'Email':
            return user.email.toLowerCase().contains(lowerCaseQuery);
          case 'Rol':
            return user.roles.any((role) => role.toLowerCase().contains(lowerCaseQuery));
          default:
            return false;
        }
      }).toList();
    }
    setState(() {
      _filteredUsers = tempList;
    });
  }

  Future<void> _deleteUser(String userId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('¿Eliminar Usuario?'),
        content: const Text('Esta acción no se puede deshacer. ¿Estás seguro?'),
        actions: [
          TextButton(
            child: const Text('Cancelar'),
            onPressed: () => Navigator.of(context).pop(false),
          ),
          TextButton(
            child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
            onPressed: () => Navigator.of(context).pop(true),
          ),
        ],
      ),
    );

    if (!mounted || confirm != true) return;

    final success = await UserService.deleteUser(userId);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Usuario eliminado'), backgroundColor: Colors.green),
      );
      _loadUsers();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al eliminar el usuario'), backgroundColor: Colors.red),
      );
    }
  }

  // =======================================================================
  // MÉTODO PARA MOSTRAR EL DIÁLOGO DE EDICIÓN
  // =======================================================================
  Future<void> _showEditUserDialog(User user) async {
    // Mostrar un indicador de carga mientras se obtienen los datos completos
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      // PASO 1: Obtener el FullUser usando el ID del User simple
      final FullUser fullUser = await UserService.getUserById(user.id);
      
      if (!mounted) return;
      Navigator.pop(context); // Cerrar el indicador de carga

      // PASO 2: Mostrar el diálogo de edición con los datos completos
      // ✅ INICIO DE LA CORRECCIÓN
      await showDialog(
        context: context,
        builder: (_) => EditUserDialog(
          user: fullUser,
          onUpdated: () { // <-- La función ahora no tiene parámetros
            // Cuando el diálogo se cierra después de guardar, recargamos la lista.
            _loadUsers();
          },
        ),
      );
      // ✅ FIN DE LA CORRECCIÓN
      // Ya no necesitamos 'result' ni el 'if (result == true)'
      
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Cerrar el indicador de carga en caso de error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al obtener datos del usuario: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lista de Usuarios (Admin)')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // ... (tu UI de búsqueda y filtros se mantiene igual)
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
                          fillColor: Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.5),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear, size: 20),
                                  onPressed: () => _searchController.clear(),
                                )
                              : null,
                        ),
                      ),
                      const SizedBox(height: 12.0),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _filterOptions.map((filter) => Padding(
                                    padding: const EdgeInsets.only(right: 8.0),
                                    child: ChoiceChip(
                                      label: Text(filter),
                                      selected: _selectedFilter == filter,
                                      selectedColor: Theme.of(context).primaryColor,
                                      labelStyle: TextStyle(
                                        color: _selectedFilter == filter
                                            ? Theme.of(context).colorScheme.onPrimary
                                            : Theme.of(context).textTheme.bodyLarge?.color,
                                      ),
                                      onSelected: (selected) {
                                        if (selected) {
                                          setState(() {
                                            _selectedFilter = filter;
                                            _filterUsers(_searchController.text);
                                          });
                                        }
                                      },
                                    ),
                                  )).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _filteredUsers.isEmpty && !_isLoading
                      ? Center(/* ... */)
                      : ListView.separated(
                          // --- INICIO DE LA CORRECCIÓN ---
                          padding: const EdgeInsets.only(
                            top: 8.0, 
                            bottom: 80.0, // <-- AÑADIR ESTE PADDING INFERIOR
                          ),
                          // --- FIN DE LA CORRECCIÓN ---
                          itemCount: _filteredUsers.length,
                          separatorBuilder: (_, __) => const Divider(height: 1, indent: 16, endIndent: 16),
                          itemBuilder: (context, index) {
                            final user = _filteredUsers[index];
                            final rolesDisplay = user.roles.join(', ');

                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Theme.of(context).primaryColorLight,
                                child: Text(
                                  user.nombreCompleto.isNotEmpty ? user.nombreCompleto[0].toUpperCase() : '?',
                                  style: TextStyle(color: Theme.of(context).primaryColorDark),
                                ),
                              ),
                              title: Text(user.nombreCompleto, style: const TextStyle(fontWeight: FontWeight.w500)),
                              subtitle: Text('${user.email}\nRoles: $rolesDisplay'),
                              isThreeLine: true,
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit_outlined),
                                    tooltip: 'Editar',
                                    // ✅ CORRECCIÓN: Llamamos al nuevo método asíncrono
                                    onPressed: () => _showEditUserDialog(user),
                                  ),
                                  IconButton(
                                    icon: Icon(Icons.delete_outline, color: Colors.red.shade700),
                                    tooltip: 'Eliminar',
                                    onPressed: () => _deleteUser(user.id),
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
          // ✅ CORRECCIÓN: Navegar a la pantalla de creación
          final result = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (context) => const UserCreateScreen()),
          );
          // Si la pantalla de creación devuelve 'true', refrescamos la lista
          if (result == true) {
            _loadUsers();
          }
        },
        tooltip: 'Crear Usuario',
        child: const Icon(Icons.add),
      ),
    );
  }
}