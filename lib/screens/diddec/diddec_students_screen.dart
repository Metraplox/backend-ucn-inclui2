import 'package:flutter/material.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/student_service.dart';

class DiddecStudentsScreen extends StatefulWidget {
  const DiddecStudentsScreen({super.key});

  @override
  State<DiddecStudentsScreen> createState() => _DiddecStudentsScreenState();
}

class _DiddecStudentsScreenState extends State<DiddecStudentsScreen> {
  bool _isLoading = true;
  List<Student> _students = [];
  List<Student> _filteredStudents = [];
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'Todos';
  final List<String> _filters = ['Todos', 'Con NEE', 'Sin NEE', 'Activos', 'Inactivos'];

  @override
  void initState() {
    super.initState();
    _loadStudents();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadStudents() async {
    setState(() => _isLoading = true);
    
    try {
      final students = await StudentService.getAllStudents();
      
      setState(() {
        _students = students;
        _filteredStudents = students;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar estudiantes: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _filterStudents() {
    List<Student> filtered = _students;

    // Aplicar filtro por categoría
    switch (_selectedFilter) {
      case 'Con NEE':
        filtered = filtered.where((student) => 
          student.necesidadesEducativasEspeciales != null && 
          student.necesidadesEducativasEspeciales!.isNotEmpty
        ).toList();
        break;
      case 'Sin NEE':
        filtered = filtered.where((student) => 
          student.necesidadesEducativasEspeciales == null || 
          student.necesidadesEducativasEspeciales!.isEmpty
        ).toList();
        break;
      case 'Activos':
        // Simular estudiantes activos
        filtered = filtered.where((student) => true).toList();
        break;
      case 'Inactivos':
        // Simular estudiantes inactivos (filtro vacío para demo)
        filtered = [];
        break;
    }

    // Aplicar filtro por texto de búsqueda
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      filtered = filtered.where((student) =>
        student.nombreCompleto.toLowerCase().contains(query) ||
        student.rut.toLowerCase().contains(query) ||
        (student.carreraNombre?.toLowerCase().contains(query) ?? false)
      ).toList();
    }

    setState(() {
      _filteredStudents = filtered;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Estudiantes DIDDEC'),
        backgroundColor: Colors.purple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadStudents,
          ),
          IconButton(
            icon: const Icon(Icons.analytics),
            onPressed: _showStatistics,
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
                : _filteredStudents.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _filteredStudents.length,
                        itemBuilder: (context, index) {
                          final student = _filteredStudents[index];
                          return _buildStudentCard(student);
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _exportData,
        backgroundColor: Colors.purple,
        child: const Icon(Icons.download, color: Colors.white),
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
              labelText: 'Buscar estudiante',
              hintText: 'Nombre, RUT o carrera...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
            ),
            onChanged: (_) => _filterStudents(),
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
                        _filterStudents();
                      }
                    },
                    selectedColor: Colors.purple.shade100,
                    checkmarkColor: Colors.purple,
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
    final totalStudents = _students.length;
    final studentsWithNEE = _students.where((s) => 
      s.necesidadesEducativasEspeciales != null && 
      s.necesidadesEducativasEspeciales!.isNotEmpty
    ).length;
    final studentsWithoutNEE = totalStudents - studentsWithNEE;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: _buildSummaryCard(
              'Total',
              totalStudents.toString(),
              Icons.people,
              Colors.blue,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Con NEE',
              studentsWithNEE.toString(),
              Icons.accessibility,
              Colors.orange,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Sin NEE',
              studentsWithoutNEE.toString(),
              Icons.person,
              Colors.green,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _buildSummaryCard(
              'Filtrados',
              _filteredStudents.length.toString(),
              Icons.filter_list,
              Colors.purple,
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
            Icons.people_outline,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No se encontraron estudiantes',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isEmpty && _selectedFilter == 'Todos'
                ? 'No hay estudiantes registrados'
                : 'Intenta con otros filtros o términos de búsqueda',
            style: TextStyle(
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStudentCard(Student student) {
    final hasNEE = student.necesidadesEducativasEspeciales != null && 
                   student.necesidadesEducativasEspeciales!.isNotEmpty;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: hasNEE ? Colors.orange.shade100 : Colors.blue.shade100,
          child: hasNEE
              ? const Icon(Icons.accessibility, color: Colors.orange)
              : const Icon(Icons.person, color: Colors.blue),
        ),
        title: Text(
          student.nombreCompleto,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('RUT: ${student.rut}'),
            if (student.carreraNombre != null)
              Text('Carrera: ${student.carreraNombre}'),
            if (hasNEE)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.orange.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'NEE',
                  style: TextStyle(
                    color: Colors.orange,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDetailRow('Email', student.email),
                if (student.anioIngreso != null)
                  _buildDetailRow('Año de Ingreso', student.anioIngreso.toString()),
                if (student.semester != null)
                  _buildDetailRow('Semestre', student.semester!),
                if (hasNEE)
                  _buildDetailRow('NEE', student.necesidadesEducativasEspeciales!),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _viewFullProfile(student),
                      icon: const Icon(Icons.person),
                      label: const Text('Ver Perfil'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _viewAdjustments(student),
                      icon: const Icon(Icons.tune),
                      label: const Text('Ajustes'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _manageResources(student),
                      icon: const Icon(Icons.folder),
                      label: const Text('Recursos'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple,
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

  void _viewFullProfile(Student student) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Abriendo perfil completo de ${student.nombreCompleto}'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _viewAdjustments(Student student) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Mostrando ajustes de ${student.nombreCompleto}'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _manageResources(Student student) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Gestionando recursos para ${student.nombreCompleto}'),
        backgroundColor: Colors.purple,
      ),
    );
  }

  void _showStatistics() {
    final totalStudents = _students.length;
    final studentsWithNEE = _students.where((s) => 
      s.necesidadesEducativasEspeciales != null && 
      s.necesidadesEducativasEspeciales!.isNotEmpty
    ).length;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Estadísticas de Estudiantes'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Total de estudiantes: $totalStudents'),
            Text('Estudiantes con NEE: $studentsWithNEE'),
            Text('Estudiantes sin NEE: ${totalStudents - studentsWithNEE}'),
            Text('Porcentaje con NEE: ${totalStudents > 0 ? ((studentsWithNEE / totalStudents) * 100).toStringAsFixed(1) : 0}%'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _exportData();
            },
            child: const Text('Exportar'),
          ),
        ],
      ),
    );
  }

  void _exportData() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Exportando datos de estudiantes'),
        backgroundColor: Colors.purple,
      ),
    );
  }
}
