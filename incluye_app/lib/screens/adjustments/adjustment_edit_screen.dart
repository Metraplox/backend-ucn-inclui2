import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:intl/intl.dart';

class AdjustmentEditScreen extends StatefulWidget {
  final String studentId;
  final String studentRut;
  // ✅ CORRECCIÓN: Usamos tu clase 'Adjustment'
  final Adjustment adjustmentToEdit;

  const AdjustmentEditScreen({
    super.key,
    required this.studentId,
    required this.studentRut,
    required this.adjustmentToEdit,
  });

  @override
  State<AdjustmentEditScreen> createState() => _AdjustmentEditScreenState();
}

class _AdjustmentEditScreenState extends State<AdjustmentEditScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = true;

  List<Course> _courses = [];
  List<Map<String, dynamic>> _adjustmentCategories = [];

  late TextEditingController _descriptionController;
  late TextEditingController _expirationDateController;
  
  Course? _selectedCourse;
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
      
      _courses = results[0] as List<Course>;
      _adjustmentCategories = results[1] as List<Map<String, dynamic>>;

      final initialAdjustment = widget.adjustmentToEdit;
      
      final category = _adjustmentCategories.firstWhere(
        (cat) => cat['name'] == initialAdjustment.tipo || cat['_id'] == initialAdjustment.tipo,
        orElse: () => {'_id': null}
      );
      _selectedCategoryId = category['_id'];

      _descriptionController = TextEditingController(text: initialAdjustment.descripcion);
      _expirationDateController = TextEditingController(text: _formatDateStringForInput(initialAdjustment.expirationDate));
      
      try {
        _selectedCourse = _courses.firstWhere((c) => c.nrc == initialAdjustment.courseNrc);
      } catch (e) {
        _selectedCourse = null;
      }

      setState(() => _isLoading = false);
    } catch (e) {
      if(mounted) setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al cargar datos: $e')));
    }
  }

  String _formatDateStringForInput(String? dateString) {
    if (dateString == null || dateString.isEmpty) return '';
    try {
      return DateFormat('yyyy-MM-dd').format(DateTime.parse(dateString));
    } catch (e) {
      return '';
    }
  }

  Future<void> _selectDate() async {
    DateTime? picked = await showDatePicker(context: context, initialDate: DateTime.tryParse(_expirationDateController.text) ?? DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2100));
    if (picked != null) setState(() => _expirationDateController.text = DateFormat('yyyy-MM-dd').format(picked));
  }

  Future<void> _updateAdjustment() async {
    if (!_formKey.currentState!.validate() || _selectedCourse == null || _selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor, complete todos los campos.')));
      return;
    }

    setState(() => _isLoading = true);
    
    try {
      // 1. Obtenemos el documento de ajuste completo para poder modificarlo
      final adjustmentDocs = await AdjustmentService.getAdjustmentDocumentsRaw(widget.studentId);
      
      // Buscamos el documento que contiene el ajuste que estamos editando
      final docToUpdate = adjustmentDocs.firstWhere(
          (doc) => (doc['currentAdjustments'] as List).any((adj) => adj['_id'] == widget.adjustmentToEdit.id),
          orElse: () => throw Exception("Documento de ajuste no encontrado.")
      );

      final String targetDocId = docToUpdate['_id'];
      // Creamos una copia mutable de la lista de ajustes
      final List<dynamic> currentAdjustments = List.from(docToUpdate['currentAdjustments']);
      final int targetIndex = currentAdjustments.indexWhere((adj) => adj['_id'] == widget.adjustmentToEdit.id);

      if (targetIndex == -1) {
          throw Exception("Ajuste específico no encontrado en el documento.");
      }

      // 2. Modificamos solo el ajuste en el índice encontrado
      currentAdjustments[targetIndex] = {
        ...currentAdjustments[targetIndex], // Mantenemos los datos antiguos no editables (como approvedBy)
        "type": _selectedCategoryId,
        "comentarios": _descriptionController.text.trim(),
        "courseNrc": _selectedCourse!.nrc,
        "expirationDate": DateTime.parse(_expirationDateController.text).toIso8601String(),
        "semester": _selectedCourse!.semestre,
      };

      // 3. Preparamos el DTO con el array completo de ajustes modificado
      final updateDto = {
        'currentAdjustments': currentAdjustments,
      };
      
      // 4. Llamamos al método de servicio que usa PATCH /adjustments/:id
      final success = await AdjustmentService.updateAdjustmentDocument(targetDocId, updateDto);

      if (!mounted) return;
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ajuste actualizado'), backgroundColor: Colors.green));
        Navigator.of(context).pop(true);
      } else {
        throw Exception("Falló la actualización del ajuste.");
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Editar Ajuste')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(children: [
                   DropdownButtonFormField<String>(
                      value: _selectedCategoryId,
                      items: _adjustmentCategories.map<DropdownMenuItem<String>>((category) {
                        return DropdownMenuItem<String>(
                          value: category['_id'] as String,
                          child: Text(category['name'] as String),
                        );
                      }).toList(),
                      onChanged: (value) => setState(() => _selectedCategoryId = value),
                      decoration: const InputDecoration(labelText: 'Tipo de Ajuste', border: OutlineInputBorder()),
                      validator: (value) => value == null ? 'Campo requerido' : null,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<Course>(
                      value: _selectedCourse,
                      items: _courses.map((course) => DropdownMenuItem(value: course, child: Text('${course.nombre} (${course.nrc})'))).toList(),
                      onChanged: (value) => setState(() => _selectedCourse = value),
                      decoration: const InputDecoration(labelText: 'Curso', border: OutlineInputBorder()),
                      validator: (value) => value == null ? 'Debe seleccionar un curso' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(labelText: 'Descripción (Comentarios)', border: OutlineInputBorder()),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _expirationDateController,
                      decoration: const InputDecoration(labelText: 'Fecha de Vencimiento', border: OutlineInputBorder(), suffixIcon: Icon(Icons.calendar_today)),
                      readOnly: true,
                      onTap: _selectDate,
                      validator: (value) => (value?.isEmpty ?? true) ? 'Campo requerido' : null,
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _updateAdjustment,
                      style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
                      child: const Text('Guardar Cambios'),
                    ),
                ],),
              ),
            ),
    );
  }
}