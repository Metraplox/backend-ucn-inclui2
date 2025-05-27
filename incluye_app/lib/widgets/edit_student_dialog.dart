import 'package:flutter/material.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/services/student_service.dart';

class EditStudentDialog extends StatefulWidget {
  final Student student;
  final Function(Student) onUpdated;

  const EditStudentDialog({
    required this.student,
    required this.onUpdated,
    super.key,
  });

  @override
  State<EditStudentDialog> createState() => _EditStudentDialogState();
}

class _EditStudentDialogState extends State<EditStudentDialog> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _rutController;
  late TextEditingController _nombresController;
  late TextEditingController _apellidosController;
  late TextEditingController _emailController;
  late TextEditingController _carreraController;
  late TextEditingController _fechaNacimientoController;
  late TextEditingController _informacionContactoController;
  late TextEditingController _necesidadesController;

  String? _fechaError;

  @override
  void initState() {
    super.initState();

    _rutController = TextEditingController(text: widget.student.rut);
    _nombresController = TextEditingController(text: widget.student.nombres);
    _apellidosController = TextEditingController(text: widget.student.apellidos);
    _emailController = TextEditingController(text: widget.student.email);
    _carreraController = TextEditingController(text: widget.student.carrera);
    _fechaNacimientoController = TextEditingController(text: widget.student.fechaNacimiento);
    _informacionContactoController = TextEditingController(text: widget.student.informacionContacto ?? '');
    _necesidadesController = TextEditingController(text: widget.student.necesidadesEducativasEspeciales ?? '');
  }

  @override
  void dispose() {
    _rutController.dispose();
    _nombresController.dispose();
    _apellidosController.dispose();
    _emailController.dispose();
    _carreraController.dispose();
    _fechaNacimientoController.dispose();
    _informacionContactoController.dispose();
    _necesidadesController.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    setState(() => _fechaError = null);

    if (!_formKey.currentState!.validate()) return;

    final fecha = _fechaNacimientoController.text.trim();
    final RegExp dateRegExp = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    if (fecha.isNotEmpty && !dateRegExp.hasMatch(fecha)) {
      setState(() => _fechaError = 'Formato inválido (YYYY-MM-DD)');
      return;
    }

    final updatedStudent = Student(
      id: widget.student.id,
      rut: _rutController.text.trim(),
      nombres: _nombresController.text.trim(),
      apellidos: _apellidosController.text.trim(),
      email: _emailController.text.trim(),
      carrera: _carreraController.text.trim(),
      fechaNacimiento: fecha,
      informacionContacto: _informacionContactoController.text.trim(),
      necesidadesEducativasEspeciales: _necesidadesController.text.trim(),
    );

    final success = await StudentService.updateStudent(
      widget.student.id,
      updatedStudent,
    );
    
    if (!mounted) return;
    
    if (success) {
      widget.onUpdated(updatedStudent);
      Navigator.of(context).pop(); // ✅ Cierra el diálogo al guardar con éxito
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Estudiante actualizado exitosamente')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al actualizar estudiante')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Editar Estudiante'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _rutController,
                decoration: const InputDecoration(labelText: 'RUT'),
                validator: _requiredValidator,
              ),
              TextFormField(
                controller: _nombresController,
                decoration: const InputDecoration(labelText: 'Nombres'),
                validator: _requiredValidator,
              ),
              TextFormField(
                controller: _apellidosController,
                decoration: const InputDecoration(labelText: 'Apellidos'),
                validator: _requiredValidator,
              ),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: _requiredValidator,
              ),
              TextFormField(
                controller: _carreraController,
                decoration: const InputDecoration(labelText: 'Carrera'),
                validator: _requiredValidator,
              ),
              TextFormField(
                controller: _fechaNacimientoController,
                decoration: InputDecoration(
                  labelText: 'Fecha de Nacimiento (YYYY-MM-DD)',
                  errorText: _fechaError,
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () async {
                      DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate:
                            DateTime.tryParse(
                              _fechaNacimientoController.text,
                            ) ??
                            DateTime(2000),
                        firstDate: DateTime(1900),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null && mounted) {
                        setState(() {
                          _fechaNacimientoController.text =
                              picked.toIso8601String().split('T')[0];
                        });
                      }
                    },
                  ),
                ),
              ),
              TextFormField(
                controller: _informacionContactoController,
                decoration: const InputDecoration(
                  labelText: 'Información de Contacto',
                ),
              ),
              TextFormField(
                controller: _necesidadesController,
                decoration: const InputDecoration(
                  labelText: 'Necesidades Educativas Especiales',
                ),
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
        ElevatedButton(onPressed: _guardar, child: const Text('Guardar')),
      ],
    );
  }

  String? _requiredValidator(String? value) {
    return (value == null || value.trim().isEmpty) ? 'Campo requerido' : null;
  }
}
