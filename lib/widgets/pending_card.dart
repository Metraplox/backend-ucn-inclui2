import 'package:flutter/material.dart';
import 'package:incluye_app/models/document_model.dart';
import 'package:intl/intl.dart';

/// Tarjeta que muestra un documento pendiente y permite aprobar o rechazar.
class PendingCard extends StatelessWidget {
  final Document document;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  const PendingCard({
    super.key,
    required this.document,
    required this.onApprove,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    DateTime? parsedDate;
    try {
      parsedDate = DateTime.parse(document.uploadDate);
    } catch (_) {
      parsedDate = null;
    }
    final formattedDate =
        parsedDate != null
            ? DateFormat('dd/MM/yyyy').format(parsedDate)
            : document.uploadDate;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          document.nombre,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text('Subido: $formattedDate'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.check, color: Colors.green),
              tooltip: 'Aprobar',
              onPressed: onApprove,
            ),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.red),
              tooltip: 'Rechazar',
              onPressed: onReject,
            ),
          ],
        ),
      ),
    );
  }
}
