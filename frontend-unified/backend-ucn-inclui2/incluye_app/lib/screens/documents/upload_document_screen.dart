import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:incluye_app/utils/responsive_utils.dart';
import 'package:incluye_app/services/document_service.dart';

class UploadDocumentScreen extends StatefulWidget {
  final String? studentId;
  final String? documentType;

  const UploadDocumentScreen({super.key, this.studentId, this.documentType});

  @override
  UploadDocumentScreenState createState() => UploadDocumentScreenState();
}

class UploadDocumentScreenState extends State<UploadDocumentScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedDocumentType;
  PlatformFile? _selectedFile;
  final _descriptionController = TextEditingController();
  bool _isUploading = false;

  final List<String> _documentTypes = [
    'Consentimiento Informado',
    'Certificado Médico',
    'Informe Académico',
    'Solicitud de Ajuste',
    'Otro',
  ];

  @override
  Widget build(BuildContext context) {
    final padding = ResponsiveUtils.getPadding(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Subir Documento')),
      body: Padding(
        padding: EdgeInsets.all(padding),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Tipo de documento
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Tipo de Documento',
                  border: OutlineInputBorder(),
                ),
                value: _selectedDocumentType,
                items:
                    _documentTypes.map((String type) {
                      return DropdownMenuItem<String>(
                        value: type,
                        child: Text(type),
                      );
                    }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _selectedDocumentType = newValue;
                  });
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor seleccione un tipo de documento';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Selección de archivo
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Archivo Seleccionado',
                        border: OutlineInputBorder(),
                        hintText: 'Ningún archivo seleccionado',
                      ),
                      readOnly: true,
                      controller: TextEditingController(
                        text: _selectedFile?.name,
                      ),
                      validator: (value) {
                        if (_selectedFile == null) {
                          return 'Por favor seleccione un archivo';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.attach_file),
                    label: const Text('Seleccionar'),
                    onPressed: _pickFile,
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Notas o descripción
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Notas o Descripción (opcional)',
                  border: OutlineInputBorder(),
                  hintText: 'Añada información adicional sobre el documento',
                ),
                maxLines: 3,
              ),

              const SizedBox(height: 24),

              // Botones de acción
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: const Text('Cancelar'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    icon:
                        _isUploading
                            ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                            : const Icon(Icons.upload),
                    label: Text(
                      _isUploading ? 'Subiendo...' : 'Subir Documento',
                    ),
                    onPressed: _isUploading ? null : _submitForm,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    );

    if (result != null) {
      setState(() {
        _selectedFile = result.files.single;
      });
    }
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isUploading = true;
      });

      try {
        if (widget.studentId == null) {
          throw Exception('No se ha especificado un ID de estudiante.');
        }

        await DocumentService.uploadDocument(
          _selectedFile!,
          widget.studentId!,
          category: _selectedDocumentType!,
          description: _descriptionController.text,
        );

        if (!mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Documento subido correctamente'),
            backgroundColor: Colors.green,
          ),
        );

        Navigator.of(context).pop();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al subir el documento: $e'),
            backgroundColor: Colors.red,
          ),
        );
      } finally {
        if (mounted) {
          setState(() {
            _isUploading = false;
          });
        }
      }
    }
  }
}
