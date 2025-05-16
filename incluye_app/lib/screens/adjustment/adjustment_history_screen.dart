import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';

class AdjustmentHistoryScreen extends StatefulWidget {
  final String studentId;
  const AdjustmentHistoryScreen({required this.studentId, Key? key}) : super(key: key);

  @override
  _AdjustmentHistoryScreenState createState() => _AdjustmentHistoryScreenState();
}

class _AdjustmentHistoryScreenState extends State<AdjustmentHistoryScreen> {
  bool isLoading = true;
  List<Map<String, dynamic>> ajustesHistoricos = [];

  @override
  void initState() {
    super.initState();
    _loadAjustesHistoricos();
  }

  Future<void> _loadAjustesHistoricos() async {
    final ajustes = await ApiService.getAdjustmentHistory(widget.studentId);
    setState(() {
      ajustesHistoricos = ajustes;
      isLoading = false;
    });
  }

  String _formatDate(String? rawDate) {
    if (rawDate == null) return '';
    return rawDate.split('T').first;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial de Ajustes'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : ajustesHistoricos.isEmpty
              ? const Center(child: Text('No hay ajustes en el historial.'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Curso')),
                      DataColumn(label: Text('Tipo')),
                      DataColumn(label: Text('Fecha Aprobación')),
                      DataColumn(label: Text('Aprobado Por')),
                      DataColumn(label: Text('Vencimiento')),
                    ],
                    rows: ajustesHistoricos
                        .map(
                          (a) => DataRow(cells: [
                            DataCell(Text(a['curso'] ?? '')),
                            DataCell(Text(a['tipo'] ?? '')),
                            DataCell(Text(_formatDate(a['fechaAprobacion']))),
                            DataCell(Text(a['aprobadoPor'] ?? '')),
                            DataCell(Text(_formatDate(a['vencimiento']))),
                          ]),
                        )
                        .toList(),
                  ),
                ),
    );
  }
}
