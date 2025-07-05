import 'package:flutter/material.dart';
import 'package:incluye_app/models/document_model.dart';
import 'package:incluye_app/services/document_service.dart';
import 'package:incluye_app/widgets/pending_card.dart';
import 'dart:io';
import 'package:incluye_app/services/api_service.dart';
import 'dart:convert';

class PendingListScreen extends StatefulWidget {
  const PendingListScreen({super.key, this.useSSE = true, this.getDocs});
  final bool useSSE;
  final Future<List<Document>> Function()? getDocs;

  @override
  State<PendingListScreen> createState() => _PendingListScreenState();
}

class _PendingListScreenState extends State<PendingListScreen> {
  bool _isLoading = true;
  List<Document> _pendingDocs = [];
  String? _error;
  HttpClient? _httpClient;

  @override
  void initState() {
    super.initState();
    if (widget.useSSE) {
      _listenPendingStream();
    }
    _loadPendingDocs();
  }

  Future<void> _listenPendingStream() async {
    try {
      final token = await ApiService.getToken();
      if (token == null) return;
      _httpClient = HttpClient();
      final uri = Uri.parse(
        '${ApiService.dio.options.baseUrl}/documents/pending-stream',
      );
      final request = await _httpClient!.getUrl(uri);
      request.headers.set(HttpHeaders.acceptHeader, 'text/event-stream');
      request.headers.set('Authorization', 'Bearer $token');
      final response = await request.close();
      await for (var line in response
          .transform(utf8.decoder)
          .transform(const LineSplitter())) {
        if (line.startsWith('data:')) {
          final jsonStr = line.substring(5).trim();
          final List<dynamic> dataList = jsonDecode(jsonStr);
          final docs =
              dataList
                  .map(
                    (json) => Document.fromJson(json as Map<String, dynamic>),
                  )
                  .toList();
          if (mounted) {
            setState(() {
              _pendingDocs = docs;
            });
          }
        }
      }
    } catch (_) {
      // Fallback polling en _loadPendingDocs
    }
  }

  Future<void> _loadPendingDocs() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final docs =
          await (widget.getDocs != null
              ? widget.getDocs!()
              : DocumentService.getPendingDocuments());
      if (!mounted) return;
      setState(() {
        _pendingDocs = docs;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _approveDoc(String id) async {
    final result = await DocumentService.verifyDocument(id);
    if (!mounted) return;
    if (result != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Documento aprobado'),
          backgroundColor: Colors.green,
        ),
      );
      _loadPendingDocs();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Error al aprobar'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _rejectDoc(String id) async {
    final comments = await showDialog<String>(
      context: context,
      builder:
          (ctx) => AlertDialog(
            title: const Text('Rechazar documento'),
            content: TextField(
              decoration: const InputDecoration(
                labelText: 'Comentarios (opcional)',
              ),
              onChanged: (v) {},
              controller: TextEditingController(),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancelar'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(ctx, ''),
                child: const Text('Rechazar'),
              ),
            ],
          ),
    );
    if (comments != null) {
      final result = await DocumentService.rejectDocument(
        id,
        comments: comments,
      );
      if (!mounted) return;
      if (result != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Documento rechazado'),
            backgroundColor: Colors.orange,
          ),
        );
        _loadPendingDocs();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al rechazar'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recursos Pendientes')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Error: $_error'),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: _loadPendingDocs,
                      child: const Text('Reintentar'),
                    ),
                  ],
                ),
              )
              : _pendingDocs.isEmpty
              ? const Center(child: Text('No hay documentos pendientes'))
              : RefreshIndicator(
                onRefresh: _loadPendingDocs,
                child: ListView.builder(
                  itemCount: _pendingDocs.length,
                  itemBuilder: (ctx, i) {
                    final doc = _pendingDocs[i];
                    return PendingCard(
                      document: doc,
                      onApprove: () => _approveDoc(doc.id!),
                      onReject: () => _rejectDoc(doc.id!),
                    );
                  },
                ),
              ),
    );
  }

  @override
  void dispose() {
    _httpClient?.close(force: true);
    super.dispose();
  }
}
