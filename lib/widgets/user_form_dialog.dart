import 'package:flutter/material.dart';
import 'package:incluye_app/models/user_model.dart';
import 'package:incluye_app/utils/validators.dart';

class UserFormDialog extends StatefulWidget {
  final User? user;
  final Function(Map<String, dynamic>) onSubmit;

  const UserFormDialog({super.key, this.user, required this.onSubmit});

  @override
  State<UserFormDialog> createState() => _UserFormDialogState();
}

class _UserFormDialogState extends State<UserFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  String? _selectedRole;
  bool _isActive = true;

  // Lista de roles disponibles
  final List<String> _roles = [
    'ESTUDIANTE',
    'DOCENTE',
    'COORDINADOR',
    'JEFE_CARRERA',
    'DIDDEC_STAFF',
    'EDUCADORA_SOCIAL',
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(
      text: widget.user?.nombreCompleto ?? '',
    );
    _emailController = TextEditingController(text: widget.user?.email ?? '');
    _passwordController = TextEditingController();
    _selectedRole =
        widget.user?.roles.isNotEmpty == true ? widget.user!.roles.first : null;
    _isActive = widget.user?.isActive ?? true;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.user == null ? 'Crear Usuario' : 'Editar Usuario'),
      content: Form(
        key: _formKey,
        autovalidateMode: AutovalidateMode.onUserInteraction,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Nombre Completo'),
                validator:
                    (value) => Validators.validateNotEmpty(
                      value,
                      'El nombre completo',
                    ),
              ),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: Validators.validateEmail,
              ),
              if (widget.user ==
                  null) // Solo mostrar campo de contraseña al crear
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: 'Contraseña'),
                  obscureText: true,
                  validator: Validators.validatePassword,
                ),
              DropdownButtonFormField<String>(
                value: _selectedRole,
                items:
                    _roles.map((role) {
                      return DropdownMenuItem(value: role, child: Text(role));
                    }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedRole = value;
                  });
                },
                decoration: const InputDecoration(labelText: 'Rol'),
                validator: (value) {
                  if (value == null) {
                    return 'Por favor, seleccione un rol';
                  }
                  return null;
                },
              ),
              SwitchListTile(
                title: const Text('Activo'),
                value: _isActive,
                onChanged: (value) {
                  setState(() {
                    _isActive = value;
                  });
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text('Cancelar'),
        ),
        ElevatedButton(onPressed: _submitForm, child: Text('Guardar')),
      ],
    );
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      final Map<String, dynamic> userData = {
        'nombreCompleto': _nameController.text,
        'email': _emailController.text,
        'roles': [_selectedRole!],
        'isActive': _isActive,
      };

      if (widget.user == null && _passwordController.text.isNotEmpty) {
        userData['password'] = _passwordController.text;
      }

      widget.onSubmit(userData);
      Navigator.of(context).pop();
    }
  }
}
