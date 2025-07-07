import 'package:flutter/material.dart';
import 'package:incluye_app/services/document_consent_service.dart';
import 'package:file_picker/file_picker.dart';

class DocumentConsentScreen extends StatefulWidget {
  final String studentId;
  final String studentName;

  const DocumentConsentScreen({
    super.key,
    required this.studentId,
    required this.studentName,
  });

  @override
  State<DocumentConsentScreen> createState() => _DocumentConsentScreenState();
}

class _DocumentConsentScreenState extends State<DocumentConsentScreen> with TickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _documents = [];
  Map<String, dynamic>? _consentData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        DocumentService.getStudentDocuments(widget.studentId),
        ConsentService.getStudentConsent(widget.studentId),
      ]);
      
      setState(() {
        _documents = results[0] as List<dynamic>;
        _consentData = results[1] as Map<String, dynamic>?;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar datos: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Documentos - ${widget.studentName}'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.folder), text: 'Documentos'),
            Tab(icon: Icon(Icons.assignment), text: 'Consentimientos'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildDocumentsTab(),
                _buildConsentTab(),
              ],
            ),
    );
  }

  Widget _buildDocumentsTab() {
    return Column(
      children: [
        Card(
          margin: const EdgeInsets.all(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Icon(Icons.upload_file, color: Colors.blue),
                const SizedBox(width: 8),
                const Text('Subir Documento', style: TextStyle(fontWeight: FontWeight.bold)),
                const Spacer(),
                ElevatedButton(
                  onPressed: _uploadDocument,
                  child: const Text('Subir'),
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: _documents.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.folder_open, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No hay documentos'),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView.builder(
                    itemCount: _documents.length,
                    itemBuilder: (context, index) {
                      final doc = _documents[index];
                      return _buildDocumentCard(doc);
                    },
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildDocumentCard(Map<String, dynamic> doc) {
    final displayInfo = DocumentService.getDocumentDisplayInfo(doc);
    final typeName = displayInfo['typeName']!;
    final fileName = displayInfo['fileName']!;
    final categoryName = displayInfo['categoryName']!;
    final uploadDate = _formatDate(displayInfo['uploadDate']);
    final uploaderName = displayInfo['uploaderName']!;
    final description = displayInfo['description']!;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.blue,
          child: Icon(_getDocumentIcon(doc['documentType']), color: Colors.white),
        ),
        title: Text(typeName, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('📁 $fileName'),
            Text('🏷️ $categoryName'),
            Text('📅 Subido: $uploadDate'),
            Text('👤 Por: $uploaderName'),
            if (description.isNotEmpty) Text('📝 $description'),
          ],
        ),
        isThreeLine: true,
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'download',
              child: const Row(
                children: [
                  Icon(Icons.download, color: Colors.green),
                  SizedBox(width: 8),
                  Text('Descargar')
                ],
              ),
            ),
            PopupMenuItem(
              value: 'delete',
              child: const Row(
                children: [
                  Icon(Icons.delete, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Eliminar')
                ],
              ),
            ),
          ],
          onSelected: (value) {
            if (value == 'download') {
              _downloadDocument(doc['_id'] ?? doc['id']);
            } else if (value == 'delete') {
              _confirmDeleteDocument(doc);
            }
          },
        ),
      ),
    );
  }

  Widget _buildConsentTab() {
    if (_consentData == null) {
      return const Center(child: Text('No se pudo cargar la información de consentimiento'));
    }

    final allowsDataSharing = _consentData!['allowsDataSharing'] ?? false;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Estado del Consentimiento',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(
                        allowsDataSharing ? Icons.check_circle : Icons.cancel,
                        color: allowsDataSharing ? Colors.green : Colors.red,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        allowsDataSharing
                            ? 'Autorizado para compartir datos'
                            : 'No autorizado para compartir datos',
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    allowsDataSharing 
                        ? 'Los coordinadores y educadores pueden acceder a la información del estudiante para brindar mejor apoyo académico.'
                        : 'Los datos del estudiante no serán compartidos con coordinadores y educadores.',
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _downloadConsentForm(),
                  icon: const Icon(Icons.download),
                  label: const Text('Descargar Formulario'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _uploadSignedConsent(),
                  icon: const Icon(Icons.upload),
                  label: const Text('Subir Firmado'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _editConsent(),
            icon: const Icon(Icons.edit),
            label: const Text('Editar Configuración'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getDocumentIcon(String? type) {
    switch (type) {
      case 'CERTIFICADO_MEDICO':
        return Icons.medical_services;
      case 'INFORME_PSICOEDUCATIVO':
        return Icons.psychology;
      case 'CERTIFICADO_DISCAPACIDAD':
        return Icons.accessibility;
      case 'INFORME_MEDICO_ESPECIALISTA':
        return Icons.local_hospital;
      case 'EVALUACION_DIFERENCIAL':
        return Icons.assessment;
      case 'PLAN_EDUCATIVO_INDIVIDUALIZADO':
        return Icons.school;
      case 'EVALUACION_PSICOPEDAGOGICA':
        return Icons.psychology_alt;
      case 'INFORME_FONOAUDIOLOGICO':
        return Icons.hearing;
      case 'OTRO_DOCUMENTO':
        return Icons.description;
      default:
        return Icons.description;
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return 'N/A';
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'N/A';
    }
  }

  Future<void> _uploadDocument() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: DocumentService.getAllowedExtensions(),
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        
        // Validar tamaño del archivo
        if (!DocumentService.isValidFileSize(file.bytes!)) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('El archivo es demasiado grande. Máximo ${DocumentService.getMaxFileSize() ~/ (1024 * 1024)} MB'),
                backgroundColor: Colors.red,
              ),
            );
          }
          return;
        }
        
        // Validar extensión
        if (!DocumentService.isAllowedExtension(file.name)) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Tipo de archivo no permitido. Extensiones válidas: ${DocumentService.getAllowedExtensions().join(', ')}'),
                backgroundColor: Colors.red,
              ),
            );
          }
          return;
        }
        
        final docDetails = await _selectDocumentDetails();
        
        if (docDetails != null) {
          // Usar el método para staff ya que estamos en la vista de gestión de documentos
          await DocumentService.uploadDocumentByStaff(
            studentId: widget.studentId,
            documentType: docDetails['type']!,
            fileName: file.name,
            fileBytes: file.bytes!,
            description: docDetails['description'],
            category: docDetails['category'],
          );
          
          _loadData();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Documento subido exitosamente'),
                backgroundColor: Colors.green,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al subir documento: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<Map<String, String>?> _selectDocumentDetails() async {
    String? selectedType;
    String? selectedCategory;
    final descriptionController = TextEditingController();

    return showDialog<Map<String, String>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Detalles del Documento'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Tipo de Documento *', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: selectedType,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Seleccionar tipo',
                  ),
                  items: DocumentService.getDocumentTypes()
                      .map((type) => DropdownMenuItem(
                            value: type,
                            child: Text(DocumentService.getDocumentTypeName(type)),
                          ))
                      .toList(),
                  onChanged: (value) => setState(() => selectedType = value),
                ),
                const SizedBox(height: 16),
                const Text('Categoría', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: selectedCategory,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Seleccionar categoría',
                  ),
                  items: DocumentService.getDocumentCategories()
                      .map((category) => DropdownMenuItem(
                            value: category,
                            child: Text(DocumentService.getCategoryName(category)),
                          ))
                      .toList(),
                  onChanged: (value) => setState(() => selectedCategory = value),
                ),
                const SizedBox(height: 16),
                const Text('Descripción', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Descripción del documento (opcional)',
                  ),
                  maxLines: 3,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: selectedType != null
                  ? () {
                      Navigator.pop(context, {
                        'type': selectedType!,
                        'category': selectedCategory ?? 'OTRO',
                        'description': descriptionController.text.trim(),
                      });
                    }
                  : null,
              child: const Text('Subir'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _downloadDocument(String documentId) async {
    try {
      // Mostrar indicador de carga
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(),
              SizedBox(width: 16),
              Text('Descargando documento...'),
            ],
          ),
        ),
      );

      final bytes = await DocumentService.downloadDocument(documentId);
      
      // Cerrar el indicador de carga
      if (mounted) Navigator.pop(context);

      // En Flutter Web, podemos forzar la descarga del archivo
      if (mounted) {
        // Aquí puedes implementar la lógica específica para guardar el archivo
        // Por ahora, solo mostramos el mensaje de éxito
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Documento descargado exitosamente (${bytes.length} bytes)'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      // Cerrar el indicador de carga si está abierto
      if (mounted && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al descargar documento: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _confirmDeleteDocument(Map<String, dynamic> doc) {
    final fileName = doc['fileName'] ?? 'documento';
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar Eliminación'),
        content: Text('¿Estás seguro de que deseas eliminar el documento "$fileName"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                final docId = doc['_id'] ?? doc['id'];
                await DocumentService.deleteDocument(docId);
                _loadData();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Documento eliminado exitosamente'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Error al eliminar documento: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Eliminar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _downloadConsentForm() async {
    try {
      await ConsentService.downloadConsentForm(widget.studentId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Formulario de consentimiento descargado')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al descargar formulario: $e')),
        );
      }
    }
  }

  Future<void> _uploadSignedConsent() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.first;
        await ConsentService.uploadSignedConsent(
          studentId: widget.studentId,
          fileBytes: file.bytes!,
          fileName: file.name,
        );
        
        _loadData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Consentimiento firmado subido exitosamente')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al subir consentimiento: $e')),
        );
      }
    }
  }

  void _editConsent() {
    showDialog(
      context: context,
      builder: (context) => _ConsentEditDialog(
        initialAllowsDataSharing: _consentData?['allowsDataSharing'] ?? false,
        onSave: (allowsDataSharing) async {
          try {
            await ConsentService.updateConsent(
              studentId: widget.studentId,
              allowsDataSharing: allowsDataSharing,
            );
            _loadData();
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Configuración de consentimiento actualizada')),
              );
            }
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error al actualizar configuración: $e')),
              );
            }
          }
        },
      ),
    );
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}

class _ConsentEditDialog extends StatefulWidget {
  final bool initialAllowsDataSharing;
  final Function(bool) onSave;

  const _ConsentEditDialog({
    required this.initialAllowsDataSharing,
    required this.onSave,
  });

  @override
  State<_ConsentEditDialog> createState() => _ConsentEditDialogState();
}

class _ConsentEditDialogState extends State<_ConsentEditDialog> {
  late bool _allowsDataSharing;

  @override
  void initState() {
    super.initState();
    _allowsDataSharing = widget.initialAllowsDataSharing;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Editar Configuración de Consentimiento'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SwitchListTile(
              title: const Text('Permitir compartir datos'),
              subtitle: const Text('Autoriza el compartir información académica y documentos'),
              value: _allowsDataSharing,
              onChanged: (value) {
                setState(() {
                  _allowsDataSharing = value;
                });
              },
            ),
            const SizedBox(height: 16),
            const Text(
              'Al autorizar el consentimiento, permite que coordinadores y educadores accedan a información relevante para brindar mejor apoyo académico.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: () {
            widget.onSave(_allowsDataSharing);
            Navigator.pop(context);
          },
          child: const Text('Guardar'),
        ),
      ],
    );
  }
}
