import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/widgets/edit_student_dialog.dart';
import 'package:incluye_app/screens/adjustment/adjustment_history_screen.dart'; 
import 'package:incluye_app/widgets/edit_adjustment_dialog.dart';  

class StudentProfileScreen extends StatefulWidget {
  final String studentId;
  const StudentProfileScreen({required this.studentId, Key? key}) : super(key: key);

  @override
  _StudentProfileScreenState createState() => _StudentProfileScreenState();
}

class _StudentProfileScreenState extends State<StudentProfileScreen> {
  Map<String, dynamic>? student;
  bool isLoading = true;
  bool consentGiven = false;

  List<String> periodos = ['2025-1', '2025-2', '2026-1'];
  String? selectedPeriodo;

  Map<String, List<Map<String, dynamic>>> cursosPorPeriodo = {
    '2025-1': [
      {"nombre": "Matemáticas I", "nrc": "MAT101-1", "profesor": "Dr. Luis Paredes", "ajuste": "Tiempo extra"},
      {"nombre": "Introducción a la Programación", "nrc": "INF102-2", "profesor": "Ing. María Silva", "ajuste": "Silla ergonómica"},
    ],
    '2025-2': [
      {"nombre": "Física I", "nrc": "FIS101-1", "profesor": "Dr. Ana Gómez", "ajuste": ""},
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
    }
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
      consentGiven = data?['consentimientoFirmado'] ?? false;
    });
  }

  String _formatDate(String? rawDate) {
    if (rawDate == null) return '';
    return rawDate.split('T').first;
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

  Future<void> _pickSignedConsent() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );
    if (result != null && result.files.single.path != null) {
      final path = result.files.single.path!;
      // Aquí subir archivo usando ApiService
      setState(() {
        consentGiven = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Consentimiento subido con éxito.')),
      );
    }
  }

  void _viewSignedConsent() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Abriendo PDF firmado...')),
    );
  }

  void _onPeriodoChanged(String? newPeriodo) {
    if (newPeriodo == null) return;
    setState(() {
      selectedPeriodo = newPeriodo;
    });
  }

  void _openAdjustmentHistory() {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => AdjustmentHistoryScreen(studentId: widget.studentId),
    ));
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
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Estudiante'),
        leading: BackButton(onPressed: () => Navigator.of(context).pop()),
      ),
      body: LayoutBuilder(builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 600;
        final padding = isMobile ? 12.0 : 16.0;
        final fontSizeTitle = isMobile ? 18.0 : 20.0;

        return SingleChildScrollView(
          padding: EdgeInsets.all(padding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Info básica y consentimiento diagnóstico
              Container(
                padding: EdgeInsets.all(padding),
                decoration: BoxDecoration(
                  color: Colors.pink.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: isMobile
                    ? Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${student!['nombres']} ${student!['apellidos']}',
                            style: TextStyle(fontSize: fontSizeTitle, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text('RUT: ${student!['rut']}'),
                          const SizedBox(height: 12),
                          const Text('Consentimiento para compartir diagnóstico:', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text('Email: ${student!['email']}'),
                          Text('Carrera: ${student!['carrera']}'),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              const Text('Consentimiento firmado'),
                              Switch(
                                value: consentGiven,
                                onChanged: (v) {
                                  setState(() {
                                    consentGiven = v;
                                  });
                                },
                              ),
                            ],
                          )
                        ],
                      )
                    : Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${student!['nombres']} ${student!['apellidos']}',
                                  style: TextStyle(fontSize: fontSizeTitle, fontWeight: FontWeight.bold),
                                ),
                                Text('RUT: ${student!['rut']}'),
                                const SizedBox(height: 12),
                                const Text('Consentimiento para compartir diagnóstico:', style: TextStyle(fontWeight: FontWeight.bold)),
                                Text('Email: ${student!['email']}'),
                                Text('Carrera: ${student!['carrera']}'),
                              ],
                            ),
                          ),
                          Switch(
                            value: consentGiven,
                            onChanged: (v) {
                              setState(() {
                                consentGiven = v;
                              });
                            },
                          ),
                        ],
                      ),
              ),

              SizedBox(height: padding),

              // Botón Solicitar Ajuste Especial
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.add),
                  label: const Text('Solicitar Ajuste Especial'),
                  onPressed: () => _showAddEditAdjustment(),
                  style: OutlinedButton.styleFrom(
                    shape: const StadiumBorder(),
                    padding: EdgeInsets.symmetric(vertical: isMobile ? 10 : 12),
                  ),
                ),
              ),

              SizedBox(height: padding * 1.5),

              // Consentimiento Informado (sección azul)
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(padding),
                decoration: BoxDecoration(
                  color: Colors.lightBlue.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.verified, color: Colors.blue),
                        SizedBox(width: 8),
                        Text('Consentimiento Informado', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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

              SizedBox(height: padding * 1.5),

              // Selector de Periodo y tabla de cursos
              Row(
                children: [
                  Text('Cursos por Periodo:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 16),
                  DropdownButton<String>(
                    value: selectedPeriodo,
                    items: periodos
                        .map((p) => DropdownMenuItem(
                              value: p,
                              child: Text(p),
                            ))
                        .toList(),
                    onChanged: _onPeriodoChanged,
                  ),
                ],
              ),

              SizedBox(height: 12),

              // Scroll horizontal para la tabla en móviles
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: MediaQuery.of(context).size.width),
                  child: _buildCursosTable(),
                ),
              ),

              SizedBox(height: padding * 1.5),

              // Ajustes Realizados
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Ajustes Realizados:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.history),
                    label: const Text('Historial'),
                    onPressed: _openAdjustmentHistory,
                  )
                ],
              ),

              SizedBox(height: 12),

              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: MediaQuery.of(context).size.width),
                  child: _buildAjustesTable(),
                ),
              ),
              SizedBox(height: 12),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.add),
                  label: const Text('Agregar Ajuste'),
                  onPressed: () => _showAddEditAdjustment(),
                  style: OutlinedButton.styleFrom(
                    shape: const StadiumBorder(),
                    padding: EdgeInsets.symmetric(vertical: isMobile ? 10 : 12),
                  ),
                ),
              ),

              SizedBox(height: padding * 1.5),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.edit),
                  label: const Text('Editar'),
                  onPressed: _showEditDialog,
                  style: OutlinedButton.styleFrom(
                    shape: const StadiumBorder(),
                    padding: EdgeInsets.symmetric(vertical: isMobile ? 10 : 12),
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildCursosTable() {
    final cursos = cursosPorPeriodo[selectedPeriodo] ?? [];

    if (cursos.isEmpty) {
      return const Text('No hay cursos para este periodo.');
    }

    return DataTable(
      columns: const [
        DataColumn(label: Text('Nombre')),
        DataColumn(label: Text('NRC')),
        DataColumn(label: Text('Profesor')),
        DataColumn(label: Text('Ajuste')),
      ],
      rows: cursos
          .map(
            (curso) => DataRow(cells: [
              DataCell(Text(curso['nombre'] ?? '')),
              DataCell(Text(curso['nrc'] ?? '')),
              DataCell(Text(curso['profesor'] ?? '')),
              DataCell(Text(curso['ajuste'] ?? '')),
            ]),
          )
          .toList(),
    );
  }

  Widget _buildAjustesTable() {
    if (ajustes.isEmpty) {
      return const Text('No hay ajustes realizados.');
    }

    return DataTable(
      columns: const [
        DataColumn(label: Text('Curso')),
        DataColumn(label: Text('Tipo')),
        DataColumn(label: Text('Aprobado Por')),
        DataColumn(label: Text('Fecha Aprobación')),
        DataColumn(label: Text('Vencimiento')),
        DataColumn(label: Text('Acciones')),
      ],
      rows: ajustes
          .map(
            (a) => DataRow(cells: [
              DataCell(Text(a['curso'] ?? '')),
              DataCell(Text(a['tipo'] ?? '')),
              DataCell(Text(a['aprobadoPor'] ?? '')),
              DataCell(Text(_formatDate(a['fechaAprobacion']))),
              DataCell(Text(_formatDate(a['vencimiento']))),
              DataCell(
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () => _showAddEditAdjustment(ajuste: a),
                ),
              ),
            ]),
          )
          .toList(),
    );
  }
}
