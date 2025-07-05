import 'package:flutter/material.dart';
import 'package:incluye_app/models/user_model.dart';
import 'package:incluye_app/services/user_service.dart';
import 'package:incluye_app/widgets/user_form_dialog.dart';
import 'package:incluye_app/widgets/change_password_dialog.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  late Future<List<User>> _usersFuture;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  void _loadUsers() {
    setState(() {
      _usersFuture = UserService.getUsers();
    });
  }

  void _showFormDialog({User? user}) {
    showDialog(
      context: context,
      builder: (context) {
        return UserFormDialog(
          user: user,
          onSubmit: (userData) async {
            try {
              bool success = false;
              if (user == null) {
                final newUser = await UserService.createUser(userData);
                success = newUser != null;
              } else {
                final updatedUser = await UserService.updateUser(
                  user.id,
                  userData,
                );
                success = updatedUser != null;
              }

              if (!context.mounted) return;
              if (success) {
                _loadUsers();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Usuario ${user == null ? 'creado' : 'actualizado'} con éxito',
                    ),
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Error al guardar el usuario'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            } catch (e) {
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Error: $e'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          },
        );
      },
    );
  }

  void _showChangePasswordDialog(User user) {
    showDialog(
      context: context,
      builder: (context) {
        return ChangePasswordDialog(
          onSubmit: (newPassword) async {
            try {
              bool success = await UserService.adminSetPassword(
                user.id,
                newPassword,
              );
              if (!context.mounted) return;
              if (success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Contraseña cambiada con éxito'),
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Error al cambiar la contraseña'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            } catch (e) {
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Error: $e'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          },
        );
      },
    );
  }

  void _confirmDelete(User user) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Confirmar Eliminación'),
          content: Text(
            '¿Está seguro de que desea eliminar a ${user.nombreCompleto}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(context).pop();
                try {
                  final success = await UserService.deleteUser(user.id);
                  if (!context.mounted) return;
                  if (success) {
                    _loadUsers();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Usuario eliminado con éxito'),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Error al eliminar el usuario'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                } catch (e) {
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Eliminar'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gestión de Usuarios')),
      body: FutureBuilder<List<User>>(
        future: _usersFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No hay usuarios para mostrar.'));
          }

          final users = snapshot.data!;
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: const [
                DataColumn(label: Text('Nombre')),
                DataColumn(label: Text('Email')),
                DataColumn(label: Text('Roles')),
                DataColumn(label: Text('Activo')),
                DataColumn(label: Text('Acciones')),
              ],
              rows:
                  users.map((user) {
                    return DataRow(
                      cells: [
                        DataCell(Text(user.nombreCompleto)),
                        DataCell(Text(user.email)),
                        DataCell(Text(user.roles.join(', '))),
                        DataCell(
                          Icon(
                            (user.isActive ?? false)
                                ? Icons.check_circle
                                : Icons.cancel,
                            color:
                                (user.isActive ?? false)
                                    ? Colors.green
                                    : Colors.red,
                          ),
                        ),
                        DataCell(
                          PopupMenuButton<String>(
                            onSelected: (value) {
                              if (value == 'edit') {
                                _showFormDialog(user: user);
                              } else if (value == 'password') {
                                _showChangePasswordDialog(user);
                              } else if (value == 'delete') {
                                _confirmDelete(user);
                              }
                            },
                            itemBuilder:
                                (BuildContext context) =>
                                    <PopupMenuEntry<String>>[
                                      const PopupMenuItem<String>(
                                        value: 'edit',
                                        child: Text('Editar'),
                                      ),
                                      const PopupMenuItem<String>(
                                        value: 'password',
                                        child: Text('Cambiar Contraseña'),
                                      ),
                                      const PopupMenuItem<String>(
                                        value: 'delete',
                                        child: Text('Eliminar'),
                                      ),
                                    ],
                          ),
                        ),
                      ],
                    );
                  }).toList(),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showFormDialog(),
        tooltip: 'Crear Usuario',
        child: const Icon(Icons.add),
      ),
    );
  }
}
