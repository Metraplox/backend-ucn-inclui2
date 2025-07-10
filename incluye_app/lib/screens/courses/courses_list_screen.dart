import 'package:flutter/material.dart';
import 'package:incluye_app/models/courseWithAdjustment_model.dart';
import 'package:incluye_app/screens/students/student_subject_list.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/services/course_service.dart';

class CoursesListScreen extends StatefulWidget {
  final String? idTeacher;
  const CoursesListScreen({super.key, required this.idTeacher});

  @override
  State<CoursesListScreen> createState() => _CoursesListScreenState();
}

class _CoursesListScreenState extends State<CoursesListScreen> {
  Future<List<CourseAdjustment>>? _coursesFuture;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    await _loadCourses(); // Solo carga cursos después de tener idTeacher
  }

  Future<void> _loadCourses() async {
    final name = await AuthService.getUserName();
    final id = await AuthService.getUserId();
    final courses = await CourseService.getTeacherCourses(widget.idTeacher!);
    for (var c in courses) {
      print(c.students.length);
    }

    setState(() {
      _coursesFuture = Future.value(courses);
    });
  }

  Widget _buildFeatureCard(
    String title,
    String description,
    IconData icon,
    Color color, {
    VoidCallback? onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color,
          child: Icon(icon, color: Colors.white),
        ),
        title: Text(title),
        subtitle: Text(description),
        trailing: const Icon(Icons.arrow_forward),
        onTap: onTap ?? () {},
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Asignaturas a cargo')),
      body: FutureBuilder<List<CourseAdjustment>>(
        future: _coursesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No se encontraron cursos.'));
          } else {
            final courses = snapshot.data!;
            return Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListView.builder(
                itemCount: courses.length,
                itemBuilder: (context, index) {
                  final course = courses[index];
                  return _buildFeatureCard(
                    course.nombre,
                    '${course.students.length} estudiantes con ajustes razonables.',
                    Icons.book_sharp,
                    const Color.fromARGB(255, 2, 72, 104),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder:
                              (context) => StudentSubjectListScreen(
                                courseId: course.id,
                                courseNrc: course.nrc,
                              ),
                        ),
                      );
                    },
                  );
                },
              ),
            );
          }
        },
      ),
    );
  }
}
