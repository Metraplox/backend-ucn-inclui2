import 'package:flutter/material.dart';
import 'package:incluye_app/services/user_management_service.dart';
import 'package:incluye_app/widgets/app_scaffold.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  List<Map<String, dynamic>> _users = [];
  List<Map<String, dynamic>> _filteredUsers = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _filterRole = 'TODOS';

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    try {
      final users = await UserManagementService.getAllUsers();
      setState(() {
        _users = users;
        _filteredUsers = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar usuarios: $e')),
        );
      }
    }
  }

  void _filterUsers() {
    setState(() {
      _filteredUsers = _users.where((user) {
        final nameMatches = user['nombreCompleto']
            ?.toString()
            .toLowerCase()
            .contains(_searchQuery.toLowerCase()) ?? false;
        final emailMatches = user['email']
            ?.toString()
            .toLowerCase()
            .contains(_searchQuery.toLowerCase()) ?? false;
        
        final searchMatches = nameMatches || emailMatches;
        
        if (_filterRole == 'TODOS') {
          return searchMatches;
        } else {
          final roles = List<String>.from(user['roles'] ?? []);
          return searchMatches && roles.contains(_filterRole);
        }
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Gestión de Usuarios',
      isAdmin: true,
      isStudent: false,
      isTeacher: false,
      isHead: false,
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateUserDialog(),
        tooltip: 'Crear Usuario',
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          _buildSearchAndFilter(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredUsers.isEmpty
                    ? const Center(
                        child: Text('No se encontraron usuarios'),
                      )
                    : _buildUsersList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilter() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              decoration: const InputDecoration(
                labelText: 'Buscar usuarios',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                _searchQuery = value;
                _filterUsers();
              },
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Text('Filtrar por rol: '),
                const SizedBox(width: 8),
                Expanded(
                  child: DropdownButton<String>(
                    value: _filterRole,
                    isExpanded: true,
                    items: ['TODOS', ...UserManagementService.getAvailableRoles()]
                        .map((role) => DropdownMenuItem(
                              value: role,
                              child: Text(role),
                            ))
                        .toList(),
                    onChanged: (value) {
                      setState(() => _filterRole = value!);
                      _filterUsers();
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUsersList() {
    return RefreshIndicator(
      onRefresh: _loadUsers,
      child: ListView.builder(
        itemCount: _filteredUsers.length,
        itemBuilder: (context, index) {
          final user = _filteredUsers[index];
          return _buildUserCard(user);
        },
      ),
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user) {
    final roles = List<String>.from(user['roles'] ?? []);
    final isActive = user['isActive'] ?? true;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: isActive ? Colors.green : Colors.grey,
          child: Text(
            (user['nombreCompleto'] ?? '??').substring(0, 1).toUpperCase(),
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(
          user['nombreCompleto'] ?? 'Sin nombre',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isActive ? Colors.black : Colors.grey,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(user['email'] ?? 'Sin email'),
            const SizedBox(height: 4),
            Wrap(
              spacing: 4,
              children: roles.map((role) => Chip(
                label: Text(
                  role,
                  style: const TextStyle(fontSize: 10),
                ),
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                visualDensity: VisualDensity.compact,
              )).toList(),
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildUserDetail('ID', user['_id'] ?? ''),
                _buildUserDetail('Estado', isActive ? 'Activo' : 'Inactivo'),
                _buildUserDetail('Creado', _formatDate(user['createdAt'])),
                _buildUserDetail('Actualizado', _formatDate(user['updatedAt'])),
                
                if (user['additionalResponsibilities'] != null) ...[
                  const SizedBox(height: 8),
                  const Text('Responsabilidades Adicionales:', 
                    style: TextStyle(fontWeight: FontWeight.bold)),
                  ...UserManagementService.getAdditionalResponsibilities().entries
                      .where((entry) => user['additionalResponsibilities'][entry.key] == true)
                      .map((entry) => Text('• ${entry.value}')),
                ],
                
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _showEditUserDialog(user),
                      icon: const Icon(Icons.edit),
                      label: const Text('Editar'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _confirmDeleteUser(user),
                      icon: const Icon(Icons.delete),
                      label: const Text('Eliminar'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text('$label:', style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'N/A';
    }
  }

  void _showCreateUserDialog() {
    showDialog(
      context: context,
      builder: (context) => _UserFormDialog(
        title: 'Crear Usuario',
        onSave: (userData) async {
          try {
            await UserManagementService.createUser(
              email: userData['email'],
              nombreCompleto: userData['nombreCompleto'],
              roles: List<String>.from(userData['roles']),
              password: userData['password'],
              additionalResponsibilities: userData['additionalResponsibilities'],
            );
            _loadUsers();
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Usuario creado exitosamente')),
              );
            }
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error al crear usuario: $e')),
              );
            }
          }
        },
      ),
    );
  }

  void _showEditUserDialog(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => _UserFormDialog(
        title: 'Editar Usuario',
        user: user,
        onSave: (userData) async {
          try {
            await UserManagementService.updateUser(user['_id'], userData);
            _loadUsers();
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Usuario actualizado exitosamente')),
              );
            }
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error al actualizar usuario: $e')),
              );
            }
          }
        },
      ),
    );
  }

  void _confirmDeleteUser(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar Eliminación'),
        content: Text(
          '¿Estás seguro de que deseas eliminar al usuario "${user['nombreCompleto']}"?\n\nEsta acción no se puede deshacer.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await UserManagementService.deleteUser(user['_id']);
                _loadUsers();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Usuario eliminado exitosamente')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error al eliminar usuario: $e')),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }
}

class _UserFormDialog extends StatefulWidget {
  final String title;
  final Map<String, dynamic>? user;
  final Function(Map<String, dynamic>) onSave;

  const _UserFormDialog({
    required this.title,
    this.user,
    required this.onSave,
  });

  @override
  State<_UserFormDialog> createState() => _UserFormDialogState();
}

class _UserFormDialogState extends State<_UserFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _birthDateController = TextEditingController();
  
  List<String> _selectedRoles = [];
  Map<String, bool> _additionalResponsibilities = {};
  DateTime? _selectedBirthDate;
  bool _isStudent = false;
  bool _autoGeneratePassword = false;

  @override
  void initState() {
    super.initState();
    if (widget.user != null) {
      _emailController.text = widget.user!['email'] ?? '';
      _nameController.text = widget.user!['nombreCompleto'] ?? '';
      _selectedRoles = List<String>.from(widget.user!['roles'] ?? []);
      _isStudent = _selectedRoles.contains('ESTUDIANTE');
      
      final addResp = widget.user!['additionalResponsibilities'] ?? {};
      _additionalResponsibilities = UserManagementService.getAdditionalResponsibilities()
          .map((key, value) => MapEntry(key, addResp[key] ?? false));
    } else {
      _additionalResponsibilities = UserManagementService.getAdditionalResponsibilities()
          .map((key, value) => MapEntry(key, false));
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.8,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Email requerido';
                    if (!value!.contains('@')) return 'Email inválido';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Nombre Completo'),
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Nombre requerido';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                
                // Selector de roles
                const Text('Roles:', style: TextStyle(fontWeight: FontWeight.bold)),
                ...UserManagementService.getAvailableRoles().map((role) {
                  return CheckboxListTile(
                    title: Text(role),
                    value: _selectedRoles.contains(role),
                    onChanged: (value) {
                      setState(() {
                        if (value == true) {
                          _selectedRoles.add(role);
                        } else {
                          _selectedRoles.remove(role);
                        }
                        _isStudent = _selectedRoles.contains('ESTUDIANTE');
                        if (_isStudent) {
                          _autoGeneratePassword = true;
                        }
                      });
                    },
                  );
                }),
                
                const SizedBox(height: 16),
                
                // Gestión de contraseña
                if (widget.user == null) ...[
                  if (_isStudent) ...[
                    CheckboxListTile(
                      title: const Text('Generar contraseña con fecha de nacimiento'),
                      value: _autoGeneratePassword,
                      onChanged: (value) {
                        setState(() => _autoGeneratePassword = value!);
                      },
                    ),
                    if (_autoGeneratePassword) ...[
                      TextFormField(
                        controller: _birthDateController,
                        decoration: const InputDecoration(
                          labelText: 'Fecha de Nacimiento',
                          suffixIcon: Icon(Icons.calendar_today),
                        ),
                        readOnly: true,
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: DateTime.now().subtract(const Duration(days: 365 * 20)),
                            firstDate: DateTime(1950),
                            lastDate: DateTime.now(),
                          );
                          if (date != null) {
                            setState(() {
                              _selectedBirthDate = date;
                              _birthDateController.text = '${date.day}/${date.month}/${date.year}';
                            });
                          }
                        },
                        validator: _autoGeneratePassword ? (value) {
                          if (value?.isEmpty ?? true) return 'Fecha de nacimiento requerida';
                          return null;
                        } : null,
                      ),
                    ] else ...[
                      TextFormField(
                        controller: _passwordController,
                        decoration: const InputDecoration(labelText: 'Contraseña'),
                        obscureText: true,
                        validator: (value) {
                          if (value?.isEmpty ?? true) return 'Contraseña requerida';
                          return null;
                        },
                      ),
                    ],
                  ] else ...[
                    TextFormField(
                      controller: _passwordController,
                      decoration: const InputDecoration(labelText: 'Contraseña'),
                      obscureText: true,
                      validator: (value) {
                        if (value?.isEmpty ?? true) return 'Contraseña requerida';
                        return null;
                      },
                    ),
                  ],
                ],
                
                const SizedBox(height: 16),
                
                // Responsabilidades adicionales
                const Text('Responsabilidades Adicionales:', 
                  style: TextStyle(fontWeight: FontWeight.bold)),
                ..._additionalResponsibilities.entries.map((entry) {
                  final responsibilityName = UserManagementService.getAdditionalResponsibilities()[entry.key] ?? entry.key;
                  return CheckboxListTile(
                    title: Text(responsibilityName),
                    value: _additionalResponsibilities[entry.key],
                    onChanged: (value) {
                      setState(() {
                        _additionalResponsibilities[entry.key] = value!;
                      });
                    },
                  );
                }),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: _saveUser,
          child: const Text('Guardar'),
        ),
      ],
    );
  }

  void _saveUser() {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedRoles.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Debe seleccionar al menos un rol')),
      );
      return;
    }

    final userData = {
      'email': _emailController.text,
      'nombreCompleto': _nameController.text,
      'roles': _selectedRoles,
      'additionalResponsibilities': _additionalResponsibilities,
    };

    // Solo agregar contraseña si es un usuario nuevo
    if (widget.user == null) {
      if (_isStudent && _autoGeneratePassword && _selectedBirthDate != null) {
        userData['password'] = UserManagementService.generateStudentPassword(_selectedBirthDate!);
      } else if (_passwordController.text.isNotEmpty) {
        userData['password'] = _passwordController.text;
      }
    }

    widget.onSave(userData);
    Navigator.pop(context);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _nameController.dispose();
    _passwordController.dispose();
    _birthDateController.dispose();
    super.dispose();
  }
}
