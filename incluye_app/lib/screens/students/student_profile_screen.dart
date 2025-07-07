// screens/students/student_profile_screen.dart
import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/models/studentAdjustment.dart';
import 'package:incluye_app/models/student_model.dart';
// Asegúrate de que estos modelos y servicios existan y estén correctamente importados
// import 'package:incluye_app/models/adjustment_model.dart'; // Si usas un modelo tipado para 'ajustes'
// import 'package:incluye_app/services/course_service.dart'; // Para cargar cursos
// import 'package:incluye_app/services/adjustment_service.dart'; // Para cargar ajustes
import 'package:incluye_app/screens/adjustment/adjustment_history_screen.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/document_service.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:incluye_app/widgets/edit_adjustment_dialog.dart'; // Asegúrate que este widget exista
import 'package:intl/intl.dart';

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
    bool isAdmin = await StudentService.isAdmin();
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });
    try {
      dynamic data;
      dynamic cursos;
      List<StudentAdjustment> ajustes = [];

      data = await StudentService.getStudentById(widget.studentId);
      cursos = await StudentService.getStudentCourses(widget.studentId);
      ajustes = await AdjustmentService.getStudentAdjustments(widget.studentId);

      if (!mounted) return;

      if (data != null) {
        final currentAdjustments =
            ajustes.expand((ajuste) => ajuste.currentAdjustments).toList();
        setState(() {
          _studentData = data;
          _studentCourses = cursos;
          _studentAdjustments = ajustes; // si la necesitas luego
          _studentCurrentAdjustments = currentAdjustments;
          _isAdmin = isAdmin;
        });
      } else {
        print(
          "StudentProfileScreen (Admin): No se pudo cargar perfil para ID ${widget.studentId}.",
        );
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'No se pudo cargar el perfil del estudiante con ID ${widget.studentId}.',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e, s) {
      print(
        "StudentProfileScreen (Admin): Error cargando perfil: $e\nStacktrace: $s",
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar perfil: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
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
      // 'ajustes' es tu lista de ejemplo
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Icon(
                Icons.settings_accessibility_outlined,
                size: 48,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 8),
              Text(
                'No hay ajustes realizados',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }
    return DataTable(
      headingRowColor: WidgetStateProperty.all(Colors.indigo.shade50),
      dataRowColor: WidgetStateProperty.resolveWith<Color?>((
        Set<WidgetState> states,
      ) {
        if (states.contains(WidgetState.selected))
          return Colors.indigo.shade100.withAlpha(77);
        if (states.contains(WidgetState.hovered))
          return Colors.indigo.shade50.withAlpha(77);
        return null;
      }),
      columnSpacing: isMobile ? 16 : 24,
      horizontalMargin: isMobile ? 8 : 12,
      dataTextStyle: TextStyle(fontSize: isMobile ? 13 : 14),
      columns: const [
        DataColumn(
          label: Text('Curso', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
        DataColumn(
          label: Text('Tipo', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
        DataColumn(
          label: Text(
            'Aprobado Por',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        DataColumn(
          label: Text(
            'Fecha Aprobación',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        DataColumn(
          label: Text(
            'Vencimiento',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        DataColumn(
          label: Text(
            'Acciones',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      ],
      rows:
          _studentCurrentAdjustments
              .map(
                (a) => DataRow(
                  cells: [
                    // 'ajustes' es tu lista de ejemplo
                    DataCell(
                      Text(
                        a['curso'] ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ),
                    DataCell(
                      Chip(
                        label: Text(a['tipo'] ?? ''),
                        backgroundColor: Colors.blue[100],
                        labelStyle: TextStyle(
                          color: Colors.blue[800],
                          fontSize: 12,
                        ),
                        padding: EdgeInsets.zero,
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                    DataCell(Text(a['aprobadoPor'] ?? '')),
                    DataCell(
                      Text(_formatDateString(a['fechaAprobacion'] as String?)),
                    ), // Usa _formatDateString
                    DataCell(
                      _isAjusteActivo(a['vencimiento'] as String?)
                          ? Chip(
                            label: Text(
                              _formatDateString(a['vencimiento'] as String?),
                            ),
                            backgroundColor: Colors.green[100],
                            labelStyle: TextStyle(
                              color: Colors.green[800],
                              fontSize: 12,
                            ),
                            padding: EdgeInsets.zero,
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                          )
                          : Chip(
                            label: Text(
                              _formatDateString(a['vencimiento'] as String?),
                            ),
                            backgroundColor: Colors.red[100],
                            labelStyle: TextStyle(
                              color: Colors.red[800],
                              fontSize: 12,
                            ),
                            padding: EdgeInsets.zero,
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                          ),
                    ),
                    DataCell(
                      IconButton(
                        icon: const Icon(Icons.edit, color: Colors.indigo),
                        tooltip: 'Editar ajuste',
                        onPressed: () {},
                      ),
                    ),
                  ],
                ),
              )
              .toList(),
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
