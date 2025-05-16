// Importaciones necesarias para la pantalla de perfil de estudiante
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:incluye_app/screens/adjustment/adjustment_history_screen.dart';
import 'package:incluye_app/widgets/edit_adjustment_dialog.dart';
import 'package:intl/intl.dart';
import 'package:incluye_app/models/student_model.dart';

class StudentProfileScreen extends StatefulWidget {
  final String studentId;
  const StudentProfileScreen({required this.studentId, super.key});

  @override
  StudentProfileScreenState createState() => StudentProfileScreenState();
}

class StudentProfileScreenState extends State<StudentProfileScreen> {
  Student? student;
  bool isLoading = true;
  bool consentGiven = false;

  List<String> periodos = ['2025-1', '2025-2', '2026-1'];
  String? selectedPeriodo;

  Map<String, List<Map<String, dynamic>>> cursosPorPeriodo = {
    '2025-1': [
      {
        "nombre": "Matemáticas I",
        "nrc": "MAT101-1",
        "profesor": "Dr. Luis Paredes",
        "ajuste": "Tiempo extra",
      },
      {
        "nombre": "Introducción a la Programación",
        "nrc": "INF102-2",
        "profesor": "Ing. María Silva",
        "ajuste": "Silla ergonómica",
      },
    ],
    '2025-2': [
      {
        "nombre": "Física I",
        "nrc": "FIS101-1",
        "profesor": "Dr. Ana Gómez",
        "ajuste": "",
      },
    ],
    '2026-1': [],
  };

  List<Map<String, dynamic>> ajustes = [
    {
      "tipo": "Tiempo extra",
      "curso": "MAT101-1",
      "fechaAprobacion": "2025-04-10",
      "aprobadoPor": "coordinadora@ucn.cl",
      "vencimiento": "2025-12-31",
    },
  ];

  @override
  void initState() {
    super.initState();
    selectedPeriodo = periodos.first;
    _loadStudent();
  }

  Future<void> _loadStudent() async {
    final data = await ApiService.getStudentById(widget.studentId);
    setState(() {
      student = data;
      isLoading = false;
      consentGiven = student?.consentimientoFirmado ?? false;
    });
  }

  String _formatDate(String? rawDate) {
    if (rawDate == null || rawDate.isEmpty) return 'No disponible';
    try {
      final date = DateTime.parse(rawDate);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return rawDate.split('T').first;
    }
  }

  void _showEditDialog() {
    if (student == null) return;
    showDialog(
      context: context,
      builder: (_) => EditStudentDialog(
        student: student!,
        onUpdated: (updatedStudent) {
          setState(() {
            student = updatedStudent;
          });
          Navigator.of(context).pop();
        },
      ),
    );
  }

  Future<void> _downloadTemplate() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Descargando plantilla...')),
    );
  }

  // Método para seleccionar y subir el documento de consentimiento firmado
  Future<void> _pickSignedConsent() async {
    // Usar FilePicker para seleccionar archivo PDF
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );
    
    // Verificar si el widget sigue montado después de la operación asíncrona
    if (!mounted) return;
    
    if (result != null && result.files.single.path != null) {
      // Obtener ruta del archivo seleccionado
      final filePath = result.files.single.path!;
      // Crear objeto File con la ruta
      final file = File(filePath);
      
      // Subir archivo usando ApiService
      final document = await ApiService.uploadDocument(
        file, 
        widget.studentId,
        documentType: 'CONSENTIMIENTO',
        description: 'Consentimiento firmado para ajustes razonables',
        category: 'CONSENTIMIENTO'
      );
      
      // Verificar nuevamente si el widget sigue montado
      if (!mounted) return;
      
      if (document != null) {
        // Actualizar estado de consentimiento si se subió correctamente
        setState(() {
          consentGiven = true;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Consentimiento subido correctamente')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al subir el consentimiento'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _viewSignedConsent() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Abriendo documento...')),
    );
  }

  void _showAdjustmentHistory() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => AdjustmentHistoryScreen(studentId: widget.studentId),
      ),
    );
  }

  void _showAddEditAdjustment({Map<String, dynamic>? ajuste}) {
    showDialog(
      context: context,
      builder: (_) => EditAdjustmentDialog(
        initialData: ajuste,
        onSaved: (newAjuste) {
          setState(() {
            if (ajuste != null) {
              final index = ajustes.indexOf(ajuste);
              ajustes[index] = newAjuste;
            } else {
              ajustes.add(newAjuste);
            }
          });
          Navigator.of(context).pop();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Estudiante'),
        leading: BackButton(onPressed: () => Navigator.of(context).pop()),
        elevation: 0,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 600;
          final padding = isMobile ? 12.0 : 16.0;
          final fontSizeTitle = isMobile ? 18.0 : 20.0;

          return SingleChildScrollView(
            padding: EdgeInsets.all(padding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Info básica y consentimiento diagnóstico
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                    child: isMobile
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${student!['nombres']} ${student!['apellidos']}',
                              style: TextStyle(
                                fontSize: fontSizeTitle,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'RUT: ${student!['rut']}',
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Carrera: ${student!['carrera']}',
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Diagnóstico: ${student!['diagnostico']}',
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
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${student!['nombres']} ${student!['apellidos']}',
                                    style: TextStyle(
                                      fontSize: fontSizeTitle,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'RUT: ${student!['rut']}',
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              flex: 2,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Carrera: ${student!['carrera']}',
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Diagnóstico: ${student!['diagnostico']}',
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                  ),
                ),

                SizedBox(height: padding),

                // Botón Solicitar Ajuste Especial
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

                // Consentimiento Informado (sección azul)
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
                        Row(
                          children: const [
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
                          'Para cumplir requisitos legales, debes firmar y subir tu consentimiento informado para compartir tu diagnóstico.',
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
                              onPressed: consentGiven ? null : _pickSignedConsent,
                              icon: const Icon(Icons.upload_file),
                              label: const Text('Subir firmado'),
                            ),
                            ElevatedButton.icon(
                              onPressed: consentGiven ? _viewSignedConsent : null,
                              icon: const Icon(Icons.picture_as_pdf),
                              label: const Text('Ver firmado'),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),
                        if (consentGiven)
                          Text(
                            'Consentimiento subido el ${DateTime.now().toIso8601String().split('T').first}',
                            style: const TextStyle(color: Colors.green),
                          ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: padding * 1.5),

                // Selector de Periodo y tabla de cursos
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                              items: periodos.map((periodo) {
                                return DropdownMenuItem<String>(
                                  value: periodo,
                                  child: Text(periodo),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minWidth: MediaQuery.of(context).size.width - (padding * 2),
                            ),
                            child: _buildCursosTable(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: padding * 1.5),

                // Tabla de ajustes
                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                            const Icon(Icons.accessibility_new, color: Colors.purple),
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
                              minWidth: MediaQuery.of(context).size.width - (padding * 2),
                            ),
                            child: _buildAjustesTable(),
                          ),
                        ),
                        const SizedBox(height: 16),

                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.add),
                            label: const Text('Agregar Ajuste'),
                            onPressed: () => _showAddEditAdjustment(ajuste: null),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.indigo,
                              side: BorderSide(color: Colors.indigo),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
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

                SizedBox(height: padding * 1.5),

                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.edit),
                    label: const Text('Editar Información del Estudiante'),
                    onPressed: _showEditDialog,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.indigo,
                      side: BorderSide(color: Colors.indigo),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
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

  Widget _buildCursosTable() {
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
      columnSpacing: 24,
      horizontalMargin: 12,
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

  Widget _buildAjustesTable() {
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
      columnSpacing: 24,
      horizontalMargin: 12,
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
