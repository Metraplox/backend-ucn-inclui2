import 'package:flutter/material.dart';
import 'package:incluye_app/services/student_service.dart';
import 'package:incluye_app/services/course_service.dart';
import 'package:incluye_app/models/course_model.dart';
import 'package:incluye_app/screens/students/student_adjustment_subject_screen.dart';

/// Pantalla de asignaturas del estudiante agrupadas por semestre
class StudentCourseListScreen extends StatefulWidget {
  const StudentCourseListScreen({super.key});

  @override
  State<StudentCourseListScreen> createState() =>
      _StudentCourseListScreenState();
}

class _StudentCourseListScreenState extends State<StudentCourseListScreen> {
  bool _isLoading = true;
  String? _studentId;
  List<Course> _allCourses = [];
  List<Course> _filteredCourses = [];
  List<String> _semesters = [];
  String? _selectedSemester;

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  Future<void> _loadCourses() async {
    setState(() => _isLoading = true);
    _studentId = await StudentService.getStudentId();
    if (_studentId != null) {
      final courses = await CourseService.getStudentCourses(_studentId!);
      final semesters =
          courses.map((c) => c.semestre ?? 'Sin semestre').toSet().toList();
      semesters.sort();
      setState(() {
        _allCourses = courses;
        _semesters = semesters;
        _selectedSemester = semesters.isNotEmpty ? semesters.first : null;
        _applyFilter();
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  void _applyFilter() {
    if (_selectedSemester == null) {
      _filteredCourses = List.from(_allCourses);
    } else {
      _filteredCourses =
          _allCourses
              .where((c) => (c.semestre ?? 'Sin semestre') == _selectedSemester)
              .toList();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis Asignaturas')),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                onRefresh: _loadCourses,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_semesters.isNotEmpty)
                        DropdownButton<String>(
                          value: _selectedSemester,
                          items:
                              _semesters
                                  .map(
                                    (sem) => DropdownMenuItem(
                                      value: sem,
                                      child: Text(sem),
                                    ),
                                  )
                                  .toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedSemester = value;
                              _applyFilter();
                            });
                          },
                        ),
                      const SizedBox(height: 16),
                      Expanded(
                        child:
                            _filteredCourses.isEmpty
                                ? Center(
                                  child: Text(
                                    'No hay asignaturas para este semestre.',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                )
                                : ListView.builder(
                                  itemCount: _filteredCourses.length,
                                  itemBuilder: (context, index) {
                                    final course = _filteredCourses[index];
                                    return Card(
                                      child: ListTile(
                                        title: Text(course.nombre),
                                        subtitle: Text(
                                          'Profesor: ${course.profesor ?? 'N/A'}',
                                        ),
                                        trailing: const Icon(
                                          Icons.arrow_forward_ios,
                                          size: 16,
                                        ),
                                        onTap: () {
                                          if (_studentId != null) {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder:
                                                    (_) =>
                                                        StudentAdjustmentSubjectScreen(
                                                          studentId:
                                                              _studentId!,
                                                          courseNrc: course.nrc,
                                                          courseId: course.id,
                                                        ),
                                              ),
                                            );
                                          }
                                        },
                                      ),
                                    );
                                  },
                                ),
                      ),
                    ],
                  ),
                ),
              ),
    );
  }
}
