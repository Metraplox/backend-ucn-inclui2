// screens/students/student_create_screen.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/career_model.dart'; // IMPORTANTE
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/career_service.dart'; // IMPORTANTE
import 'package:intl/intl.dart'; // Para formatear fechas

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
    // 'carrera': '', // Ya no se usa como string directo
    'carreraId': null, // Para almacenar el ID de la carrera seleccionada
    'fechaNacimiento': '', // YYYY-MM-DD
    'informacionContacto': '',
    'necesidadesEducativasEspeciales': '',
    'consentimientoFirmado': false, // Valor por defecto
     // Campos que podrían ser necesarios para el backend al crear Student (depende de tu DTO)
    'semester': '', // Ejemplo, ajusta si es necesario
    'anioIngreso': null, // Ejemplo
    // 'userId': '', // El backend usualmente crea/asocia el User al crear el Student
  };

  bool _isSubmitting = false;
  late TextEditingController _fechaNacimientoController; // Para el DatePicker

  // --- CAMPOS PARA EL DROPDOWN DE CARRERAS ---
  List<Career> _availableCareers = [];
  String? _selectedCareerId;
  bool _isLoadingCareers = true;
  // --- FIN CAMPOS DROPDOWN ---

  @override
  void initState() {
    super.initState();
    _fechaNacimientoController = TextEditingController();
    _loadCareers();
  }

  Future<void> _loadCareers() async {
    setState(() { _isLoadingCareers = true; });
    try {
      final careers = await CareerService.getAllCareers();
      if (!mounted) return;
      setState(() {
        _availableCareers = careers;
        _isLoadingCareers = false;
      });
    } catch (e) {
      print("Error cargando carreras en StudentCreateScreen: $e");
      if (mounted) {
        setState(() { _isLoadingCareers = false; });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar lista de carreras: ${e.toString()}')),
        );
      }
    }
  }

  @override
  void dispose() {
    _fechaNacimientoController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save(); // Esto actualiza _formData

    // Asegurar que _selectedCareerId se guarde en _formData
    _formData['carreraId'] = _selectedCareerId;

    if (_formData['carreraId'] == null || (_formData['carreraId'] as String).isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Por favor, seleccione una carrera.'), backgroundColor: Colors.red),
        );
        return;
    }

    final Map<String, dynamic> dataToSend = {};
    _formData.forEach((key, value) {
      if (value != null) { // Enviar solo campos no nulos
        if (value is String && value.trim().isNotEmpty) {
          dataToSend[key] = value.trim();
        } else if (value is! String) { // Para bool, int, etc.
            dataToSend[key] = value;
        }
      }
    });
    
    // El backend espera `carreraId` como string, no un campo `carrera` con el nombre.
    // Ya lo hemos asignado desde _selectedCareerId.

    // Validar formato de fecha
    if (dataToSend.containsKey('fechaNacimiento')) {
      final fecha = dataToSend['fechaNacimiento'];
      final RegExp dateRegExp = RegExp(r'^\d{4}-\d{2}-\d{2}$');
      if (fecha != null && !dateRegExp.hasMatch(fecha)) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('La fecha de nacimiento debe tener formato YYYY-MM-DD')),
        );
        return;
      }
      // Convertir a DateTime ISO String para el backend si es necesario,
      // o si el backend espera YYYY-MM-DD, ya está bien.
      // Si el backend espera un objeto DateTime, hay que parsearlo:
      // dataToSend['fechaNacimiento'] = DateTime.parse(fecha).toIso8601String();
    }


    print('Enviando datos para crear estudiante: $dataToSend');

    setState(() => _isSubmitting = true);
    final success = await StudentService.createStudent(dataToSend);
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Estudiante creado exitosamente'), backgroundColor: Colors.green),
      );
      Navigator.pop(context, true); // Devuelve true para indicar éxito a la pantalla anterior
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error al crear estudiante'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crear Nuevo Estudiante')),
      body: _isLoadingCareers 
        ? const Center(child: CircularProgressIndicator())
        : Padding(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  _buildTextField('RUT', 'rut', validator: _requiredValidator),
                  _buildTextField('Nombres', 'nombres', validator: _requiredValidator),
                  _buildTextField('Apellidos', 'apellidos', validator: _requiredValidator),
                  _buildTextField('Email', 'email', keyboardType: TextInputType.emailAddress, validator: _emailValidator),
                  
                  // --- DROPDOWN PARA CARRERAS ---
                  if (_availableCareers.isNotEmpty)
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(labelText: 'Carrera', border: OutlineInputBorder()),
                      value: _selectedCareerId, // Usa la variable de estado para el ID
                      hint: const Text('Seleccione una carrera'),
                      items: _availableCareers.map((Career career) {
                        return DropdownMenuItem<String>(
                          value: career.id, // El valor es el ID de la carrera
                          child: Text(career.name, overflow: TextOverflow.ellipsis),
                        );
                      }).toList(),
                      onChanged: (String? newValue) {
                        setState(() {
                          _selectedCareerId = newValue;
                          // _formData['carreraId'] = newValue; // Se guarda en _submitForm
                        });
                      },
                      validator: (value) => value == null || value.isEmpty ? 'Seleccione una carrera' : null,
                      isExpanded: true,
                    )
                  else if (!_isLoadingCareers)
                    const Padding(padding: EdgeInsets.symmetric(vertical: 16.0), child: Text("No hay carreras disponibles.")),
                  // --- FIN DROPDOWN ---

                  _buildFechaNacimientoField(),
                  _buildTextField('Teléfono/Contacto', 'informacionContacto', keyboardType: TextInputType.phone),
                  _buildTextField('Necesidades Educativas Especiales', 'necesidadesEducativasEspeciales', maxLines: 3),
                  CheckboxListTile( // Para consentimientoFirmado
                    title: const Text("Consentimiento Firmado"),
                    value: _formData['consentimientoFirmado'] as bool? ?? false,
                    onChanged: (bool? newValue) {
                      setState(() {
                        _formData['consentimientoFirmado'] = newValue ?? false;
                      });
                    },
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
                  _buildTextField('Semestre (Ej: 2025-1)', 'semester'), // Ejemplo de campo adicional
                  _buildTextField('Año de Ingreso (Ej: 2023)', 'anioIngreso', keyboardType: TextInputType.number), // Ejemplo


                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitForm,
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                    child: _isSubmitting
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3,))
                        : const Text('Crear Estudiante', style: TextStyle(fontSize: 16)),
                  ),
                ],
              ),
            ),
      ),
    );
  }

  Widget _buildTextField(String label, String fieldName, {TextInputType keyboardType = TextInputType.text, String? Function(String?)? validator, int? maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
        keyboardType: keyboardType,
        maxLines: maxLines,
        validator: validator ?? _requiredValidator, // Usa validador específico o el genérico
        onSaved: (value) => _formData[fieldName] = value ?? '',
        // initialValue: _formData[fieldName]?.toString() ?? '', // No es necesario si no se edita
      ),
    );
  }

  Widget _buildFechaNacimientoField() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        controller: _fechaNacimientoController,
        decoration: InputDecoration(
          labelText: 'Fecha de Nacimiento (YYYY-MM-DD)',
          border: const OutlineInputBorder(),
          suffixIcon: IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: () async {
              DateTime initialDate = DateTime(2000); // Default
              if (_fechaNacimientoController.text.isNotEmpty) {
                try { initialDate = DateTime.parse(_fechaNacimientoController.text); } catch (_) {}
              }
              
              final pickedDate = await showDatePicker(
                context: context,
                initialDate: initialDate,
                firstDate: DateTime(1950),
                lastDate: DateTime.now().subtract(const Duration(days: 365 * 16)), // Al menos 16 años
              );
              if (pickedDate != null) {
                setState(() {
                  final formatted = DateFormat('yyyy-MM-dd').format(pickedDate);
                  _fechaNacimientoController.text = formatted;
                  _formData['fechaNacimiento'] = formatted; // Guardar en formData
                });
              }
            },
          ),
        ),
        keyboardType: TextInputType.datetime,
        validator: (value) {
          if (value == null || value.isEmpty) return 'Campo requerido';
          final RegExp dateRegExp = RegExp(r'^\d{4}-\d{2}-\d{2}$');
           if (!dateRegExp.hasMatch(value)) return 'Formato inválido (YYYY-MM-DD)';
          return null;
        },
        onSaved: (value) => _formData['fechaNacimiento'] = value ?? '',
      ),
    );
  }

  String? _requiredValidator(String? value) {
    return (value == null || value.trim().isEmpty) ? 'Este campo es requerido' : null;
  }

  String? _emailValidator(String? value) {
    if (value == null || value.trim().isEmpty) return 'Este campo es requerido';
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) return 'Email inválido';
    return null;
  }
}