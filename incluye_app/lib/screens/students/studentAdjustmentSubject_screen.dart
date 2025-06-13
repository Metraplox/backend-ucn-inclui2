import 'package:flutter/material.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/course_service.dart';

class StudentAdjustmentSubjectScreen extends StatefulWidget {
  final String studentId;
  final String courseId;
  const StudentAdjustmentSubjectScreen({
    super.key,
    required this.studentId,
    required this.courseId,
  });

  @override
  State<StudentAdjustmentSubjectScreen> createState() =>
      _StudentAdjustmentSubjectScreenState();
}

class _StudentAdjustmentSubjectScreenState
    extends State<StudentAdjustmentSubjectScreen> {
  bool _isLoading = false;
  bool _checkLoading = false;
  Map<String, bool> _adjustmentChecked = {};
  Student? student;
  List<Student> _students = [];
  @override
  void initState() {
    super.initState();
    _fetchStudentsAndAdjustments();
  }

  Future<void> _fetchStudentsAndAdjustments() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final students = await CourseService.getStudentsBySubject(
        widget.courseId,
      );
      final selectedStudent = students.firstWhere(
        (s) => s.id == widget.studentId,
        orElse: () => throw Exception('Estudiante no encontrado'),
      );

      setState(() {
        student = selectedStudent;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _sendCheckAdjustment(String adjustmentId) async {
    setState(() {
      _checkLoading = true;
    });
    try {
      await AdjustmentService.setReadAdjustment(adjustmentId);
      setState(() {
        _adjustmentChecked[adjustmentId] = true;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al confirmar lectura del ajuste: $e')),
      );
    } finally {
      setState(() {
        _checkLoading = false;
      });
    }
  }

  @override
  @override
  Widget build(BuildContext context) {
    if (student == null) {
      return Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: Text('Ajustes del estudiante')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child:
            student!.ajustes == null || student!.ajustes!.isEmpty
                ? Center(child: Text('No hay ajustes para este estudiante.'))
                : ListView.builder(
                  itemCount: student!.ajustes!.length,
                  itemBuilder: (context, index) {
                    final ajuste = student!.ajustes![index];
                    final isChecked =
                        _adjustmentChecked[ajuste.id ?? ''] ?? false;

                    return Card(
                      margin: EdgeInsets.symmetric(vertical: 8),
                      child: ListTile(
                        leading: Icon(Icons.settings),
                        title: Text(ajuste.tipo ?? 'Sin tipo'),
                        subtitle: Text(ajuste.descripcion ?? 'Sin descripción'),
                        trailing: Checkbox(
                          value: isChecked,
                          onChanged: (value) {
                            if (value == true && !_checkLoading) {
                              _sendCheckAdjustment(ajuste.id ?? '');
                            }
                          },
                        ),
                      ),
                    );
                  },
                ),
      ),
    );
  }
}
