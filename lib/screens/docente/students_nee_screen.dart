import 'package:flutter/material.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/student_service.dart';

class StudentsNEEScreen extends StatefulWidget {
  const StudentsNEEScreen({super.key});

  @override
  State<StudentsNEEScreen> createState() => _StudentsNEEScreenState();
}

class _StudentsNEEScreenState extends State<StudentsNEEScreen> {
  bool _isLoading = true;
  List<Student> _students = [];
  List<Student> _filteredStudents = [];
  final TextEditingController _searchController = TextEditingController();

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
      // Filtrar solo estudiantes con NEE
      final studentsNEE = students.where((student) => 
        student.necesidadesEducativasEspeciales != null && 
        student.necesidadesEducativasEspeciales!.isNotEmpty
      ).toList();
      
      setState(() {
        _students = studentsNEE;
        _filteredStudents = studentsNEE;
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

  void _filterStudents(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredStudents = _students;
      } else {
        _filteredStudents = _students.where((student) =>
          student.nombreCompleto.toLowerCase().contains(query.toLowerCase()) ||
          student.rut.toLowerCase().contains(query.toLowerCase()) ||
          (student.carreraNombre?.toLowerCase().contains(query.toLowerCase()) ?? false)
        ).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Estudiantes NEE'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadStudents,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Buscar estudiante',
                hintText: 'Nombre, RUT o carrera...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: _filterStudents,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredStudents.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _filteredStudents.length,
                        itemBuilder: (context, index) {
                          final student = _filteredStudents[index];
                          return _buildStudentCard(student);
                        },
                      ),
          ),
        ],
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
            _searchController.text.isEmpty
                ? 'No hay estudiantes NEE registrados'
                : 'Intenta con otro término de búsqueda',
            style: TextStyle(
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentCard(Student student) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: Colors.blue.shade100,
          child: Text(
            student.nombreCompleto.split(' ').map((name) => name[0]).take(2).join(),
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
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
            if (student.necesidadesEducativasEspeciales != null && 
                student.necesidadesEducativasEspeciales!.isNotEmpty)
              Text(
                'NEE: ${student.necesidadesEducativasEspeciales}',
                style: const TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.w500,
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
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => _viewStudentProfile(student),
                      icon: const Icon(Icons.person),
                      label: const Text('Ver Perfil'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _viewAdjustments(student),
                      icon: const Icon(Icons.assignment),
                      label: const Text('Ajustes'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _contactStudent(student),
                      icon: const Icon(Icons.email),
                      label: const Text('Contactar'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
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

  void _viewStudentProfile(Student student) {
    Navigator.pushNamed(
      context, 
      '/student/profile',
      arguments: student.id,
    );
  }

  void _viewAdjustments(Student student) {
    Navigator.pushNamed(
      context,
      '/student/adjustments',
      arguments: student.id,
    );
  }

  void _contactStudent(Student student) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Contactar a ${student.nombreCompleto}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Email: ${student.email}'),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Mensaje',
                hintText: 'Escribe tu mensaje aquí...',
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
                  content: Text('Mensaje enviado exitosamente'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Enviar'),
          ),
        ],
      ),
    );
  }
}
