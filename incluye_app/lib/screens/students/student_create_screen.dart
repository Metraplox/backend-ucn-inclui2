import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/models/student_model.dart';

class StudentCreateScreen extends StatefulWidget {
  const StudentCreateScreen({super.key});

  @override
  State<StudentCreateScreen> createState() => _StudentCreateScreenState();
}

class _StudentCreateScreenState extends State<StudentCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _formData = {
    'rut': '',
    'nombres': '',
    'apellidos': '',
    'email': '',
    'carrera': '',
    'fechaNacimiento': '',
    'informacionContacto': '',
    'necesidadesEducativasEspeciales': '',
  };

  bool _isSubmitting = false;
  late TextEditingController _fechaController;

  @override
  void initState() {
    super.initState();
    _fechaController = TextEditingController();
  }

  @override
  void dispose() {
    _fechaController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    final Map<String, dynamic> cleanedData = {};
    _formData.forEach((key, value) {
      if (value != null && value.toString().trim().isNotEmpty) {
        cleanedData[key] = value.toString().trim();
      }
    });

    // Validar formato de fecha: "YYYY-MM-DD"
    if (cleanedData.containsKey('fechaNacimiento')) {
      final fecha = cleanedData['fechaNacimiento'];
      final RegExp dateRegExp = RegExp(r'^\d{4}-\d{2}-\d{2}$');
      if (!dateRegExp.hasMatch(fecha)) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('La fecha debe tener un formato válido (YYYY-MM-DD)')),
        );
        return;
      }
    }

    cleanedData.remove('_id'); // Por si acaso

    debugPrint('Enviando estudiante: $cleanedData');

    // Convertir Map a objeto Student
    final student = Student(
      nombres: cleanedData['nombres'] ?? '',
      apellidos: cleanedData['apellidos'] ?? '',
      rut: cleanedData['rut'] ?? '',
      email: cleanedData['email'] ?? '',
      telefono: cleanedData['telefono'],
      carrera: cleanedData['carrera'],
      anioIngreso: cleanedData['anioIngreso'] != null ? int.tryParse(cleanedData['anioIngreso']) : null,
      consentimientoFirmado: cleanedData['consentimientoFirmado'] == 'true',
      diagnostico: cleanedData['diagnostico'],
      fechaNacimiento: cleanedData['fechaNacimiento'],
      informacionContacto: cleanedData['informacionContacto'],
      necesidadesEducativasEspeciales: cleanedData['necesidadesEducativasEspeciales'],
    );

    if (!mounted) return;
    setState(() => _isSubmitting = true);
    final success = await ApiService.createStudent(student);
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Estudiante creado exitosamente')),
      );
      Navigator.pop(context);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al crear estudiante')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crear Estudiante')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              _buildTextField('RUT', 'rut'),
              _buildTextField('Nombres', 'nombres'),
              _buildTextField('Apellidos', 'apellidos'),
              _buildTextField('Email', 'email', keyboardType: TextInputType.emailAddress),
              _buildTextField('Carrera', 'carrera'),
              _buildFechaNacimientoField(),
              _buildTextField('Contacto', 'informacionContacto', keyboardType: TextInputType.phone),
              _buildTextField('Necesidades Educativas', 'necesidadesEducativasEspeciales'),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitForm,
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Crear'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, String fieldName, {TextInputType keyboardType = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
        keyboardType: keyboardType,
        validator: (value) => value == null || value.isEmpty ? 'Este campo es requerido' : null,
        onSaved: (value) => _formData[fieldName] = value ?? '',
      ),
    );
  }

  Widget _buildFechaNacimientoField() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        controller: _fechaController,
        decoration: InputDecoration(
          labelText: 'Fecha de nacimiento (YYYY-MM-DD)',
          border: const OutlineInputBorder(),
          suffixIcon: IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: () async {
              DateTime initialDate = DateTime.now();
              try {
                initialDate = DateTime.parse(_fechaController.text);
              } catch (_) {}
              final pickedDate = await showDatePicker(
                context: context,
                initialDate: initialDate,
                firstDate: DateTime(1900),
                lastDate: DateTime.now(),
              );
              if (pickedDate != null && mounted) {
                setState(() {
                  final formatted = pickedDate.toIso8601String().split('T')[0];
                  _fechaController.text = formatted;
                  _formData['fechaNacimiento'] = formatted;
                });
              }
            },
          ),
        ),
        keyboardType: TextInputType.datetime,
        validator: (value) => value == null || value.isEmpty ? 'Este campo es requerido' : null,
        onSaved: (value) => _formData['fechaNacimiento'] = value ?? '',
      ),
    );
  }
}
