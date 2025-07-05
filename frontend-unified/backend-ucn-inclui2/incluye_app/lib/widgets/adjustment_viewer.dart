import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';

/// Muestra una lista de ajustes razonables con estado y permite acción al presionar.
class AdjustmentViewer extends StatelessWidget {
  final List<Adjustment> adjustments;
  final void Function(Adjustment adjustment)? onTap;

  const AdjustmentViewer({super.key, required this.adjustments, this.onTap});

  @override
  Widget build(BuildContext context) {
    if (adjustments.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              const Icon(Icons.accessibility_new, size: 48, color: Colors.grey),
              const SizedBox(height: 8),
              Text(
                'No hay ajustes disponibles',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: adjustments.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final adj = adjustments[index];
        final statusColor =
            adj.isActive
                ? Colors.green
                : adj.isExpired
                ? Colors.red
                : Colors.orange;
        return ListTile(
          title: Text(
            adj.tipo,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          subtitle: Text(adj.descripcion),
          trailing: Chip(
            label: Text(
              adj.estado.capitalize(),
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
            backgroundColor: statusColor,
          ),
          onTap: onTap != null ? () => onTap!(adj) : null,
        );
      },
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return this[0].toUpperCase() + substring(1).toLowerCase();
  }
}
