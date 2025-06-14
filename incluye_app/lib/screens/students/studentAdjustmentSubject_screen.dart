import 'package:flutter/material.dart';
import 'package:incluye_app/models/adjustment_model.dart';
import 'package:incluye_app/models/courseWithAdjustment_model.dart';
import 'package:incluye_app/models/studentAdjustment.dart';
import 'package:incluye_app/models/student_model.dart';
import 'package:incluye_app/services/adjustment_service.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/services/course_service.dart';

class StudentAdjustmentSubjectScreen extends StatefulWidget {
  final String studentId;
  final String courseNrc;
  final String courseId;
  const StudentAdjustmentSubjectScreen({
    super.key,
    required this.studentId,
    required this.courseNrc,
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
  String? _currentUserId;

  List<Adjustment> _adjustments = [];
  String? studentAdjustmentId;
  List<Map<String, dynamic>> _adjustmentsWithIds = [];
  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  Future<void> _initializeData() async {
    final userId = await AuthService.getUserId();
    setState(() {
      _currentUserId = userId;
    });
    if (_currentUserId != null) {
      _fetchStudentsAndAdjustments();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo obtener el id de usuario')),
      );
    }
  }

  Future<void> _fetchStudentsAndAdjustments() async {
    setState(() {
      _isLoading = true;
    });
    try {
      // Obtener alumnos
      final students = await CourseService.getStudentsBySubject(
        widget.courseId,
      );
      final selectedStudent = students.firstWhere(
        (s) => s.id == widget.studentId,
      );

      // Obtener ajustes por curso (lista de StudentAdjustment)
      final studentAdjustments = await AdjustmentService.getCourseAdjustments(
        widget.courseNrc,
      );

      // Buscar los ajustes para el estudiante actual (puede no existir)
      final selectedStudentAdjustment = studentAdjustments.where(
        (sa) => sa.studentId == widget.studentId,
      );
      for (var sa in selectedStudentAdjustment) {
        if (sa.currentAdjustments != null) {
          for (var adj in sa.currentAdjustments) {
            _adjustmentsWithIds.add({"adjustment": adj, "saId": sa.id});
            final yaLeido =
                adj.readBy?.any((r) => r['userId'] == _currentUserId) ?? false;

            _adjustmentChecked[sa.id] = yaLeido;
          }
        }
      }
      setState(() {
        student = selectedStudent;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
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
    if (student == null || _adjustments == null) {
      return Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: Text('Ajustes del estudiante')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child:
            _adjustmentsWithIds!.isEmpty
                ? Center(child: Text('No hay ajustes para este estudiante.'))
                : ListView.builder(
                  itemCount: _adjustmentsWithIds.length,
                  itemBuilder: (context, index) {
                    final item = _adjustmentsWithIds[index];
                    final Adjustment ajuste = item["adjustment"];
                    final String saId = item["saId"];
                    final isChecked = _adjustmentChecked[saId] ?? false;

                    return Card(
                      margin: EdgeInsets.symmetric(vertical: 8),
                      child: ListTile(
                        leading: Icon(Icons.settings),
                        title: Text(
                          ajuste.tipo ?? 'Sin tipo',
                        ), // o ajuste.tipo si usas ese nombre
                        subtitle: Text(
                          ajuste.descripcion ?? 'Sin descripción',
                        ), // asegúrate que exista o cambia al campo correcto
                        trailing: Checkbox(
                          value: isChecked,
                          onChanged: (value) {
                            if (value == true && !_checkLoading) {
                              _sendCheckAdjustment(saId!);
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
