// Pantalla para visualizar y administrar documentos de estudiantes
// Parte del sistema INCLUI2 - UCN
// Implementación para el hito intermedio

import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/models/document_model.dart';
import 'package:incluye_app/services/document_service.dart';
import 'package:incluye_app/services/consent_service.dart';
import 'package:incluye_app/services/api_service.dart';

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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar datos: $e')),
      );
    }
  }

  // Método para descargar plantilla de consentimiento
  Future<void> _downloadTemplate() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Descargando plantilla de consentimiento...')),
    );
    // Aquí iría la lógica real para descargar plantilla
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
        // Obtener ruta del archivo seleccionado
        final path = result.files.single.path!;
        final file = File(path);
        
        // Subir documento usando ApiService
        final document = await DocumentService.uploadDocument(
          file, 
          widget.studentId,
          documentType: 'GENERAL',
          description: 'Documento subido por el estudiante'
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
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
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
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
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
        title: Text(_studentData != null 
          ? 'Documentos: ${_studentData!.nombres} ${_studentData!.apellidos}' 
          : 'Documentos del estudiante'),
      ),
      body: _isLoading 
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
            child: _documents.isEmpty
              ? const Center(child: Text('No hay documentos disponibles'))
              : ListView.builder(
                  itemCount: _documents.length,
                  itemBuilder: (context, index) {
                    final doc = _documents[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        leading: const Icon(Icons.description),
                        title: Text(doc.nombre),
                        subtitle: Text('Subido: ${doc.fechaSubida}'),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Chip de estado
                            Chip(
                              label: Text(doc.estado),
                              backgroundColor: doc.estado == 'Aprobado' 
                                ? Colors.green[100] 
                                : Colors.orange[100],
                            ),
                            // Botón para ver documento
                            IconButton(
                              icon: const Icon(Icons.visibility),
                              onPressed: () => _viewDocument(doc),
                            ),
                          ],
                        ),
                        onTap: () => _viewDocument(doc),
                      ),
                    );
                  },
                ),
          ),
        ],
      ),
    );
  }

  // Construir tarjeta de consentimiento
  Widget _buildConsentCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.security, color: Colors.blue),
                const SizedBox(width: 8),
                // Título con nombre del estudiante
                Text(
                  'Documentos de ${_studentData?.nombres ?? ''} ${_studentData?.apellidos ?? ''}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                // Indicador de estado de consentimiento
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _hasConsent ? Colors.green : Colors.orange,
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
              'El consentimiento informado es un documento requerido para poder compartir información con docentes y otras unidades académicas.',
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
                
                // Botón para administradores (aprobar consentimiento)
                FutureBuilder<bool>(
                  future: StudentService.isAdmin(),
                  builder: (context, snapshot) {
                    final isAdmin = snapshot.data ?? false;
                    return isAdmin && !_hasConsent
                      ? ElevatedButton.icon(
                          icon: const Icon(Icons.check_circle),
                          label: const Text('Aprobar consentimiento'),
                          onPressed: _giveConsent,
                        )
                      : const SizedBox.shrink();
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
