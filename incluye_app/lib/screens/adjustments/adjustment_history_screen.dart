import 'package:flutter/material.dart';
import 'package:incluye_app/services/adjustment_service.dart';
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
  
  String? filtroTipoId; // Filtramos por ID
  String? filtroCurso;
  
  // ✅ PASO 1: Guardamos el mapa de traducción y las listas para los dropdowns
  Map<String, String> _categoryNamesMap = {};
  List<MapEntry<String, String>> tiposAjustes = []; // Guardamos pares de ID y Nombre
  List<String> cursos = [];

  @override
  void initState() {
    super.initState();
    _loadAjustesHistoricos();
  }

  Future<void> _loadAjustesHistoricos() async {
    setState(() => isLoading = true);
    try {
      // ✅ PASO 2: Cargamos los ajustes Y las categorías al mismo tiempo
      final results = await Future.wait([
        AdjustmentService.getAdjustmentHistory(widget.studentId),
        AdjustmentService.getAdjustmentCategories(),
      ]);

      if (!mounted) return;
      
      final ajustes = results[0] as List<Adjustment>;
      final categories = results[1] as List<Map<String, dynamic>>;
      
      // ✅ PASO 3: Creamos el mapa de traducción
      final categoryMap = {for (var cat in categories) cat['_id'] as String: cat['name'] as String};
      
      final Set<String> cursosUnicos = {};
      for (var ajuste in ajustes) {
        if (ajuste.courseNrc != null && ajuste.courseNrc!.isNotEmpty) {
          cursosUnicos.add(ajuste.courseNrc!);
        }
      }
      
      setState(() {
        ajustesHistoricos = ajustes;
        ajustesFiltrados = ajustes;
        // Creamos una lista de pares (ID, Nombre) para el dropdown de tipos
        tiposAjustes = categoryMap.entries.toList()..sort((a,b) => a.value.compareTo(b.value));
        cursos = cursosUnicos.toList()..sort();
        _categoryNamesMap = categoryMap; // Guardamos el mapa
        isLoading = false;
      });
    } catch(e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error al cargar historial: $e")));
    }
  }

  String _formatDate(String? rawDate) {
    if (rawDate == null || rawDate.isEmpty) return 'N/A';
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(rawDate));
    } catch (e) {
      return rawDate.split('T').first;
    }
  }
  
  void _aplicarFiltros() {
    setState(() {
      ajustesFiltrados = ajustesHistoricos.where((ajuste) {
        // El filtro de tipo ahora compara con el ID
        bool cumpleTipo = filtroTipoId == null || ajuste.tipo == filtroTipoId;
        bool cumpleCurso = filtroCurso == null || ajuste.curso == filtroCurso;
        return cumpleTipo && cumpleCurso;
      }).toList();
    });
  }
  
  void _limpiarFiltros() {
    setState(() {
      filtroTipoId = null;
      filtroCurso = null;
      ajustesFiltrados = ajustesHistoricos;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Historial de Ajustes')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // ✅ PASO 4: Corregir el Dropdown de tipo de ajuste
                Card(
                  margin: const EdgeInsets.all(16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                decoration: const InputDecoration(labelText: 'Tipo de ajuste', border: OutlineInputBorder()),
                                value: filtroTipoId,
                                items: [
                                  const DropdownMenuItem<String>(value: null, child: Text('Todos')),
                                  // Usamos la lista de pares (ID, Nombre)
                                  ...tiposAjustes.map((entry) => DropdownMenuItem<String>(
                                        value: entry.key, // El valor es el ID
                                        child: Text(entry.value), // El texto es el Nombre
                                      )),
                                ],
                                onChanged: (value) {
                                  setState(() {
                                    filtroTipoId = value;
                                    _aplicarFiltros();
                                  });
                                },
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                decoration: const InputDecoration(labelText: 'Curso', border: OutlineInputBorder()),
                                value: filtroCurso,
                                items: [
                                  const DropdownMenuItem<String>(value: null, child: Text('Todos')),
                                  ...cursos.map((curso) => DropdownMenuItem<String>(value: curso, child: Text(curso))),
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
                        Center(child: OutlinedButton.icon(icon: const Icon(Icons.clear_all), label: const Text('Limpiar filtros'), onPressed: _limpiarFiltros)),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          // Stat: Total
                          _buildStatCard(
                            title: 'Total',
                            value: ajustesHistoricos.length.toString(),
                            icon: Icons.tune, // Puedes usar Icons.history
                            color: Colors.blue,
                          ),
                          // Stat: Activos
                          _buildStatCard(
                            title: 'Activos',
                            // Usamos el getter 'isActive' de tu modelo Adjustment
                            value: ajustesHistoricos.where((a) => a.isActive).length.toString(),
                            icon: Icons.check_circle,
                            color: Colors.green,
                          ),
                          // Stat: Vencidos
                          _buildStatCard(
                            title: 'Vencidos',
                            // Usamos el getter 'isExpired' de tu modelo Adjustment
                            value: ajustesHistoricos.where((a) => a.isExpired).length.toString(),
                            icon: Icons.highlight_off, // Puedes usar Icons.timer_off
                            color: Colors.red, // O Colors.orange como en tu imagen
                          ),
                        ],
                      ),
                    ),
                  ),
                ),// ... Tu Card de estadísticas (está correcta) ...

                // ✅ PASO 5: Corregir la tabla de historial
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: DataTable(
                          columns: const [
                            DataColumn(label: Text('Curso')),
                            DataColumn(label: Text('Tipo')),
                            DataColumn(label: Text('Fecha Apr.')),
                            DataColumn(label: Text('Vencimiento')),
                            DataColumn(label: Text('Estado')),
                          ],
                          rows: ajustesFiltrados.map((a) {
                            // Usamos el mapa para traducir el ID a Nombre
                            final tipoNombre = _categoryNamesMap[a.tipo] ?? a.tipo;
                            return DataRow(
                              cells: [
                                DataCell(Text(a.curso.isEmpty ? '-' : a.curso)),
                                DataCell(Text(tipoNombre)),
                                DataCell(Text(_formatDate(a.fechaAprobacion))),
                                DataCell(Text(_formatDate(a.vencimiento))),
                                DataCell(_buildEstadoChip(a)),
                              ],
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  // ... (Tus widgets _buildStatCard y _buildEstadoChip se mantienen igual, son correctos)
  Widget _buildStatCard({ required String title, required String value, required IconData icon, required Color color,}) {
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
    if (ajuste.estado.toLowerCase() == 'cancelado') {
      return Chip(label: Text('Cancelado'), backgroundColor: Colors.red[100], labelStyle: TextStyle(color: Colors.red[800]));
    }
    if (ajuste.isExpired) {
      return Chip(label: Text('Vencido'), backgroundColor: Colors.orange[100], labelStyle: TextStyle(color: Colors.orange[800]));
    }
    if (ajuste.isActive) {
      return Chip(label: Text('Activo'), backgroundColor: Colors.green[100], labelStyle: TextStyle(color: Colors.green[800]));
    }
    return Chip(label: Text(ajuste.estado), backgroundColor: Colors.grey[200], labelStyle: TextStyle(color: Colors.grey[800]));
  }
}