// Pantalla de perfil para el estudiante (vista propia)
// Esta pantalla permite al estudiante ver su perfil y gestionar su documento de consentimiento

import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/adjustment_model.dart';

// Widget principal para el perfil del estudiante (vista personal)
class StudentOwnProfileScreen extends StatefulWidget {
  // Id del estudiante que está viendo su propio perfil
  final String studentId;
  
  const StudentOwnProfileScreen({super.key, required this.studentId});
  
  @override
  State<StudentOwnProfileScreen> createState() =>
      _StudentOwnProfileScreenState();
}

// Estado del widget para manejar datos y UI
class _StudentOwnProfileScreenState extends State<StudentOwnProfileScreen> {
  // Datos del perfil del estudiante
  Student? _studentData;

  // Indicador de carga
  bool _isLoading = true;

  // Estado de consentimiento
  bool _hasConsent = false;

  // Lista de ajustes razonables del estudiante
  List<Adjustment> _adjustments = [];

  @override
  void initState() {
    super.initState();
    // Cargar datos al inicializar
    _loadStudentData();
  }

  // Método para cargar los datos del estudiante
  Future<void> _loadStudentData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Usar el nuevo endpoint de perfil para obtener los datos del estudiante
      final data = await ApiService.getStudentProfile();
      
      // Si no se encuentra el perfil del estudiante, intentar con el método anterior
      if (data == null) {
        final fallbackData = await ApiService.getStudentById(widget.studentId);
        if (fallbackData == null) {
          throw Exception('No se pudo obtener el perfil del estudiante');
        }
        
        // Verificar si el widget sigue montado antes de actualizar el estado
        if (!mounted) return;
        
        setState(() {
          _studentData = fallbackData;
          _hasConsent = fallbackData.consentimientoFirmado;
          _isLoading = false;
        });
        return;
      }
      
      // Obtener los ajustes razonables del estudiante (en una implementación real vendrían de la API)
      List<Adjustment> adjustments = [
        Adjustment(
          id: '1',
          tipo: 'Tiempo extra en exámenes',
          descripcion: '30 minutos adicionales en evaluaciones',
          status: 'ACTIVO',
          approvedAt: '2025-04-10',
        ),
        Adjustment(
          id: '2',
          tipo: 'Material en formato accesible',
          descripcion: 'Textos en formato digital accesible',
          status: 'ACTIVO',
          approvedAt: '2025-04-12',
        ),
      ];
      
      // Verificar si el widget sigue montado antes de actualizar el estado
      if (!mounted) return;
      
      setState(() {
        _studentData = data;
        _adjustments = adjustments;
        _hasConsent = data.consentimientoFirmado;
        _isLoading = false;
      });
    } catch (e) {
      // Verificar si el widget sigue montado antes de actualizar el estado
      if (!mounted) return;
      
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar datos: $e')),
      );
    }
  }

  // Método para formatear fechas (usado en la vista de ajustes)
  String _formatDate(String? rawDate) {
    if (rawDate == null) return 'No disponible';
    return rawDate.split('T').first;
  }

  // Método para descargar la plantilla de consentimiento
  Future<void> _downloadTemplate() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Descargando plantilla de consentimiento...'),
      ),
    );
    // Aquí iría la lógica real para descargar la plantilla
  }

  // Método para subir documento de consentimiento firmado
  Future<void> _uploadSignedConsent() async {
    try {
      // Abrir selector de archivos
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );

      // Verificar si el widget sigue montado después de la operación asíncrona
      if (!mounted) return;

      if (result != null && result.files.single.path != null) {
        // Obtener ruta del archivo seleccionado
        final path = result.files.single.path!;
        final file = File(path);
        
        // Subir documento usando ApiService
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
          setState(() {
            _hasConsent = true;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Documento subido correctamente. Pendiente de aprobación.')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Error al subir documento')),
          );
        }
      }
    } catch (e) {
      // Verificar si el widget sigue montado
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  // Método para ver documento de consentimiento
  void _viewSignedConsent() {
    // En una implementación real, abriría el visor de documentos
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Visualizando documento de consentimiento...'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Determinar si estamos en dispositivo móvil para ajustar la UI
    final isMobile = MediaQuery.of(context).size.width < 600;
    final padding = isMobile ? 16.0 : 24.0;

    return Scaffold(
      appBar: AppBar(title: const Text('Mi Perfil')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Información personal
                    Card(
                      child: Padding(
                        padding: EdgeInsets.all(padding),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Encabezado con nombre
                            Center(
                              child: Column(
                                children: [
                                  // Avatar del usuario
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
                                  // Nombre completo
                                  Text(
                                    '${_studentData?.nombres ?? ''} ${_studentData?.apellidos ?? ''}',
                                    style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  // Correo electrónico
                                  Text(
                                    _studentData?.email ?? '',
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Información personal
                            _infoRow('Rut:', _studentData?.rut ?? ''),
                            _infoRow(
                              'Teléfono:',
                              _studentData?.telefono ?? '',
                            ),
                            _infoRow(
                              'Carrera:',
                              _studentData?.carrera ?? '',
                            ),
                            _infoRow(
                              'Año ingreso:',
                              _studentData?.anioIngreso?.toString() ?? '',
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Sección de consentimiento
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
                                ),
                                const Spacer(),
                                // Estado del consentimiento
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        _hasConsent
                                            ? Colors.green
                                            : Colors.orange,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    _hasConsent ? 'Aprobado' : 'Pendiente',
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'El consentimiento informado es necesario para que podamos compartir información sobre tus necesidades específicas con docentes y unidades académicas relevantes.',
                              style: TextStyle(fontSize: 14),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                // Botón para descargar plantilla
                                OutlinedButton.icon(
                                  icon: const Icon(Icons.download),
                                  label: const Text('Descargar plantilla'),
                                  onPressed: _downloadTemplate,
                                ),
                                // Botón para subir consentimiento firmado
                                ElevatedButton.icon(
                                  icon: const Icon(Icons.upload_file),
                                  label: const Text('Subir firmado'),
                                  onPressed: _uploadSignedConsent,
                                ),
                              ],
                            ),
                            if (_hasConsent) ...[
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

                    // Sección de ajustes razonables
                    Card(
                      child: Padding(
                        padding: EdgeInsets.all(padding),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(
                                  Icons.settings_accessibility,
                                  color: Colors.blue,
                                ),
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
                                  itemCount: _adjustments.length,
                                  itemBuilder: (context, index) {
                                    final adjustment = _adjustments[index];
                                    // Lista de ajustes razonables con fecha formateada
                                    return ListTile(
                                      title: Text(adjustment.tipo),
                                      subtitle: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(adjustment.descripcion),
                                          // Usar el método _formatDate para mostrar la fecha formateada
                                          Text(
                                            'Aprobado: ${_formatDate(adjustment.fechaAprobacion)}',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[600],
                                            ),
                                          ),
                                        ],
                                      ),
                                      trailing: Chip(
                                        label: Text(adjustment.estado),
                                        backgroundColor:
                                            adjustment.isActive
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

  // Widget auxiliar para mostrar una fila de información
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
