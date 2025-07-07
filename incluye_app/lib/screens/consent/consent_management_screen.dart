import 'package:flutter/material.dart';
import 'package:incluye_app/services/consent_service.dart';
import 'package:incluye_app/widgets/app_scaffold.dart';

class ConsentManagementScreen extends StatefulWidget {
  const ConsentManagementScreen({super.key});

  @override
  State<ConsentManagementScreen> createState() => _ConsentManagementScreenState();
}

class _ConsentManagementScreenState extends State<ConsentManagementScreen> {
  Map<String, dynamic>? _consentData;
  bool _isLoading = true;
  bool _allowsDataSharing = false;
  final TextEditingController _commentsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadConsentData();
  }

  @override
  void dispose() {
    _commentsController.dispose();
    super.dispose();
  }

  Future<void> _loadConsentData() async {
    setState(() => _isLoading = true);
    
    try {
      final consent = await ConsentService.getMyConsent();
      setState(() {
        _consentData = consent;
        _allowsDataSharing = consent?['allowsDataSharing'] ?? false;
        _commentsController.text = consent?['comments'] ?? '';
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar consentimiento: $e')),
        );
      }
    }
  }

  Future<void> _updateConsent() async {
    if (_isLoading) return;

    setState(() => _isLoading = true);

    try {
      final result = await ConsentService.createOrUpdateConsent(
        allowsDataSharing: _allowsDataSharing,
        comments: _commentsController.text.trim().isEmpty 
            ? null 
            : _commentsController.text.trim(),
      );

      if (result != null) {
        setState(() {
          _consentData = result;
          _isLoading = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Consentimiento ${_consentData == null ? 'creado' : 'actualizado'} exitosamente'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        throw Exception('No se pudo actualizar el consentimiento');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al actualizar consentimiento: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _revokeConsent() async {
    final reason = await _showRevokeDialog();
    if (reason == null) return;

    setState(() => _isLoading = true);

    try {
      final success = await ConsentService.revokeConsent(reason: reason);
      
      if (success) {
        await _loadConsentData(); // Recargar datos
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Consentimiento revocado exitosamente'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } else {
        throw Exception('No se pudo revocar el consentimiento');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al revocar consentimiento: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<String?> _showRevokeDialog() async {
    final TextEditingController reasonController = TextEditingController();
    
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Revocar Consentimiento'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('¿Estás seguro de que deseas revocar tu consentimiento?'),
            const SizedBox(height: 16),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Motivo (opcional)',
                hintText: 'Explica por qué revocas el consentimiento',
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, reasonController.text.trim()),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Revocar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Gestión de Consentimiento',
      isStudent: true,
      isTeacher: false,
      isAdmin: false,
      isHead: false,
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoCard(),
                  const SizedBox(height: 20),
                  _buildConsentCard(),
                  const SizedBox(height: 20),
                  _buildCommentsCard(),
                  const SizedBox(height: 20),
                  _buildActionsCard(),
                  if (_consentData != null) ...[
                    const SizedBox(height: 20),
                    _buildStatusCard(),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _buildInfoCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.info, color: Colors.blue),
                SizedBox(width: 8),
                Text('¿Qué es el consentimiento?', 
                     style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              'El consentimiento te permite autorizar o denegar el acceso a tu información académica y diagnóstico por parte de docentes y personal autorizado.',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Con consentimiento:', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text('• Docentes pueden ver tu diagnóstico y ajustes'),
                  Text('• Coordinadoras pueden acceder a toda tu información'),
                  Text('• Recibes mejor apoyo académico personalizado'),
                  SizedBox(height: 8),
                  Text('Sin consentimiento:', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text('• Solo personal autorizado ve información básica'),
                  Text('• Tu privacidad está más protegida'),
                  Text('• Puedes cambiar tu decisión en cualquier momento'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConsentCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Autorización para Compartir Información',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Autorizar compartir mi información'),
              subtitle: Text(
                _allowsDataSharing 
                    ? 'Autorizas que docentes y personal accedan a tu información'
                    : 'No autorizas compartir tu información con terceros',
              ),
              value: _allowsDataSharing,
              onChanged: (value) {
                setState(() => _allowsDataSharing = value);
              },
              activeColor: Colors.green,
              secondary: Icon(
                _allowsDataSharing ? Icons.share : Icons.block,
                color: _allowsDataSharing ? Colors.green : Colors.red,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCommentsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Comentarios Adicionales',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _commentsController,
              maxLines: 4,
              maxLength: 500,
              decoration: const InputDecoration(
                hintText: 'Agrega cualquier comentario sobre tu decisión...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Acciones',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _updateConsent,
                    icon: const Icon(Icons.save),
                    label: Text(_consentData == null ? 'Crear Consentimiento' : 'Actualizar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
                if (_consentData != null && _consentData!['isActive'] == true) ...[
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _isLoading ? null : _revokeConsent,
                      icon: const Icon(Icons.block),
                      label: const Text('Revocar'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard() {
    if (_consentData == null) return const SizedBox.shrink();

    final isActive = _consentData!['isActive'] ?? false;
    final consentDate = _consentData!['consentDate'];
    final revokedAt = _consentData!['revokedAt'];

    return Card(
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
                  isActive ? Icons.check_circle : Icons.cancel,
                  color: isActive ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 8),
                Text(
                  isActive ? 'Activo' : 'Revocado',
                  style: TextStyle(
                    color: isActive ? Colors.green : Colors.red,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (consentDate != null)
              Text('Fecha de consentimiento: ${_formatDate(consentDate)}'),
            if (revokedAt != null)
              Text('Fecha de revocación: ${_formatDate(revokedAt)}'),
            if (_consentData!['revocationReason'] != null)
              Text('Motivo: ${_consentData!['revocationReason']}'),
          ],
        ),
      ),
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString;
    }
  }
}
