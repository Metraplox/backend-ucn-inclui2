import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/student_service.dart';

class StudentAdjustmentsScreen extends StatefulWidget {
  const StudentAdjustmentsScreen({super.key});

  @override
  State<StudentAdjustmentsScreen> createState() =>
      _StudentAdjustmentsScreenState();
}

class _StudentAdjustmentsScreenState extends State<StudentAdjustmentsScreen> {
  bool _isLoading = true;
  List<Adjustment> _adjustments = [];

  @override
  void initState() {
    super.initState();
    _loadAdjustments();
  }

  Future<void> _loadAdjustments() async {
    final user = await StudentService.getCurrentUserInfo();
    final studentId = user?.id ?? '';
    final adjustments = await AdjustmentService.getAdjustmentHistory(studentId);
    if (mounted) {
      setState(() {
        _adjustments = adjustments;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes Pendientes')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _adjustments.isEmpty
              ? const Center(child: Text('No hay ajustes pendientes'))
              : ListView.builder(
                itemCount: _adjustments.length,
                itemBuilder: (context, index) {
                  final adj = _adjustments[index];
                  return ListTile(
                    leading: CircleAvatar(
                      child: Icon(
                        adj.isPending ? Icons.schedule : Icons.check_circle,
                      ),
                    ),
                    title: Text(adj.tipo),
                    subtitle: Text(adj.descripcion),
                    trailing: Text(
                      adj.status ?? '',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  );
                },
              ),
    );
  }
}
