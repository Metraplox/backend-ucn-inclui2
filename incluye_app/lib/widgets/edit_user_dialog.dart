import 'package:flutter/material.dart';
import 'package:incluye_app/models/fullUser_model.dart';
import 'package:incluye_app/services/user_service.dart';
import 'package:incluye_app/utils/role_constants.dart'; // Importamos los roles

class EditUserDialog extends StatefulWidget {
  final FullUser user;
  final Function() onUpdated;

  const EditUserDialog({
    required this.user,
    required this.onUpdated,
    super.key,
  });

  @override
  State<EditUserDialog> createState() => _EditUserDialogState();
}

class _EditUserDialogState extends State<EditUserDialog> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  late TextEditingController _nombreCompletoController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  
  // ✅ Para el selector de roles
  late List<String> _selectedRoles;

  @override
  void initState() {
    super.initState();
    _nombreCompletoController = TextEditingController(text: widget.user.nombreCompleto);
    _emailController = TextEditingController(text: widget.user.email);
    _passwordController = TextEditingController(); // Vacío por seguridad
    
    // ✅ Inicializamos la lista de roles seleccionados
    _selectedRoles = List<String>.from(widget.user.roles);
  }

  @override
  void dispose() {
    _nombreCompletoController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _selectedRoles.isEmpty) {
      if (_selectedRoles.isEmpty) {
         ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Debe seleccionar al menos un rol'), backgroundColor: Colors.red),
        );
      }
      return;
    }

    setState(() => _isLoading = true);

    final Map<String, dynamic> updatedData = {
      'nombreCompleto': _nombreCompletoController.text.trim(),
      'email': _emailController.text.trim(),
      'roles': _selectedRoles, // ✅ Usamos la lista directamente
    };

    if (_passwordController.text.isNotEmpty) {
      updatedData['password'] = _passwordController.text;
    }

    final success = await UserService.updateUser(widget.user.id, updatedData);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Usuario actualizado correctamente'), backgroundColor: Colors.green),
      );
      widget.onUpdated();
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al actualizar el usuario'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Editar Usuario'),
      content: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextFormField(
                      controller: _nombreCompletoController,
                      decoration: const InputDecoration(labelText: 'Nombre completo'),
                      validator: (value) => (value == null || value.trim().isEmpty) ? 'Campo requerido' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) { /* ... validación de email ... */ return null; },
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _passwordController,
                      decoration: const InputDecoration(
                        labelText: 'Nueva Contraseña',
                        hintText: 'Dejar en blanco para no cambiar',
                      ),
                      obscureText: true,
                      validator: (value) { /* ... validación de contraseña ... */ return null; },
                    ),
                    const SizedBox(height: 16),
                    
                    // ✅ NUEVO WIDGET PARA SELECCIONAR ROLES
                    const Text('Roles', style: TextStyle(fontSize: 16, color: Colors.black54)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8.0,
                      runSpacing: 4.0,
                      children: AppRoles.all.map((role) {
                        final isSelected = _selectedRoles.contains(role);
                        return FilterChip(
                          label: Text(role, style: TextStyle(fontSize: 12)),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              if (selected) {
                                _selectedRoles.add(role);
                              } else {
                                _selectedRoles.remove(role);
                              }
                            });
                          },
                          selectedColor: Theme.of(context).primaryColor,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : Colors.black,
                          ),
                          checkmarkColor: Colors.white,
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _save,
          child: const Text('Guardar Cambios'),
        ),
      ],
    );
  }
}