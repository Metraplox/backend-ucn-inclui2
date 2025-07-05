import 'package:flutter/material.dart';

/// Botón para exportar datos (CSV/Excel)
class ExportButton extends StatelessWidget {
  final VoidCallback onPressed;
  final Color color;
  final String label;

  const ExportButton({
    super.key,
    required this.onPressed,
    this.color = Colors.blue,
    this.label = 'Exportar',
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: const Icon(Icons.file_download, size: 20),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }
}
