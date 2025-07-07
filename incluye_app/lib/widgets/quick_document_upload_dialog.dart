import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:incluye_app/services/document_consent_service.dart';

class QuickDocumentUploadDialog extends StatefulWidget {
  final String studentId;
  final String studentName;

  const QuickDocumentUploadDialog({
    super.key,
    required this.studentId,
    required this.studentName,
  });

  @override
  State<QuickDocumentUploadDialog> createState() => _QuickDocumentUploadDialogState();
}

class _QuickDocumentUploadDialogState extends State<QuickDocumentUploadDialog> {
  String? selectedType;
  String? selectedCategory;
  final descriptionController = TextEditingController();
  bool isUploading = false;

  @override
  void dispose() {
    descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Subir Documento - ${widget.studentName}'),
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
              onChanged: isUploading ? null : (value) => setState(() => selectedType = value),
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
              onChanged: isUploading ? null : (value) => setState(() => selectedCategory = value),
            ),
            const SizedBox(height: 16),
            const Text('Descripción', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: descriptionController,
              enabled: !isUploading,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Descripción del documento (opcional)',
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Formatos permitidos:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(DocumentService.getAllowedExtensions().join(', ')),
                  const SizedBox(height: 8),
                  Text(
                    'Tamaño máximo: ${DocumentService.getMaxFileSize() ~/ (1024 * 1024)} MB',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            if (isUploading) ...[
              const SizedBox(height: 16),
              const Row(
                children: [
                  CircularProgressIndicator(),
                  SizedBox(width: 16),
                  Text('Subiendo documento...'),
                ],
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: isUploading ? null : () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: isUploading || selectedType == null ? null : _uploadDocument,
          child: const Text('Seleccionar Archivo y Subir'),
        ),
      ],
    );
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

        setState(() => isUploading = true);

        await DocumentService.uploadDocumentByStaff(
          studentId: widget.studentId,
          documentType: selectedType!,
          fileName: file.name,
          fileBytes: file.bytes!,
          description: descriptionController.text.trim(),
          category: selectedCategory ?? 'OTRO',
        );

        if (mounted) {
          Navigator.pop(context, true); // Return success
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Documento subido exitosamente'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      setState(() => isUploading = false);
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
}
