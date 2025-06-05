// Importaciones necesarias
import 'package:flutter/material.dart';
import 'package:incluye_app/screens/adjustment/adjustment_history_screen.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:intl/intl.dart';
// Quita los imports de config si no los usas aquí
// import 'package:incluye_app/config/app_config.dart';
// import 'package:incluye_app/config/test_credentials.dart';


class StudentProfileScreen extends StatefulWidget {
  final String? studentId; // HECHO: studentId es opcional

   const StudentProfileScreen({this.studentId, super.key}); 

  @override
  StudentProfileScreenState createState() => StudentProfileScreenState();
}

class StudentProfileScreenState extends State<StudentProfileScreen> {
  Student? _studentData;
  bool _isLoading = true;

  // Datos de ejemplo, idealmente vendrían del backend
  List<String> periodos = ['2025-1', '2025-2', '2026-1'];
  String? selectedPeriodo;
  Map<String, List<Map<String, dynamic>>> cursosPorPeriodo = { /* ... */ };
  List<Map<String, dynamic>> ajustes = [ /* ... */ ];

  @override
  void initState() {
    super.initState();
    selectedPeriodo = periodos.isNotEmpty ? periodos.first : null;
    _loadStudentProfileData();
  }

  Future<void> _loadStudentProfileData() async {
    // Usamos widget.studentId para acceder al studentId pasado al StatefulWidget
    print("StudentProfileScreen: Cargando perfil de estudiante... (ID proporcionado desde widget: ${widget.studentId})"); 
    if (!mounted) return;
    setState(() { _isLoading = true; });

    try {
      Student? data; // Declaramos la variable data aquí para que esté en el scope correcto

      if (widget.studentId != null && widget.studentId!.isNotEmpty) {
        // Si se proporcionó un studentId a través del widget, cargamos ese perfil específico.
        print("StudentProfileScreen: Cargando perfil para ID específico: ${widget.studentId}");
        data = await StudentService.getStudentById(widget.studentId!); // Usamos getStudentById
      } else {
        // Si no se proporcionó studentId (es decir, widget.studentId es null o vacío),
        // cargamos el perfil del usuario actualmente logueado.
        print("StudentProfileScreen: No se proporcionó ID específico, cargando perfil del usuario actual (logueado).");
        data = await StudentService.getStudentProfile(); // Usamos getStudentProfile para el usuario logueado
      }
      
      if (!mounted) return; // Volver a verificar mounted después de operaciones async

      if (data != null) {
        print("StudentProfileScreen: Perfil de estudiante cargado: ${data.nombres} (ID: ${data.id})");
        setState(() {
          _studentData = data;
          // Aquí podrías actualizar otros estados basados en _studentData si es necesario,
          // por ejemplo, si 'consentimientoFirmado' viene del backend:
          // consentGiven = _studentData?.consentimientoFirmado ?? false; 
        });
      } else {
        // Mensaje de error más específico
        String errorMessageText = widget.studentId != null && widget.studentId!.isNotEmpty
            ? 'No se pudo cargar el perfil del estudiante con ID ${widget.studentId}.'
            : 'No se pudo cargar el perfil del estudiante actual.';
        print("StudentProfileScreen: $errorMessageText");
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessageText), backgroundColor: Colors.red),
        );
      }
    } catch (e, s) { // Añadir stacktrace al catch
      print("StudentProfileScreen: Error cargando perfil: $e");
      print("StudentProfileScreen: Stacktrace: $s");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar perfil: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() { _isLoading = false; });
      }
    }
  }

  // Modificado para aceptar DateTime?
  String _formatDate(DateTime? date) {
    if (date == null) return 'No disponible';
    try {
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      print("Error formateando fecha: $e");
      return date.toIso8601String().split('T').first; // Fallback
    }
  }

  void _showEditDialog() {
    if (_studentData == null) return;
    print("StudentProfileScreen: Mostrando diálogo para editar estudiante.");
    showDialog(
      context: context,
      builder: (_) => EditStudentDialog(
        student: _studentData!,
        onUpdated: (updatedStudent) {
          print("StudentProfileScreen: Estudiante actualizado desde diálogo.");
          if (!mounted) return;
          // Actualizar el estado local y recargar para asegurar consistencia con el backend
          setState(() {
            _studentData = updatedStudent; 
          });
          _loadStudentProfileData(); // Recargar desde el backend
          Navigator.of(context).pop();
        },
      ),
    );
  }

  Future<void> _downloadTemplate() async { /* ... (sin cambios, solo print) ... */ }
  
  Future<void> _pickSignedConsent() async {
    if (_studentData == null || _studentData!.userId == null || _studentData!.userId!.id.isEmpty) {
      print("StudentProfileScreen: Error - _studentData o _studentData.userId.id es nulo, no se puede subir consentimiento.");
       ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error: No se pudo identificar al usuario para subir el documento.'), backgroundColor: Colors.red),
        );
      return;
    }
    // ... (resto de tu lógica de _pickSignedConsent)
    // Asegúrate que el ID que pasas a DocumentService.uploadDocument es el correcto:
    // _studentData!.userId!.id (si es para el User) o _studentData!.id (si es para el Student)
    final String idParaDocumento = _studentData!.userId!.id; // O _studentData!.id;
    print("StudentProfileScreen: Seleccionando archivo de consentimiento para ID: $idParaDocumento");
    // ... (resto de la lógica con FilePicker y DocumentService.uploadDocument)
  }

  Future<void> _viewSignedConsent() async { /* ... (sin cambios, solo print) ... */ }

  void _showAdjustmentHistory() {
    if (_studentData == null) return;
    // Usar el _id del Student si AdjustmentHistoryScreen se refiere al perfil del estudiante
    print("StudentProfileScreen: Mostrando historial de ajustes para studentId: ${_studentData!.id}");
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => AdjustmentHistoryScreen(studentId: _studentData!.id), // Quitado 'const'
      ),
    );
  }

  void _showAddEditAdjustment({Map<String, dynamic>? ajuste}) { /* ... (sin cambios) ... */ }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) { /* ... (sin cambios) ... */ }
    if (_studentData == null) { /* ... (sin cambios) ... */ }

    // Acceder directamente a _studentData!.consentimientoFirmado
    final bool consentGivenByStudent = _studentData!.consentimientoFirmado;

    return Scaffold(
      appBar: AppBar( /* ... */ ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final screenWidth = constraints.maxWidth;
          final isMobile = screenWidth < 600;
          final padding = isMobile ? 12.0 : 20.0;
          final fontSizeTitle = isMobile ? 18.0 : 22.0;

          return SingleChildScrollView(
            padding: EdgeInsets.all(padding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  // ... (contenido del Card)
                  child: Container(
                    // ...
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            // Usa el getter nombreCompleto del StudentModel
                            _studentData!.nombreCompleto, 
                            style: TextStyle(fontSize: fontSizeTitle, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text('RUT: ${_studentData!.rut}', style: const TextStyle(fontSize: 16)),
                          const SizedBox(height: 4),
                          Text('Email: ${_studentData!.email}', style: const TextStyle(fontSize: 16)),
                          const SizedBox(height: 4),
                          // Usa el getter carreraNombre del StudentModel
                          Text('Carrera: ${_studentData!.carreraNombre ?? 'No asignada'}', style: const TextStyle(fontSize: 16)),
                          const SizedBox(height: 4),
                          // Pasa el DateTime? a _formatDate
                          Text('Fecha Nacimiento: ${_formatDate(_studentData!.fechaNacimiento)}', style: const TextStyle(fontSize: 16)),
                          const SizedBox(height: 4),
                          Text('Contacto: ${_studentData!.informacionContacto ?? 'No disponible'}', style: const TextStyle(fontSize: 16)),
                          const SizedBox(height: 4),
                          Text('Necesidades Especiales: ${_studentData!.necesidadesEducativasEspeciales ?? 'Ninguna'}', style: const TextStyle(fontSize: 16)),
                          // Eliminada la línea de '¿Tiene discapacidad?'
                        ],
                      )
                  ),
                ),

                SizedBox(height: padding),
                // ... (Botón Solicitar Ajuste Especial)

                SizedBox(height: padding * 1.5),

                // Consentimiento Informado
                Card(
                  elevation: 2,
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                            Text('Consentimiento Informado', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text('Para cumplir requisitos legales, debes firmar y subir tu consentimiento informado para compartir tu diagnóstico.'),
                        const SizedBox(height: 12),
                         Wrap(
                          spacing: 8, runSpacing: 8,
                          children: [
                            ElevatedButton.icon(onPressed: _downloadTemplate, icon: const Icon(Icons.download), label: const Text('Descargar plantilla')),
                            ElevatedButton.icon(onPressed: consentGivenByStudent ? null : _pickSignedConsent, icon: const Icon(Icons.upload_file), label: const Text('Subir firmado')),
                            ElevatedButton.icon(onPressed: consentGivenByStudent ? _viewSignedConsent : null, icon: const Icon(Icons.picture_as_pdf), label: const Text('Ver firmado')),
                          ],
                        ),
                         const SizedBox(height: 12),
                        if (consentGivenByStudent) // Usa la variable derivada directamente del modelo
                          Text(
                            // 'Consentimiento subido el ${DateTime.now().toIso8601String().split('T').first}', // Esto muestra fecha actual, no la de subida
                            'Consentimiento previamente subido.', // Mensaje más genérico
                            style: const TextStyle(color: Colors.green),
                          ),
                      ],
                    ),
                  )
                ),

                SizedBox(height: padding * 1.5),
                // Si vas a usar _buildCursosTable y _showAdjustmentHistory, descomenta sus llamadas aquí.
                // Card(child: _buildCursosTable(isMobile)),
                // Card(child: _buildAjustesTable(isMobile)),
                // TextButton.icon(icon: Icon(Icons.history), label: Text('Ver historial'), onPressed: _showAdjustmentHistory),


                SizedBox(height: padding * 1.5),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.edit),
                    label: const Text('Editar Mi Información'),
                    onPressed: _showEditDialog,
                     style: OutlinedButton.styleFrom(foregroundColor: Colors.indigo, side: const BorderSide(color: Colors.indigo), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), padding: EdgeInsets.symmetric(vertical: isMobile ? 10 : 12)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }


  Widget _buildCursosTable(bool isMobile) {
    final cursos = cursosPorPeriodo[selectedPeriodo] ?? [];
    if (cursos.isEmpty) {
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
      dataRowColor: WidgetStateProperty.resolveWith<Color?>(
        (Set<WidgetState> states) {
          if (states.contains(WidgetState.selected)) return Colors.green.shade100.withValues(alpha: 77); // ~0.3 opacity
          if (states.contains(WidgetState.hovered)) return Colors.green.shade50.withValues(alpha: 77); // ~0.3 opacity
          return null;
        },
      ),
      columnSpacing: isMobile ? 16 : 24,
      horizontalMargin: isMobile ? 8 : 12,
      // Ajustar el tamaño de fuente en móviles
      dataTextStyle: TextStyle(fontSize: isMobile ? 13 : 14),
      columns: const [
        DataColumn(label: Text('Nombre', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('NRC', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Profesor', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Ajuste', style: TextStyle(fontWeight: FontWeight.bold))),
      ],
      rows: cursos
          .map(
            (c) => DataRow(
              cells: [
                DataCell(Text(c['nombre'] ?? '', style: const TextStyle(fontWeight: FontWeight.w500))),
                DataCell(Text(c['nrc'] ?? '')),
                DataCell(Text(c['profesor'] ?? '')),
                DataCell(
                  c['ajuste'] != null && c['ajuste'].isNotEmpty
                      ? Chip(
                          label: Text(c['ajuste']),
                          backgroundColor: Colors.blue[100],
                          labelStyle: TextStyle(color: Colors.blue[800], fontSize: 12),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        )
                      : const Text('-'),
                ),
              ],
            ),
          )
          .toList(),
    );
  }

  Widget _buildAjustesTable(bool isMobile) {
    if (ajustes.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Icon(Icons.settings_accessibility_outlined, size: 48, color: Colors.grey[400]),
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
      dataRowColor: WidgetStateProperty.resolveWith<Color?>(
        (Set<WidgetState> states) {
          if (states.contains(WidgetState.selected)) return Colors.indigo.shade100.withValues(alpha: 77); // ~0.3 opacity
          if (states.contains(WidgetState.hovered)) return Colors.indigo.shade50.withValues(alpha: 77); // ~0.3 opacity
          return null;
        },
      ),
      columnSpacing: isMobile ? 16 : 24,
      horizontalMargin: isMobile ? 8 : 12,
      // Ajustar el tamaño de fuente en móviles
      dataTextStyle: TextStyle(fontSize: isMobile ? 13 : 14),
      columns: const [
        DataColumn(label: Text('Curso', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Tipo', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Aprobado Por', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Fecha Aprobación', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Vencimiento', style: TextStyle(fontWeight: FontWeight.bold))),
        DataColumn(label: Text('Acciones', style: TextStyle(fontWeight: FontWeight.bold))),
      ],
      rows: ajustes
          .map(
            (a) => DataRow(
              cells: [
                DataCell(Text(a['curso'] ?? '', style: const TextStyle(fontWeight: FontWeight.w500))),
                DataCell(
                  Chip(
                    label: Text(a['tipo'] ?? ''),
                    backgroundColor: Colors.blue[100],
                    labelStyle: TextStyle(color: Colors.blue[800], fontSize: 12),
                    padding: EdgeInsets.zero,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
                DataCell(Text(a['aprobadoPor'] ?? '')),
                DataCell(Text(_formatDate(a['fechaAprobacion']))),
                DataCell(
                  _isAjusteActivo(a['vencimiento'])
                      ? Chip(
                          label: Text(_formatDate(a['vencimiento'])),
                          backgroundColor: Colors.green[100],
                          labelStyle: TextStyle(color: Colors.green[800], fontSize: 12),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        )
                      : Chip(
                          label: Text(_formatDate(a['vencimiento'])),
                          backgroundColor: Colors.red[100],
                          labelStyle: TextStyle(color: Colors.red[800], fontSize: 12),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                ),
                DataCell(
                  IconButton(
                    icon: const Icon(Icons.edit, color: Colors.indigo),
                    tooltip: 'Editar ajuste',
                    onPressed: () => _showAddEditAdjustment(ajuste: a),
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
      final vencimiento = DateTime.parse(fechaVencimiento);
      return vencimiento.isAfter(DateTime.now());
    } catch (e) {
      return false;
    }
  }
}
