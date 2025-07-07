// screens/students/student_profile_screen.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/models/studentAdjustment.dart';
import 'package:incluye_app/models/student_model.dart';
// Asegúrate de que estos modelos y servicios existan y estén correctamente importados
// import 'package:incluye_app/models/adjustment_model.dart'; // Si usas un modelo tipado para 'ajustes'
import 'package:incluye_app/services/course_service.dart'; // Para cargar cursos
// import 'package:incluye_app/services/adjustment_service.dart'; // Para cargar ajustes
import 'package:incluye_app/screens/adjustments/adjustment_history_screen.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/screens/documents/document_consent_screen.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:incluye_app/widgets/edit_adjustment_dialog.dart'; // Asegúrate que este widget exista
import 'package:intl/intl.dart';
import 'package:incluye_app/screens/adjustments/adjustment_edit_screen.dart';

class StudentProfileScreen extends StatefulWidget {
  final String studentId;
  final String? careerId; // ID del documento Student
  const StudentProfileScreen({
    required this.studentId,
    this.careerId,
    super.key,
  });

  @override
  StudentProfileScreenState createState() => StudentProfileScreenState();
}

class StudentProfileScreenState extends State<StudentProfileScreen> {
  Student? _studentData;
  bool _isLoading = true;

  bool _isAdmin = false;

  List<String> periodos = []; // Debería ser dinámico
  String? selectedPeriodo;
  String _getActualSemester() {
    if (DateTime.now().month < 7) {
      return '1';
    } else {
      return '2';
    }
  }

  // Usar Map<String, dynamic> para los datos de ejemplo hasta que tengas modelos tipados
  List<Course> _studentCourses = [];
  List<StudentAdjustment> _studentAdjustments = [];
  List<Adjustment> _studentCurrentAdjustments = [];
  Map<String, String> _categoryNamesMap = {};

  Map<String, List<Course>> get cursosPorPeriodo {
    final Map<String, List<Course>> map = {};
    for (final curso in _studentCourses) {
      final periodo = curso.semestre ?? 'Desconocido';
      map.putIfAbsent(periodo, () => []).add(curso);
    }
    return map;
  }

  @override
  void initState() {
    super.initState();
    selectedPeriodo =
        '${DateTime.now().year.toString()}-${_getActualSemester()}';
    _loadStudentData();
    _getPeriods(periodos);
  }

   Future<void> _loadStudentData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        StudentService.getStudentById(widget.studentId),
        CourseService.getStudentCourses(widget.studentId),
        AdjustmentService.getAdjustmentHistory(widget.studentId, active: true),
        StudentService.isAdmin(),
        AdjustmentService.getAdjustmentCategories(),
      ]);

      if (!mounted) return;
      final student = results[0] as Student?;
      if (student != null) {
        final categories = results[4] as List<Map<String, dynamic>>;
        
        // ✅ INICIO DE LA CORRECCIÓN
        // Casteamos explícitamente la clave cat['_id'] a String.
        final categoryMap = {for (var cat in categories) cat['_id'] as String: cat['name'] as String};
        // ✅ FIN DE LA CORRECCIÓN

        setState(() {
          _studentData = student;
          _studentCourses = results[1] as List<Course>;
          _studentCurrentAdjustments = results[2] as List<Adjustment>;
          _isAdmin = results[3] as bool;
          _categoryNamesMap = categoryMap;
        });
      } else {
        throw Exception('No se pudo cargar el perfil.');
      }
    } catch (e, s) {
      print("Error cargando perfil: $e\n$s");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al cargar perfil: ${e.toString()}'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _editAdjustment(BuildContext context, Adjustment adjustmentToEdit) async {
  if (_studentData == null) return;
  
  final result = await Navigator.push<bool>(
    context,
    MaterialPageRoute(
      builder: (context) => AdjustmentEditScreen(
        studentId: widget.studentId,
        studentRut: _studentData!.rut,
        adjustmentToEdit: adjustmentToEdit, // Le pasas el objeto 'Adjustment'
      ),
    ),
  );

  if (result == true) {
    _loadStudentData(); // Recarga los datos si la edición fue exitosa
  }
}

  /// Cancela un ajuste específico, cambiando su estado a 'cancelado'.
  Future<void> _cancelAdjustment(BuildContext context, Adjustment adjustmentToCancel) async {
    // 1. Pedir confirmación al usuario
    final bool? confirm = await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar Cancelación'),
        content: const Text('¿Estás seguro de que quieres cancelar este ajuste? Esta acción es irreversible.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('No')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Sí, Cancelar', style: TextStyle(color: Colors.red))),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);

    try {
      // 2. Encontrar el documento y el índice del ajuste a cancelar
      // ✅ Se usa el nuevo método que devuelve el JSON crudo.
      final List<Map<String, dynamic>> adjustmentDocs = await AdjustmentService.getAdjustmentDocumentsRaw(widget.studentId);
      String? targetDocId;
      int? targetIndex;

      for (var doc in adjustmentDocs) {
        // Obtenemos la lista de 'currentAdjustments' del mapa.
        final List<dynamic>? currentAdjustments = doc['currentAdjustments'];
        if (currentAdjustments == null) continue;

        // Buscamos el subdocumento que coincida con el ID del ajuste a cancelar.
        final index = currentAdjustments.indexWhere(
          (adj) => adj is Map && adj['_id'] == adjustmentToCancel.id
        );

        if (index != -1) {
          targetDocId = doc['_id']; // ID del documento padre
          targetIndex = index;    // Índice del subdocumento
          break;
        }
      }

      if (targetDocId == null || targetIndex == null) {
        throw Exception('No se pudo encontrar el ajuste para cancelar. Puede que ya no exista.');
      }
      
      // 3. Llamar al servicio para actualizar el estado
      final success = await AdjustmentService.updateAdjustmentStatus(
        adjustmentDocId: targetDocId,
        adjustmentIndex: targetIndex,
        newStatus: 'cancelado',
        comments: 'Cancelado por administrador desde el perfil del estudiante.',
      );

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ajuste cancelado correctamente'), backgroundColor: Colors.green),
        );
        _loadStudentData();
      } else {
        throw Exception('El servidor denegó la solicitud de cancelación.');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cancelar: ${e.toString()}'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _getPeriods(List<String> periods) {
    final now = DateTime.now();
    final actualYear = now.year;
    for (int year = actualYear - 1; year <= actualYear + 1; year++) {
      periods.add('${year}-1');
      periods.add('${year}-2');
    }
    setState(() {
      periodos = periods;
    });
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) return 'No disponible';
    try {
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return date.toIso8601String().split('T').first;
    }
  }

  String _formatDateString(String? rawIsoDateString) {
    if (rawIsoDateString == null || rawIsoDateString.isEmpty)
      return 'No disponible';
    try {
      final date = DateTime.parse(rawIsoDateString);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return rawIsoDateString;
    }
  }

  void _showEditDialog() {
    if (_studentData == null) return;
    showDialog(
      context: context,
      builder:
          (_) => EditStudentDialog(
            student: _studentData!,
            onUpdated: (updatedStudent) {
              if (!mounted) return;
              setState(() {
                _studentData = updatedStudent;
              });
              _loadStudentData();
              Navigator.of(context).pop();
            },
          ),
    );
  }

  Future<void> _downloadTemplate() async {
    /* ... */
  }
  Future<void> _pickSignedConsent() async {
    final String? targetUserIdForDocument = _studentData?.userId?.id;
    if (targetUserIdForDocument == null || targetUserIdForDocument.isEmpty) {
      /* ... error ... */
      return;
    }
    // ... lógica de FilePicker y DocumentService.uploadDocument ...
  }

  Future<void> _viewSignedConsent() async {
    /* ... */
  }

  void _showAdjustmentHistory() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder:
            (context) => AdjustmentHistoryScreen(studentId: widget.studentId),
      ),
    );
  }

  void _showAddEditAdjustment({Map<String, dynamic>? ajuste}) {
    // Asegúrate que EditAdjustmentDialog exista y funcione
    showDialog(
      context: context,
      builder:
          (_) => EditAdjustmentDialog(
            initialData: ajuste,
            onSaved: (newAjuste) {
              /* ... */
            },
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Detalle de Estudiante')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (_studentData == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Detalle de Estudiante')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('No se pudo cargar la información.'),
              ElevatedButton(
                onPressed: _loadStudentData,
                child: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    final bool consentGiven = _studentData!.consentimientoFirmado;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 600;
    // final isTablet = screenWidth >= 600 && screenWidth < 900; // Puedes usar esto si necesitas más granularidad
    final padding = isMobile ? 12.0 : 20.0;
    final fontSizeTitle = isMobile ? 18.0 : 22.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Estudiante (Admin)'),
        leading: BackButton(onPressed: () => Navigator.of(context).pop()),
        elevation: 0, // Estilo de la versión "antigua"
        actions: [
          IconButton(
            icon: const Icon(Icons.folder_open),
            tooltip: 'Documentos y Consentimientos',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => DocumentConsentScreen(
                    studentId: widget.studentId,
                    studentName: _studentData?.nombreCompleto ?? 'Estudiante',
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            padding: EdgeInsets.all(padding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // --- INICIO CARD INFO BÁSICA ---
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Container(
                    padding: EdgeInsets.all(padding),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.indigo.shade50, Colors.indigo.shade100],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child:
                        isMobile
                            ? Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _studentData!.nombreCompleto,
                                  style: TextStyle(
                                    fontSize: fontSizeTitle,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'RUT: ${_studentData!.rut}',
                                  style: const TextStyle(fontSize: 16),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Carrera: ${_studentData!.carreraNombre ?? 'N/A'}',
                                  style: const TextStyle(fontSize: 16),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Necesidades Educativas: ${_studentData!.necesidadesEducativasEspeciales ?? 'N/A'}',
                                  style: const TextStyle(fontSize: 16),
                                ),
                              ],
                            )
                            : Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _studentData!.nombreCompleto,
                                        style: TextStyle(
                                          fontSize: fontSizeTitle,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'RUT: ${_studentData!.rut}',
                                        style: const TextStyle(fontSize: 16),
                                      ),
                                      Text(
                                        'Email: ${_studentData!.email}',
                                        style: const TextStyle(fontSize: 16),
                                      ), // Añadido email
                                    ],
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Carrera: ${_studentData!.carreraNombre ?? 'N/A'}',
                                        style: const TextStyle(fontSize: 16),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Necesidades Educativas: ${_studentData!.necesidadesEducativasEspeciales ?? 'N/A'}',
                                        style: const TextStyle(fontSize: 16),
                                      ),
                                      Text(
                                        'Fecha Nacimiento: ${_formatDateTime(_studentData!.fechaNacimiento)}',
                                        style: const TextStyle(fontSize: 16),
                                      ), // Añadido
                                      Text(
                                        'Contacto: ${_studentData!.informacionContacto ?? 'N/A'}',
                                        style: const TextStyle(fontSize: 16),
                                      ), // Añadido
                                    ],
                                  ),
                                ),
                              ],
                            ),
                  ),
                ),

                // --- FIN CARD INFO BÁSICA ---
                if (_isAdmin)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.add),
                      label: const Text('Solicitar Ajuste Especial'),
                      onPressed: () => _showAddEditAdjustment(ajuste: null),
                      style: OutlinedButton.styleFrom(
                        shape: const StadiumBorder(),
                        padding: EdgeInsets.symmetric(
                          vertical: isMobile ? 10 : 12,
                        ),
                      ),
                    ),
                  ),
                SizedBox(height: padding * 1.5),

                // --- INICIO CARD CONSENTIMIENTO ---
                if (_isAdmin)
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(padding),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.blue.shade50, Colors.blue.shade100],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.verified, color: Colors.blue),
                              SizedBox(width: 8),
                              Text(
                                'Consentimiento Informado',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Para cumplir requisitos legales, el estudiante debe firmar y subir su consentimiento informado para compartir su diagnóstico.',
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              ElevatedButton.icon(
                                onPressed: _downloadTemplate,
                                icon: const Icon(Icons.download),
                                label: const Text('Descargar plantilla'),
                              ),
                              ElevatedButton.icon(
                                onPressed:
                                    consentGiven ? null : _pickSignedConsent,
                                icon: const Icon(Icons.upload_file),
                                label: const Text('Subir (Admin)'),
                              ),
                              ElevatedButton.icon(
                                onPressed:
                                    consentGiven ? _viewSignedConsent : null,
                                icon: const Icon(Icons.picture_as_pdf),
                                label: const Text('Ver firmado'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if (consentGiven)
                            const Text(
                              'Consentimiento del estudiante ya fue subido.',
                              style: TextStyle(color: Colors.green),
                            ),
                        ],
                      ),
                    ),
                  ),

                // --- FIN CARD CONSENTIMIENTO ---
                SizedBox(height: padding * 1.5),

                // --- INICIO CARD CURSOS POR PERIODO ---
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(padding),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.green.shade50, Colors.green.shade100],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.school, color: Colors.green),
                            const SizedBox(width: 8),
                            const Text(
                              'Cursos por Periodo',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Spacer(),
                            DropdownButton<String>(
                              value: selectedPeriodo,
                              onChanged: (value) {
                                setState(() {
                                  selectedPeriodo = value;
                                });
                              },
                              items:
                                  periodos
                                      .map(
                                        (periodo) => DropdownMenuItem<String>(
                                          value: periodo,
                                          child: Text(periodo),
                                        ),
                                      )
                                      .toList(),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minWidth:
                                  MediaQuery.of(context).size.width -
                                  (padding * 2),
                            ),
                            child: _buildCursosTable(
                              isMobile,
                            ), // Llamada al método que construye la tabla
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // --- FIN CARD CURSOS POR PERIODO ---
                SizedBox(height: padding * 1.5),

                // --- INICIO CARD AJUSTES ACTIVOS ---
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(padding),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.purple.shade50, Colors.purple.shade100],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.accessibility_new,
                              color: Colors.purple,
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Ajustes Activos',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Spacer(),
                            TextButton.icon(
                              icon: const Icon(Icons.history),
                              label: const Text('Ver historial'),
                              onPressed: _showAdjustmentHistory,
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minWidth:
                                  MediaQuery.of(context).size.width -
                                  (padding * 2),
                            ),
                            child: _buildAjustesTable(
                              isMobile,
                            ), // Llamada al método que construye la tabla
                          ),
                        ),
                        const SizedBox(height: 16),

                        if (_isAdmin)
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              icon: const Icon(Icons.add),
                              label: const Text('Agregar Ajuste'),
                              onPressed:
                                  () => _showAddEditAdjustment(ajuste: null),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.indigo,
                                side: const BorderSide(color: Colors.indigo),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                padding: EdgeInsets.symmetric(
                                  vertical: isMobile ? 10 : 12,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                // --- FIN CARD AJUSTES ACTIVOS ---
                SizedBox(height: padding * 1.5),

                if (_isAdmin)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.edit),
                      label: const Text('Editar Información del Estudiante'),
                      onPressed: _showEditDialog,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.indigo,
                        side: const BorderSide(color: Colors.indigo),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: EdgeInsets.symmetric(
                          vertical: isMobile ? 10 : 12,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  // --- INICIO WIDGETS DE TABLAS (copiados de tu versión "antigua") ---
  Widget _buildCursosTable(bool isMobile) {
    final List<Course> cursosDelPeriodoSeleccionado =
        cursosPorPeriodo[selectedPeriodo] ?? [];

    if (cursosDelPeriodoSeleccionado.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Icon(Icons.school_outlined, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 8),
              Text(
                'No hay cursos registrados para este periodo',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    return DataTable(
      headingRowColor: WidgetStateProperty.all(Colors.green.shade50),
      dataRowColor: WidgetStateProperty.resolveWith<Color?>((
        Set<WidgetState> states,
      ) {
        if (states.contains(WidgetState.selected)) {
          return Colors.green.shade100.withAlpha(77);
        }
        if (states.contains(WidgetState.hovered)) {
          return Colors.green.shade50.withAlpha(77);
        }
        return null;
      }),
      columnSpacing: isMobile ? 16 : 24,
      horizontalMargin: isMobile ? 8 : 12,
      dataTextStyle: TextStyle(fontSize: isMobile ? 13 : 14),
      columns: const [
        DataColumn(
          label: Text('Nombre', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
        DataColumn(
          label: Text('NRC', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
        DataColumn(
          label: Text(
            'Profesor',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        DataColumn(
          label: Text('Ajuste', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
      rows:
          cursosDelPeriodoSeleccionado.map((course) {
            // Buscar ajuste relacionado con el NRC del curso
            final Adjustment? ajusteRelacionado =
                _studentCurrentAdjustments
                    .where((aj) => aj.courseNrc == course.nrc)
                    .cast<Adjustment?>()
                    .firstOrNull;

            final ajusteTexto = ajusteRelacionado?.tipo ?? '';

            return DataRow(
              cells: [
                DataCell(
                  Text(
                    course.nombre,
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                ),
                DataCell(Text(course.nrc)),
                DataCell(Text(course.profesor ?? 'Sin profesor')),
                DataCell(
                  ajusteTexto.isNotEmpty
                      ? Chip(
                        label: Text(ajusteTexto),
                        backgroundColor: Colors.blue[100],
                        labelStyle: const TextStyle(
                          color: Colors.blue,
                          fontSize: 12,
                        ),
                        padding: EdgeInsets.zero,
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      )
                      : const Text('-'),
                ),
              ],
            );
          }).toList(),
    );
  }

  Widget _buildAjustesTable(bool isMobile) {
    if (_studentCurrentAdjustments.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Icon(Icons.settings_accessibility_outlined, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 8),
              Text('No hay ajustes activos', style: TextStyle(color: Colors.grey[600])),
            ],
          ),
        ),
      );
    }
    return DataTable(
      headingRowColor: WidgetStateProperty.all(Colors.indigo.shade50),
      columnSpacing: isMobile ? 16 : 24,
      horizontalMargin: isMobile ? 8 : 12,
      dataTextStyle: TextStyle(fontSize: isMobile ? 13 : 14),
      columns: const [
        DataColumn(label: Text('Curso', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Tipo', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Vencimiento', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Acciones', style: TextStyle(fontWeight: FontWeight.bold))),
      ],
      rows: _studentCurrentAdjustments.map((adjustment) {
        // ✅ INICIO DE LA CORRECCIÓN
        // Usamos el mapa para traducir el ID del tipo a su nombre.
        // Si no lo encuentra, muestra el ID como fallback.
        final String tipoNombre = _categoryNamesMap[adjustment.tipo] ?? adjustment.tipo;
        // ✅ FIN DE LA CORRECCIÓN

        return DataRow(
          cells: [
            DataCell(Text(adjustment.courseNrc ?? 'General', style: const TextStyle(fontWeight: FontWeight.w500))),
            // Usamos la variable 'tipoNombre' que ahora contiene el nombre legible.
            DataCell(Chip(label: Text(tipoNombre), backgroundColor: Colors.blue[100])),
            DataCell(
              _isAjusteActivo(adjustment.expirationDate)
                ? Chip(label: Text(_formatDateString(adjustment.expirationDate)), backgroundColor: Colors.green[100])
                : Chip(label: Text(_formatDateString(adjustment.expirationDate)), backgroundColor: Colors.red[100]),
            ),
            DataCell(
              PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'edit') {
                    _editAdjustment(context, adjustment);
                  } else if (value == 'cancel') {
                    _cancelAdjustment(context, adjustment);
                  }
                },
                itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                  const PopupMenuItem<String>(
                    value: 'edit',
                    child: ListTile(leading: Icon(Icons.edit_outlined), title: Text('Editar')),
                  ),
                  const PopupMenuItem<String>(
                    value: 'cancel',
                    child: ListTile(leading: Icon(Icons.cancel_outlined, color: Colors.red), title: Text('Cancelar', style: TextStyle(color: Colors.red))),
                  ),
                ],
                icon: const Icon(Icons.more_vert),
              ),
            ),
          ],
        );
      }).toList(),
    );
  }

  bool _isAjusteActivo(String? fechaVencimiento) {
    if (fechaVencimiento == null || fechaVencimiento.isEmpty) return false;
    try {
      return DateTime.parse(fechaVencimiento).isAfter(DateTime.now());
    } catch (e) {
      return false;
    }
  }

  // --- FIN WIDGETS DE TABLAS ---
}
