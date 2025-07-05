// widgets/edit_student_dialog.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/career_model.dart'; // IMPORTANTE
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/career_service.dart'; // IMPORTANTE
import 'package:intl/intl.dart';
import 'package:incluye_app/utils/logger.dart';

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
  // Ya no usaremos _carreraNombreController directamente para el input si es un dropdown
  late TextEditingController _fechaNacimientoController;
  late TextEditingController _informacionContactoController;
  late TextEditingController _necesidadesController;

  String? _fechaError;

  // --- CAMPOS PARA EL DROPDOWN DE CARRERAS ---
  List<Career> _availableCareers = [];
  String? _selectedCareerId; // Almacenará el ID de la carrera seleccionada
  bool _isLoadingCareers = true;
  // --- FIN CAMPOS DROPDOWN ---

  String _formatDateForController(DateTime? date) {
    if (date == null) return '';
    try {
      return DateFormat('yyyy-MM-dd').format(date);
    } catch (e) {
      return '';
    }
  }

  @override
  void initState() {
    super.initState();
    _loadCareersAndInitializeFields();
  }

  Future<void> _loadCareersAndInitializeFields() async {
    setState(() {
      _isLoadingCareers = true;
    });
    try {
      final careers = await CareerService.getAllCareers();
      if (!mounted) return;

      setState(() {
        _availableCareers = careers;
        // Inicializar los controladores y el ID de carrera seleccionado
        _rutController = TextEditingController(text: widget.student.rut);
        _nombresController = TextEditingController(
          text: widget.student.nombres,
        );
        _apellidosController = TextEditingController(
          text: widget.student.apellidos,
        );
        _emailController = TextEditingController(text: widget.student.email);

        // Establecer el ID de carrera seleccionado si el estudiante ya tiene una
        _selectedCareerId =
            widget.student.rawCarreraId ?? widget.student.carreraIdObject?.id;

        _fechaNacimientoController = TextEditingController(
          text: _formatDateForController(widget.student.fechaNacimiento),
        );
        _informacionContactoController = TextEditingController(
          text: widget.student.informacionContacto ?? '',
        );
        _necesidadesController = TextEditingController(
          text: widget.student.necesidadesEducativasEspeciales ?? '',
        );

        _isLoadingCareers = false;
      });
    } catch (e) {
      log.e("EditStudentDialog – error cargando carreras: $e");
      if (mounted) {
        setState(() {
          _isLoadingCareers = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar lista de carreras: ${e.toString()}'),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _rutController.dispose();
    _nombresController.dispose();
    _apellidosController.dispose();
    _emailController.dispose();
    // _carreraNombreController.dispose(); // Ya no se usa
    _fechaNacimientoController.dispose();
    _informacionContactoController.dispose();
    _necesidadesController.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    if (!mounted) return;
    setState(() => _fechaError = null);

    if (!_formKey.currentState!.validate()) return;

    // Validar que se haya seleccionado una carrera
    if (_selectedCareerId == null || _selectedCareerId!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor, seleccione una carrera.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

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

    // Crear el objeto Career para el Student a partir del ID seleccionado
    // Buscamos el objeto Career completo para pasarlo al constructor de Student si es necesario
    // o simplemente pasamos el rawCarreraId si el constructor de Student lo espera así.
    // El StudentModel que te di tiene rawCarreraId y carreraIdObject.
    Career? selectedCareerObject;
    if (_selectedCareerId != null) {
      selectedCareerObject = _availableCareers.firstWhere(
        (c) => c.id == _selectedCareerId,
        orElse: () => widget.student.carreraIdObject!,
      ); // Fallback al original si algo raro pasa
    }

    final updatedStudent = Student(
      id: widget.student.id,
      rut: _rutController.text.trim(),
      nombres: _nombresController.text.trim(),
      apellidos: _apellidosController.text.trim(),
      email: _emailController.text.trim(),

      rawCarreraId:
          _selectedCareerId, // Guardamos el ID seleccionado como string
      carreraIdObject:
          selectedCareerObject, // Guardamos el objeto carrera seleccionado (si lo obtuvimos)

      userId: widget.student.userId,
      semester: widget.student.semester, // Asumimos que no se edita aquí
      fechaNacimiento: fechaNacimientoDate,
      informacionContacto:
          _informacionContactoController.text.trim().isEmpty
              ? null
              : _informacionContactoController.text.trim(),
      necesidadesEducativasEspeciales:
          _necesidadesController.text.trim().isEmpty
              ? null
              : _necesidadesController.text.trim(),

      telefono: widget.student.telefono,
      anioIngreso: widget.student.anioIngreso,
      consentimientoFirmado: widget.student.consentimientoFirmado,
      diagnosticosAntiguos: widget.student.diagnosticosAntiguos,
      createdAt: widget.student.createdAt,
      updatedAt: widget.student.updatedAt,
    );

    final success = await StudentService.updateStudent(
      widget.student.id,
      updatedStudent, // StudentService.updateStudent espera un objeto Student. Su toJson() enviará el carreraId (string).
    );

    if (!mounted) return;

    if (success) {
      widget.onUpdated(updatedStudent);
      // Navigator.of(context).pop(); // onUpdated debe manejar el pop si es necesario
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Estudiante actualizado exitosamente')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error al actualizar estudiante'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Editar Estudiante'),
      content:
          _isLoadingCareers
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
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
                        decoration: const InputDecoration(
                          labelText: 'Apellidos',
                        ),
                        validator: _requiredValidator,
                      ),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(labelText: 'Email'),
                        validator: (value) {
                          /* ... */
                          return null;
                        },
                      ),

                      // --- DROPDOWN PARA CARRERAS ---
                      if (_availableCareers.isNotEmpty)
                        DropdownButtonFormField<String>(
                          decoration: const InputDecoration(
                            labelText: 'Carrera',
                          ),
                          value: _selectedCareerId,
                          items:
                              _availableCareers.map((Career career) {
                                return DropdownMenuItem<String>(
                                  value: career.id,
                                  child: Text(
                                    career.name,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                );
                              }).toList(),
                          onChanged: (String? newValue) {
                            setState(() {
                              _selectedCareerId = newValue;
                            });
                          },
                          validator:
                              (value) =>
                                  value == null || value.isEmpty
                                      ? 'Seleccione una carrera'
                                      : null,
                          isExpanded: true,
                        )
                      else if (!_isLoadingCareers) // Si no está cargando y no hay carreras
                        const Text(
                          "No hay carreras disponibles para seleccionar.",
                        ),

                      // --- FIN DROPDOWN ---
                      TextFormField(
                        controller: _fechaNacimientoController,
                        decoration: InputDecoration(
                          labelText: 'Fecha de Nacimiento (YYYY-MM-DD)',
                          errorText: _fechaError,
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.calendar_today),
                            onPressed: () async {
                              /* ... (lógica showDatePicker) ... */
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
        ElevatedButton(
          onPressed: _isLoadingCareers ? null : _guardar,
          child: const Text('Guardar'),
        ),
      ],
    );
  }

  String? _requiredValidator(String? value) {
    return (value == null || value.trim().isEmpty) ? 'Campo requerido' : null;
  }
}
