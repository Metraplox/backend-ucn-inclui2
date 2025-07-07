import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/services/adjustment_service.dart';

class DiddecAdjustmentsScreen extends StatefulWidget {
  const DiddecAdjustmentsScreen({super.key});

  @override
  State<DiddecAdjustmentsScreen> createState() => _DiddecAdjustmentsScreenState();
}

class _DiddecAdjustmentsScreenState extends State<DiddecAdjustmentsScreen> {
  bool _isLoading = true;
  List<Adjustment> _adjustments = [];
  List<Adjustment> _filteredAdjustments = [];
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'Todos';
  final List<String> _filters = ['Todos', 'Activos', 'Pendientes', 'Completados', 'Expirados'];

  @override
  void initState() {
    super.initState();
    _loadAdjustments();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadAdjustments() async {
    setState(() => _isLoading = true);
    
    try {
      final adjustments = await AdjustmentService.getAllAdjustments();
      
      setState(() {
        _adjustments = adjustments;
        _filteredAdjustments = adjustments;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar ajustes: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _filterAdjustments() {
    List<Adjustment> filtered = _adjustments;

    // Aplicar filtro por categoría
    switch (_selectedFilter) {
      case 'Activos':
        filtered = filtered.where((adj) => adj.isActive).toList();
        break;
      case 'Pendientes':
        filtered = filtered.where((adj) => adj.isPending).toList();
        break;
      case 'Completados':
        filtered = filtered.where((adj) => !adj.isPending && adj.isActive).toList();
        break;
      case 'Expirados':
        filtered = filtered.where((adj) => adj.isExpired).toList();
        break;
    }

    // Aplicar filtro por texto de búsqueda
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered.where((adjustment) =>
        adjustment.tipo.toLowerCase().contains(query) ||
        adjustment.descripcion.toLowerCase().contains(query) ||
        (adjustment.courseNrc?.toLowerCase().contains(query) ?? false)
      ).toList();
    }

    setState(() {
      _filteredAdjustments = filtered;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestión de Ajustes'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAdjustments,
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _createNewAdjustment,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchAndFilter(),
          _buildSummaryCards(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredAdjustments.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _filteredAdjustments.length,
                        itemBuilder: (context, index) {
                          final adjustment = _filteredAdjustments[index];
                          return _buildAdjustmentCard(adjustment);
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createNewAdjustment,
        backgroundColor: Colors.green,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildSearchAndFilter() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              labelText: 'Buscar ajuste',
              hintText: 'Tipo, descripción o NRC...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
            ),
            onChanged: (_) => _filterAdjustments(),
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _filters.map((filter) {
                final isSelected = _selectedFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedFilter = filter);
                        _filterAdjustments();
                      }
                    },
                    selectedColor: Colors.green.shade100,
                    checkmarkColor: Colors.green,
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCards() {
    final totalAdjustments = _adjustments.length;
    final activeAdjustments = _adjustments.where((adj) => adj.isActive).length;
    final pendingAdjustments = _adjustments.where((adj) => adj.isPending).length;
    final expiredAdjustments = _adjustments.where((adj) => adj.isExpired).length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: _buildSummaryCard(
              'Total',
              totalAdjustments.toString(),
              Icons.tune,
              Colors.blue,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Activos',
              activeAdjustments.toString(),
              Icons.check_circle,
              Colors.green,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Pendientes',
              pendingAdjustments.toString(),
              Icons.schedule,
              Colors.orange,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Expirados',
              expiredAdjustments.toString(),
              Icons.error,
              expiredAdjustments > 0 ? Colors.red : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: const TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.tune,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No se encontraron ajustes',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isEmpty && _selectedFilter == 'Todos'
                ? 'No hay ajustes curriculares registrados'
                : 'Intenta con otros filtros o términos de búsqueda',
            style: TextStyle(
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _createNewAdjustment,
            icon: const Icon(Icons.add),
            label: const Text('Crear Nuevo Ajuste'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdjustmentCard(Adjustment adjustment) {
    final statusColor = _getStatusColor(adjustment);
    final statusIcon = _getStatusIcon(adjustment);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withValues(alpha: 0.1),
          child: Icon(statusIcon, color: statusColor),
        ),
        title: Text(
          adjustment.tipo,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(adjustment.descripcion),
            const SizedBox(height: 4),
            Row(
              children: [
                if (adjustment.courseNrc != null) ...[
                  Icon(Icons.class_, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 4),
                  Text(
                    'NRC: ${adjustment.courseNrc}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  const SizedBox(width: 16),
                ],
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    border: Border.all(color: statusColor),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _getStatusText(adjustment),
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDetailRow('Tipo', adjustment.tipo),
                _buildDetailRow('Descripción', adjustment.descripcion),
                if (adjustment.courseNrc != null)
                  _buildDetailRow('NRC del Curso', adjustment.courseNrc!),
                _buildDetailRow('Estado', _getStatusText(adjustment)),
                if (adjustment.documentosAsociados != null && adjustment.documentosAsociados!.isNotEmpty)
                  _buildDetailRow('Documentos', '${adjustment.documentosAsociados!.length} archivos'),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _editAdjustment(adjustment),
                      icon: const Icon(Icons.edit),
                      label: const Text('Editar'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _viewDocuments(adjustment),
                      icon: const Icon(Icons.folder),
                      label: const Text('Documentos'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    if (adjustment.isPending)
                      ElevatedButton.icon(
                        onPressed: () => _approveAdjustment(adjustment),
                        icon: const Icon(Icons.check),
                        label: const Text('Aprobar'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(Adjustment adjustment) {
    if (adjustment.isExpired) return Colors.red;
    if (adjustment.isPending) return Colors.orange;
    if (adjustment.isActive) return Colors.green;
    return Colors.grey;
  }

  IconData _getStatusIcon(Adjustment adjustment) {
    if (adjustment.isExpired) return Icons.error;
    if (adjustment.isPending) return Icons.schedule;
    if (adjustment.isActive) return Icons.check_circle;
    return Icons.help;
  }

  String _getStatusText(Adjustment adjustment) {
    if (adjustment.isExpired) return 'Expirado';
    if (adjustment.isPending) return 'Pendiente';
    if (adjustment.isActive) return 'Activo';
    return 'Desconocido';
  }

  void _editAdjustment(Adjustment adjustment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Editar Ajuste'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              initialValue: adjustment.tipo,
              decoration: const InputDecoration(
                labelText: 'Tipo de Ajuste',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              initialValue: adjustment.descripcion,
              decoration: const InputDecoration(
                labelText: 'Descripción',
                border: OutlineInputBorder(),
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
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Ajuste actualizado exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  void _viewDocuments(Adjustment adjustment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Documentos Asociados'),
        content: SizedBox(
          width: double.maxFinite,
          height: 300,
          child: adjustment.documentosAsociados == null || adjustment.documentosAsociados!.isEmpty
              ? const Center(child: Text('No hay documentos asociados'))
              : ListView.builder(
                  itemCount: adjustment.documentosAsociados!.length,
                  itemBuilder: (context, index) {
                    final doc = adjustment.documentosAsociados![index];
                    return ListTile(
                      leading: const Icon(Icons.description),
                      title: Text(doc),
                      trailing: IconButton(
                        icon: const Icon(Icons.download),
                        onPressed: () => _downloadDocument(doc),
                      ),
                    );
                  },
                ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _uploadDocument(adjustment);
            },
            child: const Text('Subir Documento'),
          ),
        ],
      ),
    );
  }

  void _approveAdjustment(Adjustment adjustment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Aprobar Ajuste'),
        content: Text('¿Estás seguro de que deseas aprobar el ajuste "${adjustment.tipo}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Ajuste aprobado exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
              _loadAdjustments(); // Recargar para actualizar estados
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: const Text('Aprobar'),
          ),
        ],
      ),
    );
  }

  void _createNewAdjustment() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Crear Nuevo Ajuste'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const TextField(
              decoration: InputDecoration(
                labelText: 'Tipo de Ajuste',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Descripción',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'NRC del Curso (opcional)',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Ajuste creado exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Crear'),
          ),
        ],
      ),
    );
  }

  void _downloadDocument(String document) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Descargando documento: $document'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _uploadDocument(Adjustment adjustment) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Funcionalidad de subida de documentos'),
        backgroundColor: Colors.orange,
      ),
    );
  }
}
