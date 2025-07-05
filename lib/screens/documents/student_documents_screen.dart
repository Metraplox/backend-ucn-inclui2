// Pantalla para visualizar y administrar documentos de estudiantes
// Parte del sistema INCLUI2 - UCN
// Implementación para el hito intermedio

import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/document_model.dart';
import 'package:incluye_app/services/document_service.dart';
import 'package:incluye_app/services/consent_service.dart';

// Widget principal para la pantalla de documentos
class StudentDocumentsScreen extends StatefulWidget {
  // Identificador del estudiante cuyos documentos se mostrarán
  final String studentId;

  // Constructor que requiere el id del estudiante
  const StudentDocumentsScreen({super.key, required this.studentId});

  @override
  State<StudentDocumentsScreen> createState() => _StudentDocumentsScreenState();
}

// Estado del widget que maneja la lógica y UI
class _StudentDocumentsScreenState extends State<StudentDocumentsScreen> {
  // Datos del estudiante
  Student? _studentData;

  // Lista de documentos del estudiante
  List<Document> _documents = [];

  // Indicador de carga
  bool _isLoading = true;

  // Estado de consentimiento
  bool _hasConsent = false;

  @override
  void initState() {
    super.initState();
    // Cargar datos al iniciar
    _loadData();
  }

  // Método para cargar datos del estudiante y sus documentos
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Obtener datos del estudiante
      final studentData = await StudentService.getStudentById(widget.studentId);

      // Verificar si el widget sigue montado antes de continuar
      if (!mounted) return;

      // Simular obtención de documentos (en una implementación real vendrían de la API)
      final List<Document> documents = [
        Document.fromSpanish(
          id: '1',
          nombre: 'Informe médico.pdf',
          tipo: 'Informe médico',
          fechaSubida: '2023-05-15',
          estado: 'Aprobado',
        ),
        Document.fromSpanish(
          id: '2',
          nombre: 'Consentimiento.pdf',
          tipo: 'Consentimiento',
          fechaSubida: '2023-05-10',
          estado: 'Aprobado',
        ),
        Document.fromSpanish(
          id: '3',
          nombre: 'Solicitud de ajuste.pdf',
          tipo: 'Solicitud',
          fechaSubida: '2023-06-01',
          estado: 'En revisión',
        ),
      ];

      setState(() {
        _studentData = studentData;
        _documents = documents;
        _hasConsent = studentData?.consentimientoFirmado ?? false;
        _isLoading = false;
      });
    } catch (e) {
      // Verificar si el widget sigue montado antes de manejar errores
      if (!mounted) return;

      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error al cargar datos: $e')));
    }
  }

  // Método para descargar plantilla de consentimiento
  Future<void> _downloadTemplate() async {
    try {
      await DocumentService.downloadConsentForm();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Iniciando descarga del formulario...'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al descargar: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Método para subir documento firmado
  Future<void> _uploadDocument() async {
    try {
      // Seleccionar archivo mediante FilePicker
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );

      // Verificar si el widget sigue montado antes de continuar
      if (!mounted) return;

      if (result != null && result.files.single.path != null) {
        // Obtener el PlatformFile
        final file = result.files.single;

        // Subir documento usando ApiService
        final document = await DocumentService.uploadDocument(
          file,
          widget.studentId,
          category: 'GENERAL',
          description: 'Documento subido por el estudiante',
        );

        // Verificar nuevamente si el widget sigue montado
        if (!mounted) return;

        if (document != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Documento subido correctamente')),
          );
          // Recargar datos
          _loadData();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Error al subir documento')),
          );
        }
      }
    } catch (e) {
      // Verificar si el widget sigue montado antes de mostrar error
      if (!mounted) return;

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  // Método para dar consentimiento (sólo para administradores)
  Future<void> _giveConsent() async {
    try {
      final success = await ConsentService.giveConsent(widget.studentId);

      // Verificar si el widget sigue montado después de la operación asíncrona
      if (!mounted) return;

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Consentimiento aprobado')),
        );
        setState(() {
          _hasConsent = true;
        });
        _loadData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error al aprobar consentimiento')),
        );
      }
    } catch (e) {
      // Verificar si el widget sigue montado antes de mostrar error
      if (!mounted) return;

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  // Método para ver documento
  void _viewDocument(Document document) {
    // En una implementación real, abriría el documento
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Visualizando documento: ${document.nombre}')),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Pantalla basada en el estado de carga
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _studentData != null
              ? 'Documentos: ${_studentData!.nombres} ${_studentData!.apellidos}'
              : 'Documentos del estudiante',
        ),
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _buildBody(),
      floatingActionButton: FloatingActionButton(
        onPressed: _uploadDocument,
        tooltip: 'Subir documento',
        child: const Icon(Icons.upload_file),
      ),
    );
  }

  // Construir el cuerpo principal de la pantalla
  Widget _buildBody() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tarjeta de información de consentimiento
          _buildConsentCard(),

          const SizedBox(height: 20),

          // Título de sección de documentos
          const Text(
            'Documentos disponibles',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 10),

          // Lista de documentos
          Expanded(
            child:
                _documents.isEmpty
                    ? const Center(child: Text('No hay documentos disponibles'))
                    : ListView.builder(
                      itemCount: _documents.length,
                      itemBuilder: (context, index) {
                        final document = _documents[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 8.0),
                          child: ListTile(
                            leading: Icon(
                              _getIconForDocumentType(document.tipo),
                              color: _getColorForStatus(document.estado),
                            ),
                            title: Text(document.nombre),
                            subtitle: Text(
                              'Tipo: ${document.tipo} - Estado: ${document.estado}\nSubido: ${document.fechaSubida}',
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.remove_red_eye),
                              onPressed: () => _viewDocument(document),
                            ),
                          ),
                        );
                      },
                    ),
          ),
        ],
      ),
    );
  }

  // Widget para la tarjeta de consentimiento
  Widget _buildConsentCard() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Estado del Consentimiento Informado',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(
                  _hasConsent ? Icons.check_circle : Icons.cancel,
                  color: _hasConsent ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 10),
                Text(
                  _hasConsent
                      ? 'Consentimiento Firmado y Aprobado'
                      : 'Consentimiento Pendiente',
                  style: const TextStyle(fontSize: 16),
                ),
              ],
            ),
            const SizedBox(height: 15),
            Text(
              _hasConsent
                  ? 'El estudiante ha autorizado el manejo de su información sensible.'
                  : 'Para continuar, el estudiante debe firmar el consentimiento informado y subirlo a la plataforma.',
              style: TextStyle(color: Colors.grey[700]),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                ElevatedButton.icon(
                  onPressed: _downloadTemplate,
                  icon: const Icon(Icons.download),
                  label: const Text('Descargar Plantilla'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                  ),
                ),
                if (!_hasConsent) // Solo mostrar si no hay consentimiento
                  ElevatedButton(
                    onPressed: _giveConsent,
                    child: const Text('Aprobar (Admin)'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Obtener ícono según el tipo de documento
  IconData _getIconForDocumentType(String type) {
    // Implementa la lógica para obtener un ícono según el tipo de documento
    // Puedes usar una estructura switch o una lista de íconos predefinidos
    // Aquí se usa un ejemplo simple con íconos predefinidos
    switch (type) {
      case 'Informe médico':
        return Icons.medical_services;
      case 'Consentimiento':
        return Icons.security;
      case 'Solicitud':
        return Icons.assignment;
      default:
        return Icons.description;
    }
  }

  // Obtener color según el estado del documento
  Color _getColorForStatus(String status) {
    // Implementa la lógica para obtener un color según el estado del documento
    // Puedes usar una estructura switch o una lista de colores predefinidos
    // Aquí se usa un ejemplo simple con colores predefinidos
    switch (status) {
      case 'Aprobado':
        return Colors.green;
      case 'En revisión':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }
}
