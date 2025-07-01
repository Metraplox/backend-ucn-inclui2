// screens/students/student_own_profile_screen.dart
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:incluye_app/models/studentAdjustment.dart';
import 'dart:io';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/services/document_service.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:intl/intl.dart';

class StudentOwnProfileScreen extends StatefulWidget {
  const StudentOwnProfileScreen({super.key});

  @override
  State<StudentOwnProfileScreen> createState() =>
      _StudentOwnProfileScreenState();
}

class _StudentOwnProfileScreenState extends State<StudentOwnProfileScreen> {
  Student? _studentData;
  bool _isLoading = true;
  List<StudentAdjustment> _adjustments = [];
  final List<Map<String, dynamic>> currentAdjustment = [];

  @override
  void initState() {
    super.initState();
    _loadStudentData();
  }

  Future<void> _loadStudentData() async {
    print(
      "StudentOwnProfileScreen: Cargando perfil del estudiante actual (logueado)...",
    );
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });
    print("ACCESS_TOKEN ");
    print(await ApiService.getToken());

    try {
      final data =
          await StudentService.getStudentProfile(); // Para el usuario logueado
      if (!mounted) return;

      if (data != null) {
        print(
          "StudentOwnProfileScreen: Perfil del estudiante actual cargado: ${data.nombres}",
        );
        final adjustments = await AdjustmentService.getStudentAdjustments(
          data.id,
        );

        setState(() {
          _studentData = data;
          _adjustments = adjustments;
          _isLoading = false;
        });

        for (var adjustment in _adjustments) {
          for (var ca in adjustment.currentAdjustments) {
            currentAdjustment.add({
              'adjustment': adjustment,
              'currentAdjustment': ca,
            });
          }
        }
      } else {
        print(
          "StudentOwnProfileScreen: No se pudo obtener el perfil del estudiante actual.",
        );
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No se pudo cargar tu perfil.'),
            backgroundColor: Colors.red,
          ),
        );
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e, s) {
      if (!mounted) return;
      print("StudentOwnProfileScreen: Error cargando datos: $e");
      print("StudentOwnProfileScreen: Stacktrace: $s");
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar datos: ${e.toString()}')),
      );
    }
  }

  String _formatDateString(String? rawIsoDateString) {
    if (rawIsoDateString == null || rawIsoDateString.isEmpty)
      return 'No disponible';
    try {
      final date = DateTime.parse(rawIsoDateString);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      print("Error formateando fecha '$rawIsoDateString': $e");
      return rawIsoDateString;
    }
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) return 'No disponible';
    try {
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return date.toIso8601String().split('T').first;
    }
  }

  Future<void> _downloadTemplate() async {
    /* ... */
  }

  Future<void> _uploadSignedConsent() async {
    // Para el perfil propio, el ID que se usa para el documento es el del User asociado.
    final String? targetUserId = _studentData?.userId?.id;
    if (targetUserId == null || targetUserId.isEmpty) {
      print(
        "StudentOwnProfileScreen: Error - ID de usuario no disponible para subir consentimiento.",
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error: No se pudo identificar al usuario.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    print(
      "StudentOwnProfileScreen: Subiendo consentimiento para User ID: $targetUserId",
    );

    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );
      if (!mounted || result == null || result.files.single.path == null)
        return;

      final file = File(result.files.single.path!);
      final document = await DocumentService.uploadDocument(
        file,
        targetUserId,
        documentType: 'CONSENTIMIENTO',
        description: 'Consentimiento firmado',
        category: 'CONSENTIMIENTO',
      );

      if (!mounted) return;
      if (document != null) {
        _loadStudentData();
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Documento subido.')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error al subir documento')),
        );
      }
    } catch (e, s) {
      if (!mounted) return;
      print(
        "StudentOwnProfileScreen: Excepción al subir consentimiento: $e\nStacktrace: $s",
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al subir: ${e.toString()}')),
      );
    }
  }

  void _viewSignedConsent() {
    /* ... */
  }

  @override
  Widget build(BuildContext context) {
    // ... (código del build method, prácticamente igual al que me enviaste, solo ajustando accesos a _studentData)
    // Asegúrate que los Text() que faltaban estén llenos y que uses _studentData!.propiedad
    // y para la fecha _formatDateTime(_studentData!.fechaNacimiento)

    final isMobile = MediaQuery.of(context).size.width < 600;
    final padding = isMobile ? 16.0 : 24.0;

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Mi Perfil')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_studentData == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Mi Perfil')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('No se pudo cargar la información del perfil.'),
              ElevatedButton(
                onPressed: _loadStudentData,
                child: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    final bool hasConsent = _studentData!.consentimientoFirmado;

    return Scaffold(
      appBar: AppBar(title: const Text('Mi Perfil')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(padding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Column(
                        children: [
                          const CircleAvatar(
                            radius: 40,
                            backgroundColor: Colors.blue,
                            child: Icon(
                              Icons.person,
                              size: 40,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _studentData!.nombreCompleto,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          Text(
                            _studentData!.email,
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    _infoRow('Rut:', _studentData!.rut),
                    _infoRow(
                      'Teléfono:',
                      _studentData!.informacionContacto ??
                          _studentData!.telefono ??
                          'No disponible',
                    ),
                    _infoRow(
                      'Carrera:',
                      _studentData!.carreraNombre ?? 'No asignada',
                    ),
                    _infoRow(
                      'Año ingreso:',
                      _studentData!.anioIngreso?.toString() ?? 'No disponible',
                    ),
                    _infoRow(
                      'Necesidades Especiales:',
                      _studentData!.necesidadesEducativasEspeciales ??
                          'Ninguna',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.security, color: Colors.blue),
                        const SizedBox(width: 8),
                        const Text(
                          'Consentimiento Informado',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ), // Texto añadido
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: hasConsent ? Colors.green : Colors.orange,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            hasConsent ? 'Aprobado' : 'Pendiente',
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'El consentimiento informado es necesario para que podamos compartir información sobre tus necesidades específicas con docentes y unidades académicas relevantes.',
                      style: TextStyle(fontSize: 14),
                    ), // Texto añadido
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        OutlinedButton.icon(
                          icon: const Icon(Icons.download),
                          label: const Text('Descargar plantilla'),
                          onPressed: _downloadTemplate,
                        ),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.upload_file),
                          label: const Text('Subir firmado'),
                          onPressed: hasConsent ? null : _uploadSignedConsent,
                        ),
                      ],
                    ),
                    if (hasConsent) ...[
                      const SizedBox(height: 12),
                      Center(
                        child: TextButton.icon(
                          icon: const Icon(Icons.visibility),
                          label: const Text('Ver documento firmado'),
                          onPressed: _viewSignedConsent,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.settings_accessibility, color: Colors.blue),
                        SizedBox(width: 8),
                        Text(
                          'Mis Ajustes Razonables',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _adjustments.isEmpty
                        ? const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text(
                              'No tienes ajustes razonables asignados',
                            ),
                          ),
                        )
                        : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: currentAdjustment.length,
                          itemBuilder: (context, index) {
                            final item = currentAdjustment[index];
                            final adjustment =
                                item['adjustment'] as StudentAdjustment;
                            final ca = item['currentAdjustment'] as Adjustment;
                            final isActive =
                                (ca.estado?.toLowerCase() == 'activo');

                            return ListTile(
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Tipo: ${ca.tipo}'),
                                  Text('NRC: ${ca.courseNrc}'),
                                  Text('Estado: ${ca.estado}'),
                                ],
                              ),
                              trailing: Chip(
                                label: Text(ca.status?.toUpperCase() ?? 'N/A'),
                                backgroundColor:
                                    isActive
                                        ? Colors.green[100]
                                        : Colors.grey[300],
                              ),
                            );
                          },
                        ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value.isEmpty ? 'No disponible' : value)),
        ],
      ),
    );
  }
}
