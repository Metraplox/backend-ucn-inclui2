import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:incluye_app/models/teacherStats_model.dart';
import 'package:incluye_app/screens/teachers/teacher_stats.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/services/career_service.dart';

class TeachersbyCareerScreen extends StatefulWidget {
  const TeachersbyCareerScreen({super.key});
  @override
  State<TeachersbyCareerScreen> createState() => _TeachersByCareerScreenState();
}

class _TeachersByCareerScreenState extends State<TeachersbyCareerScreen> {
  List<dynamic> _teachers = [];

  Future<void> _fetchTeachers() async {
    final teachers = await CareerService.getTeachersByCareer();
    setState(() {
      _teachers = teachers;
    });
  }

  @override
  void initState() {
    super.initState();
    _fetchTeachers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Docentes")),
      body:
          _teachers.isEmpty
              ? const Center(
                child: Text(
                  'No hay docentes registrados.',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
              )
              : ListView.separated(
                padding: const EdgeInsets.all(8.0),
                itemCount: _teachers.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder:
                    (context, index) =>
                        _buildTeacherCard(_teachers[index], context),
              ),
    );
  }

  Widget _buildTeacherCard(Map<String, dynamic> teacher, BuildContext context) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).primaryColorLight,
          child: Text(
            teacher['teacherName']?.substring(0, 1).toUpperCase() ?? '?',
            style: TextStyle(
              color: Theme.of(context).primaryColorDark,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          teacher['teacherName'] ?? 'Sin nombre',
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(teacher['teacherEmail'] ?? 'Sin correo'),
            const SizedBox(height: 2),
            Text('Departamento: ${teacher['department'] ?? 'N/A'}'),
            const SizedBox(height: 2),
          ],
        ),
        onTap: () {
          final teacherObj = TeacherStats.fromJson(teacher);
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TeacherStatsScreen(teacher: teacherObj),
            ),
          );
        },
      ),
    );
  }
}
