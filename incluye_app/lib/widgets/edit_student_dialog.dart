// widgets/edit_student_dialog.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/student_model.dart';
// import 'package:incluye_app/models/career_model.dart'; // Necesario si manejamos el objeto carrera con un selector
import 'package:incluye_app/services/student_service.dart';
import 'package:intl/intl.dart'; // Para formatear y parsear fechas

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
  late TextEditingController _carreraNombreController; // Para mostrar/editar el nombre de la carrera
  late TextEditingController _fechaNacimientoController; // Mostrará YYYY-MM-DD
  late TextEditingController _informacionContactoController;
  late TextEditingController _necesidadesController;

  String? _fechaError; // Para errores de formato de fecha manual

  // Helper para formatear DateTime a String YYYY-MM-DD
  String _formatDateForController(DateTime? date) {
    if (date == null) return '';
    try {
      return DateFormat('yyyy-MM-dd').format(date);
    } catch (e) {
      print("Error formateando fecha para controlador: $e");
      return '';
    }
  }

  @override
  void initState() {
    super.initState();

    _rutController = TextEditingController(text: widget.student.rut);
    _nombresController = TextEditingController(text: widget.student.nombres);
    _apellidosController = TextEditingController(text: widget.student.apellidos);
    _emailController = TextEditingController(text: widget.student.email);
    
    _carreraNombreController = TextEditingController(text: widget.student.carreraNombre ?? '');
    
    _fechaNacimientoController = TextEditingController(text: _formatDateForController(widget.student.fechaNacimiento));
    
    _informacionContactoController = TextEditingController(text: widget.student.informacionContacto ?? '');
    _necesidadesController = TextEditingController(text: widget.student.necesidadesEducativasEspeciales ?? '');
  }

  @override
  void dispose() {
    _rutController.dispose();
    _nombresController.dispose();
    _apellidosController.dispose();
    _emailController.dispose();
    _carreraNombreController.dispose();
    _fechaNacimientoController.dispose();
    _informacionContactoController.dispose();
    _necesidadesController.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    if (!mounted) return;
    setState(() => _fechaError = null);

    if (!_formKey.currentState!.validate()) return;

    final fechaNacimientoString = _fechaNacimientoController.text.trim();
    DateTime? fechaNacimientoDate;

    if (fechaNacimientoString.isNotEmpty) {
      try {
        final RegExp dateRegExp = RegExp(r'^\d{4}-\d{2}-\d{2}$');
        if (!dateRegExp.hasMatch(fechaNacimientoString)) {
            if (!mounted) return;
            setState(() => _fechaError = 'Formato inválido (YYYY-MM-DD)');
            return;
        }
        fechaNacimientoDate = DateTime.parse(fechaNacimientoString);
      } catch (e) {
        if (!mounted) return;
        setState(() => _fechaError = 'Fecha inválida (YYYY-MM-DD)');
        return;
      }
    }

    final updatedStudent = Student(
      id: widget.student.id,
      rut: _rutController.text.trim(),
      nombres: _nombresController.text.trim(),
      apellidos: _apellidosController.text.trim(),
      email: _emailController.text.trim(),
      
      // Mantenemos el carreraId original. Si el nombre de la carrera se edita y el backend
      // puede buscar el ID por nombre, eso se manejaría en el backend.
      // Si no, este campo de texto para carrera solo edita la representación visual del nombre.
      carreraId: widget.student.carreraId, 
      // Si tuvieras un selector de carrera que actualiza un _selectedCareerId (String)
      // podrías hacer:
      // carreraId: _selectedCareerId != null ? Career(id: _selectedCareerId!, name: _carreraNombreController.text.trim()) : widget.student.carreraId,


      userId: widget.student.userId,
      semester: widget.student.semester,
      fechaNacimiento: fechaNacimientoDate,
      informacionContacto: _informacionContactoController.text.trim().isEmpty ? null : _informacionContactoController.text.trim(),
      necesidadesEducativasEspeciales: _necesidadesController.text.trim().isEmpty ? null : _necesidadesController.text.trim(),
      // hasDisability fue eliminado del modelo
      
      telefono: widget.student.telefono,
      anioIngreso: widget.student.anioIngreso,
      consentimientoFirmado: widget.student.consentimientoFirmado,
      diagnosticosAntiguos: widget.student.diagnosticosAntiguos,
      createdAt: widget.student.createdAt,
      updatedAt: widget.student.updatedAt, // El backend se encargará de actualizar este
    );

    final success = await StudentService.updateStudent(
      widget.student.id,
      updatedStudent,
    );
    
    if (!mounted) return;
    
    if (success) {
      widget.onUpdated(updatedStudent); // Notifica a la pantalla anterior con los datos del formulario
      // Navigator.of(context).pop(); // La pantalla anterior debería hacer pop si onUpdated se llama desde showDialog
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Estudiante actualizado exitosamente')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al actualizar estudiante'), backgroundColor: Colors.red),
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
            mainAxisSize: MainAxisSize.min,
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
                validator: (value) {
                  if (value == null || value.trim().isEmpty) return 'Campo requerido';
                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) return 'Email inválido';
                  return null;
                },
              ),
              TextFormField(
                controller: _carreraNombreController,
                decoration: const InputDecoration(labelText: 'Carrera (Nombre)'),
                // Si no se puede editar la carrera, considera readOnly: true
                // validator: _requiredValidator, // Opcional
              ),
              TextFormField(
                controller: _fechaNacimientoController,
                decoration: InputDecoration(
                  labelText: 'Fecha de Nacimiento (YYYY-MM-DD)',
                  errorText: _fechaError,
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_today),
                    onPressed: () async {
                      DateTime initialPickerDate;
                      try {
                        if (_fechaNacimientoController.text.isNotEmpty) {
                          initialPickerDate = DateTime.parse(_fechaNacimientoController.text);
                        } else {
                           initialPickerDate = DateTime(2000); // Un default razonable
                        }
                      } catch (_) {
                        initialPickerDate = DateTime(2000); // Fallback
                      }

                      DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: initialPickerDate,
                        firstDate: DateTime(1900),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null && mounted) {
                        setState(() {
                          _fechaNacimientoController.text = _formatDateForController(picked);
                        });
                      }
                    },
                  ),
                ),
              ),
              TextFormField(
                controller: _informacionContactoController,
                decoration: const InputDecoration(labelText: 'Información de Contacto'),
              ),
              TextFormField(
                controller: _necesidadesController,
                decoration: const InputDecoration(labelText: 'Necesidades Educativas Especiales'),
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