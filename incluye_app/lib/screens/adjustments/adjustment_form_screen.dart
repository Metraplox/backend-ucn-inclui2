import 'package:flutter/material.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:intl/intl.dart';

class AdjustmentFormScreen extends StatefulWidget {
  final String studentId;
  final String studentRut;

  const AdjustmentFormScreen({
    super.key,
    required this.studentId,
    required this.studentRut,
  });

  @override
  State<AdjustmentFormScreen> createState() => _AdjustmentFormScreenState();
}

class _AdjustmentFormScreenState extends State<AdjustmentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = true;

  List<Course> _courses = [];
  List<Map<String, dynamic>> _adjustmentCategories = [];

  final _descriptionController = TextEditingController();
  final _expirationDateController = TextEditingController();
  Course? _selectedCourse;
  
  // ✅ PASO 1: Guardar el ID de la categoría, no el nombre.
  String? _selectedCategoryId; 

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    try {
      final results = await Future.wait([
        CourseService.getAllCourses(),
        AdjustmentService.getAdjustmentCategories(),
      ]);

      if (!mounted) return;
      setState(() {
        _courses = results[0] as List<Course>;
        _adjustmentCategories = results[1] as List<Map<String, dynamic>>;
        _isLoading = false;
      });
    } catch (e) {
      if(mounted) setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al cargar datos del formulario: $e')));
    }
  }

  Future<void> _selectDate() async {
    DateTime? picked = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2100));
    if (picked != null) {
      setState(() => _expirationDateController.text = DateFormat('yyyy-MM-dd').format(picked));
    }
  }

  Future<void> _saveAdjustment() async {
    // ✅ PASO 2: Validar el ID de la categoría.
    if (!_formKey.currentState!.validate() || _selectedCourse == null || _selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor, complete todos los campos requeridos.')));
      return;
    }

    setState(() => _isLoading = true);
    
    // Este email debería venir del estado de autenticación de tu app.
    final String adminUserEmail = "coordinadora@ucn.cl"; 

    final currentAdjustmentData = {
      // ✅ PASO 3: Enviar el ID de la categoría en el campo 'type'.
      "type": _selectedCategoryId,
      "description": _descriptionController.text.trim(),
      "courseNrc": _selectedCourse!.nrc,
      "approvedBy": adminUserEmail, // El backend debería resolver el ID a partir de este email o del token.
      "expirationDate": DateTime.parse(_expirationDateController.text).toIso8601String(),
      "approvedAt": DateTime.now().toIso8601String(),
      "fechaInicio": DateTime.now().toIso8601String(),
      "requiresSemesterConfirmation": true,
      "semester": _selectedCourse!.semestre,
      "comentarios": _descriptionController.text.trim(), // Reutilizamos la descripción como comentario.
    };

    final createAdjustmentDto = {
      'studentId': widget.studentId,
      'studentRut': widget.studentRut,
      'currentAdjustments': [currentAdjustmentData]
    };

    try {
      final success = await AdjustmentService.saveAdjustment(createAdjustmentDto);

      if (!mounted) return;
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ajuste guardado correctamente'), backgroundColor: Colors.green));
        Navigator.of(context).pop(true);
      } else {
        // Si el servicio devuelve false, es un error genérico
         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No se pudo guardar el ajuste'), backgroundColor: Colors.red));
      }
    } catch (e) {
      // Capturamos la excepción específica del backend
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al guardar: ${e.toString()}'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nuevo Ajuste')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    // ✅ PASO 4: Modificar el Dropdown para que trabaje con el ID.
                    DropdownButtonFormField<String>(
                      value: _selectedCategoryId,
                      items: _adjustmentCategories.map<DropdownMenuItem<String>>((category) {
                        return DropdownMenuItem<String>(
                          value: category['_id'] as String, // El valor es el ID
                          child: Text(category['name'] as String), // El texto que se muestra es el nombre
                        );
                      }).toList(),
                      onChanged: (value) => setState(() => _selectedCategoryId = value),
                      decoration: const InputDecoration(labelText: 'Tipo de Ajuste'),
                      validator: (value) => value == null ? 'Campo requerido' : null,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<Course>(
                      value: _selectedCourse,
                      items: _courses.map((course) => DropdownMenuItem(value: course, child: Text('${course.nombre} (${course.nrc})'))).toList(),
                      onChanged: (value) => setState(() => _selectedCourse = value),
                      decoration: const InputDecoration(labelText: 'Curso'),
                      validator: (value) => value == null ? 'Debe seleccionar un curso' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(labelText: 'Descripción detallada (Comentarios)'),
                      maxLines: 3,
                       validator: (value) => (value?.isEmpty ?? true) ? 'Campo requerido' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _expirationDateController,
                      decoration: const InputDecoration(labelText: 'Fecha de Vencimiento', suffixIcon: Icon(Icons.calendar_today)),
                      readOnly: true,
                      onTap: _selectDate,
                      validator: (value) => (value?.isEmpty ?? true) ? 'Campo requerido' : null,
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _saveAdjustment,
                      style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
                      child: const Text('Guardar Ajuste'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}