// screens/students/student_own_profile_screen.dart
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/adjustment_model.dart'; // Asegúrate que este modelo exista y esté bien definido
import 'package:incluye_app/services/document_service.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:intl/intl.dart';

class StudentOwnProfileScreen extends StatefulWidget {
  const StudentOwnProfileScreen({super.key});
  
  @override
  State<StudentOwnProfileScreen> createState() => _StudentOwnProfileScreenState();
}

class _StudentOwnProfileScreenState extends State<StudentOwnProfileScreen> {
  Student? _studentData;
  bool _isLoading = true;
  List<Adjustment> _adjustments = [];

  @override
  void initState() {
    super.initState();
    _loadStudentData();
  }

  Future<void> _loadStudentData() async {
    print("StudentOwnProfileScreen: Cargando perfil del estudiante actual (logueado)...");
    if (!mounted) return;
    setState(() { _isLoading = true; });
    
    try {
      final data = await StudentService.getStudentProfile();
      if (!mounted) return;
      
      if (data != null) {
        print("StudentOwnProfileScreen: Perfil del estudiante actual cargado: ${data.nombres}");
        // TODO: Reemplazar con carga real de ajustes desde el backend
        // Ejemplo: _adjustments = await AdjustmentService.getStudentAdjustments(data.id);
        _adjustments = [
          Adjustment(id: '1', tipo: 'Tiempo extra en exámenes', descripcion: '30 minutos adicionales', status: 'ACTIVO', approvedAt: '2025-04-10T00:00:00.000Z'),
          Adjustment(id: '2', tipo: 'Material accesible', descripcion: 'Textos digitales', status: 'ACTIVO', approvedAt: '2025-04-12T00:00:00.000Z'),
        ];

        setState(() {
          _studentData = data;
          _isLoading = false;
        });
      } else {
        print("StudentOwnProfileScreen: No se pudo obtener el perfil del estudiante actual.");
         ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo cargar tu perfil.'), backgroundColor: Colors.red),
        );
        setState(() { _isLoading = false; });
      }
    } catch (e, s) {
      if (!mounted) return;
      print("StudentOwnProfileScreen: Error cargando datos: $e");
      print("StudentOwnProfileScreen: Stacktrace: $s");
      setState(() { _isLoading = false; });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar datos: ${e.toString()}')),
      );
    }
  }

  String _formatDate(String? rawIsoDateString) { // Ahora espera String? ISO
    if (rawIsoDateString == null || rawIsoDateString.isEmpty) return 'No disponible';
    try {
      final date = DateTime.parse(rawIsoDateString); // Parsea el string ISO
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      print("Error formateando fecha '$rawIsoDateString': $e");
      return rawIsoDateString; // Fallback al string original si no se puede parsear
    }
  }

  // Sobrecarga o método diferente para formatear DateTime directamente si es necesario
  String _formatDateTime(DateTime? date) {
    if (date == null) return 'No disponible';
    try {
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      print("Error formateando DateTime: $e");
      return date.toIso8601String().split('T').first;
    }
  }


  Future<void> _downloadTemplate() async {
    print("StudentOwnProfileScreen: Descargando plantilla...");
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Funcionalidad de descarga no implementada.')),
    );
  }

  Future<void> _uploadSignedConsent() async {
    if (_studentData == null || _studentData!.userId == null || _studentData!.userId!.id.isEmpty) {
      print("StudentOwnProfileScreen: Error - ID de usuario no disponible para subir consentimiento.");
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error: No se pudo identificar al usuario.'), backgroundColor: Colors.red));
      return;
    }
    final String targetUserId = _studentData!.userId!.id;
    print("StudentOwnProfileScreen: Subiendo consentimiento para User ID: $targetUserId");

    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );
      if (!mounted || result == null || result.files.single.path == null) {
        print("StudentOwnProfileScreen: Selección de archivo cancelada o inválida.");
        return;
      }

      final path = result.files.single.path!;
      final file = File(path);
      
      final document = await DocumentService.uploadDocument(
        file, 
        targetUserId,
        documentType: 'CONSENTIMIENTO',
        description: 'Consentimiento firmado para ajustes razonables',
        category: 'CONSENTIMIENTO'
      );
      
      if (!mounted) return;
      
      if (document != null) {
        print("StudentOwnProfileScreen: Documento subido, recargando datos del perfil...");
        _loadStudentData(); 
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Documento subido correctamente.')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al subir documento')));
      }
    } catch (e,s) {
      if (!mounted) return;
      print("StudentOwnProfileScreen: Excepción al subir consentimiento: $e\nStacktrace: $s");
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al subir: ${e.toString()}')));
    }
  }

  void _viewSignedConsent() {
     print("StudentOwnProfileScreen: Viendo consentimiento...");
     ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Funcionalidad de ver consentimiento no implementada.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final padding = isMobile ? 16.0 : 24.0;

    if (_isLoading) {
      return Scaffold(appBar: AppBar(title: const Text('Mi Perfil')), body: const Center(child: CircularProgressIndicator()));
    }

    if (_studentData == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Mi Perfil')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('No se pudo cargar la información del perfil.'),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: _loadStudentData, child: const Text('Reintentar'))
            ],
          ),
        ),
      );
    }

    final bool hasConsent = _studentData!.consentimientoFirmado; // Derivado del modelo

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
                          const CircleAvatar(radius: 40, backgroundColor: Colors.blue, child: Icon(Icons.person, size: 40, color: Colors.white)),
                          const SizedBox(height: 12),
                          Text(
                            _studentData!.nombreCompleto, // Usa el getter del modelo Student
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                          Text(
                            _studentData!.email, // Email del Student
                            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    _infoRow('Rut:', _studentData!.rut),
                    _infoRow('Teléfono:', _studentData!.informacionContacto ?? _studentData!.telefono ?? 'No disponible'),
                    _infoRow('Carrera:', _studentData!.carreraNombre ?? 'No asignada'), // Usa getter
                    _infoRow('Año ingreso:', _studentData!.anioIngreso?.toString() ?? 'No disponible'),
                    _infoRow('Necesidades Educativas Especiales:', _studentData!.necesidadesEducativasEspeciales ?? 'Ninguna'),
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
                        const Text( // CORREGIDO: Añadido el texto
                          'Consentimiento Informado',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: hasConsent ? Colors.green : Colors.orange, borderRadius: BorderRadius.circular(12)),
                          child: Text(hasConsent ? 'Aprobado' : 'Pendiente', style: const TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text( // CORREGIDO: Añadido el texto
                      'El consentimiento informado es necesario para que podamos compartir información sobre tus necesidades específicas con docentes y unidades académicas relevantes.',
                      style: TextStyle(fontSize: 14),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        OutlinedButton.icon(icon: const Icon(Icons.download), label: const Text('Descargar plantilla'), onPressed: _downloadTemplate),
                        ElevatedButton.icon(icon: const Icon(Icons.upload_file), label: const Text('Subir firmado'), onPressed: hasConsent ? null : _uploadSignedConsent),
                      ],
                    ),
                    if (hasConsent) ...[
                      const SizedBox(height: 12),
                      Center(child: TextButton.icon(icon: const Icon(Icons.visibility), label: const Text('Ver documento firmado'), onPressed: _viewSignedConsent)),
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
                    const Row(children: [Icon(Icons.settings_accessibility, color: Colors.blue), SizedBox(width: 8), Text('Mis Ajustes Razonables', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))]),
                    const SizedBox(height: 12),
                    _adjustments.isEmpty
                        ? const Center(child: Padding(padding: EdgeInsets.all(16.0), child: Text('No tienes ajustes razonables asignados')))
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _adjustments.length,
                            itemBuilder: (context, index) {
                              final adjustment = _adjustments[index];
                              return ListTile(
                                title: Text(adjustment.tipo ?? 'N/A'), // Manejar posible nulidad
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(adjustment.descripcion ?? 'N/A'), // Manejar posible nulidad
                                    Text(
                                      // Asegurar que adjustment.approvedAt se maneje como String?
                                      'Aprobado: ${_formatDate(adjustment.approvedAt)}', 
                                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                    ),
                                  ],
                                ),
                                // Asegurar que adjustment.status no sea nulo para Text()
                                trailing: Chip(label: Text(adjustment.status ?? 'N/A'), backgroundColor: adjustment.isActive ? Colors.green[100] : Colors.grey[300]),
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
          SizedBox(width: 100, child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold))),
          Expanded(child: Text(value.isEmpty ? 'No disponible' : value)),
        ],
      ),
    );
  }
}