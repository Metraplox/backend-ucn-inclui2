import 'package:flutter/material.dart';
import 'package:incluye_app/services/adjustment_service';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:intl/intl.dart';

class AdjustmentHistoryScreen extends StatefulWidget {
  final String studentId;
  const AdjustmentHistoryScreen({required this.studentId, super.key});

  @override
  AdjustmentHistoryScreenState createState() =>
      AdjustmentHistoryScreenState();
}

class AdjustmentHistoryScreenState extends State<AdjustmentHistoryScreen> {
  bool isLoading = true;
  List<Adjustment> ajustesHistoricos = [];
  List<Adjustment> ajustesFiltrados = [];
  
  String? filtroTipo;
  String? filtroCurso;
  
  // Lista de tipos de ajustes disponibles
  List<String> tiposAjustes = [];
  // Lista de cursos con ajustes
  List<String> cursos = [];

  @override
  void initState() {
    super.initState();
    _loadAjustesHistoricos();
  }

  Future<void> _loadAjustesHistoricos() async {
    final ajustes = await AdjustmentService.getAdjustmentHistory(widget.studentId);
    
    // Verificar si el widget sigue montado antes de actualizar el estado
    if (!mounted) return;
    
    // Extraer lista de tipos de ajustes y cursos únicos
    final Set<String> tiposUnicos = {};
    final Set<String> cursosUnicos = {};
    
    for (var ajuste in ajustes) {
      tiposUnicos.add(ajuste.tipo);
      if (ajuste.courseNrc != null && ajuste.courseNrc!.isNotEmpty) {
        cursosUnicos.add(ajuste.courseNrc!);
      }
    }
    
    setState(() {
      ajustesHistoricos = ajustes;
      ajustesFiltrados = ajustes;
      tiposAjustes = tiposUnicos.toList();
      cursos = cursosUnicos.toList();
      isLoading = false;
    });
  }

  String _formatDate(String? rawDate) {
    if (rawDate == null) return 'No disponible';
    try {
      final date = DateTime.parse(rawDate);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return rawDate.split('T').first;
    }
  }
  
  void _aplicarFiltros() {
    setState(() {
      ajustesFiltrados = ajustesHistoricos.where((ajuste) {
        bool cumpleTipo = filtroTipo == null || ajuste.tipo == filtroTipo;
        bool cumpleCurso = filtroCurso == null || ajuste.curso == filtroCurso;
        return cumpleTipo && cumpleCurso;
      }).toList();
    });
  }
  
  void _limpiarFiltros() {
    setState(() {
      filtroTipo = null;
      filtroCurso = null;
      ajustesFiltrados = ajustesHistoricos;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial de Ajustes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualizar',
            onPressed: _loadAjustesHistoricos,
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : ajustesHistoricos.isEmpty
              ? const Center(child: Text('No hay ajustes en el historial.'))
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Panel de filtros
                    Card(
                      margin: const EdgeInsets.all(16),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Filtros',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: DropdownButtonFormField<String>(
                                    decoration: const InputDecoration(
                                      labelText: 'Tipo de ajuste',
                                      border: OutlineInputBorder(),
                                    ),
                                    value: filtroTipo,
                                    items: [
                                      const DropdownMenuItem<String>(
                                        value: null,
                                        child: Text('Todos'),
                                      ),
                                      ...tiposAjustes.map((tipo) => DropdownMenuItem<String>(
                                            value: tipo,
                                            child: Text(tipo),
                                          )),
                                    ],
                                    onChanged: (value) {
                                      setState(() {
                                        filtroTipo = value;
                                        _aplicarFiltros();
                                      });
                                    },
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: DropdownButtonFormField<String>(
                                    decoration: const InputDecoration(
                                      labelText: 'Curso',
                                      border: OutlineInputBorder(),
                                    ),
                                    value: filtroCurso,
                                    items: [
                                      const DropdownMenuItem<String>(
                                        value: null,
                                        child: Text('Todos'),
                                      ),
                                      ...cursos.map((curso) => DropdownMenuItem<String>(
                                            value: curso,
                                            child: Text(curso),
                                          )),
                                    ],
                                    onChanged: (value) {
                                      setState(() {
                                        filtroCurso = value;
                                        _aplicarFiltros();
                                      });
                                    },
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Center(
                              child: OutlinedButton.icon(
                                icon: const Icon(Icons.clear_all),
                                label: const Text('Limpiar filtros'),
                                onPressed: _limpiarFiltros,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // Resumen de ajustes
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildStatCard(
                                title: 'Total',
                                value: ajustesHistoricos.length.toString(),
                                icon: Icons.tune,
                                color: Colors.blue,
                              ),
                              _buildStatCard(
                                title: 'Activos',
                                value: ajustesHistoricos
                                    .where((a) => a.isActive)
                                    .length
                                    .toString(),
                                icon: Icons.check_circle,
                                color: Colors.green,
                              ),
                              _buildStatCard(
                                title: 'Vencidos',
                                value: ajustesHistoricos
                                    .where((a) => a.isExpired)
                                    .length
                                    .toString(),
                                icon: Icons.highlight_off,
                                color: Colors.red,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Tabla de ajustes
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: ajustesFiltrados.isEmpty
                                ? const Center(child: Text('No hay ajustes que coincidan con los filtros seleccionados.'))
                                : DataTable(
                                    columns: const [
                                      DataColumn(label: Text('Curso')),
                                      DataColumn(label: Text('Tipo')),
                                      DataColumn(label: Text('Fecha Apr.')),
                                      DataColumn(label: Text('Vencimiento')),
                                      DataColumn(label: Text('Estado')),
                                    ],
                                    rows: ajustesFiltrados
                                        .map(
                                          (a) => DataRow(
                                            cells: [
                                              DataCell(Text(a.curso.isEmpty ? '-' : a.curso)),
                                              DataCell(Text(a.tipo)),
                                              DataCell(Text(_formatDate(a.fechaAprobacion))),
                                              DataCell(Text(_formatDate(a.vencimiento))),
                                              DataCell(
                                                _buildEstadoChip(a),
                                              ),
                                            ],
                                          ),
                                        )
                                        .toList(),
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
  
  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, color: color, size: 30),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
        ),
        Text(
          title,
          style: const TextStyle(fontSize: 14),
        ),
      ],
    );
  }
  
  Widget _buildEstadoChip(Adjustment ajuste) {
    final bool activo = ajuste.isActive;
    final bool vencido = ajuste.isExpired;
    
    return Chip(
      label: Text(activo ? 'Activo' : vencido ? 'Vencido' : 'Pendiente'),
      backgroundColor: activo ? Colors.green[100] : vencido ? Colors.red[100] : Colors.orange[100],
      labelStyle: TextStyle(color: activo ? Colors.green[800] : vencido ? Colors.red[800] : Colors.orange[800]),
    );
  }
}
