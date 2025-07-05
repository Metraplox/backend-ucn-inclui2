import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:incluye_app/services/document_service.dart';

class ResourceUploaderScreen extends StatefulWidget {
  const ResourceUploaderScreen({super.key});

  @override
  State<ResourceUploaderScreen> createState() => _ResourceUploaderScreenState();
}

class _ResourceUploaderScreenState extends State<ResourceUploaderScreen> {
  PlatformFile? _selectedFile;
  final _descriptionController = TextEditingController();
  final _studentIdController = TextEditingController();
  final String _selectedCategory = 'Discapacidad';
  bool _isLoading = false;
  double _uploadProgress = 0.0;

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null) {
      setState(() {
        _selectedFile = result.files.first;
      });
    }
  }

  Future<void> _uploadFile() async {
    if (_selectedFile == null || _studentIdController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Por favor, seleccione un archivo e ingrese el ID del estudiante.',
          ),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _uploadProgress = 0.0;
    });

    try {
      final document = await DocumentService.uploadDocument(
        _selectedFile!,
        _studentIdController.text,
        description: _descriptionController.text,
        category: _selectedCategory,
        onSendProgress: (sent, total) {
          if (mounted) {
            setState(() {
              _uploadProgress = sent / total;
            });
          }
        },
      );

      if (!mounted) return;

      if (document != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Recurso subido con éxito')),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error al subir el recurso')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Subir Recurso')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _studentIdController,
              decoration: const InputDecoration(labelText: 'Student ID'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Descripción (opcional)',
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _pickFile,
                  icon: const Icon(Icons.attach_file),
                  label: const Text('Seleccionar Archivo'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _selectedFile?.name ?? 'Ningún archivo seleccionado',
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              LinearProgressIndicator(value: _uploadProgress)
            else
              ElevatedButton(
                onPressed: _uploadFile,
                child: const Text('Subir'),
              ),
          ],
        ),
      ),
    );
  }
}
