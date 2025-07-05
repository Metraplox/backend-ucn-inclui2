import 'package:flutter/material.dart';
import 'package:incluye_app/models/teacher_stats_model.dart';
import 'package:percent_indicator/circular_percent_indicator.dart';

class TeacherStatsScreen extends StatefulWidget {
  final TeacherStats teacher;
  const TeacherStatsScreen({super.key, required this.teacher});

  @override
  State<TeacherStatsScreen> createState() => _TeacherStatsScreenState();
}

class _TeacherStatsScreenState extends State<TeacherStatsScreen> {
  @override
  Widget build(BuildContext context) {
    final double percentage =
        widget.teacher.averageRating *
        20; // Convert rating (0-5) to percentage (0-100)

    return Scaffold(
      appBar: AppBar(
        title: Text('Estadísticas de ${widget.teacher.teacherName}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            CircularPercentIndicator(
              radius: 110.0,
              lineWidth: 14.0,
              animation: true,
              percent: (percentage / 100).clamp(0.0, 1.0),
              center: Text(
                widget.teacher.averageRating.toStringAsFixed(1),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 24.0,
                  color: Colors.blueAccent,
                ),
              ),
              footer: Padding(
                padding: const EdgeInsets.only(top: 12.0),
                child: Text(
                  "Calificación promedio",
                  style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                ),
              ),
              circularStrokeCap: CircularStrokeCap.round,
              progressColor: Colors.blueAccent,
              backgroundColor: Colors.grey.shade300,
            ),
            const SizedBox(height: 32),

            // Aquí las cards para cada dato
            _buildStatCard("Nombre", widget.teacher.teacherName, Icons.person),
            _buildStatCard("Email", widget.teacher.teacherEmail, Icons.email),
            _buildStatCard(
              "Departamento",
              widget.teacher.department,
              Icons.account_balance,
            ),
            _buildStatCard(
              "Cantidad de cursos",
              "${widget.teacher.courseCount}",
              Icons.book,
            ),
            _buildStatCard(
              "Estudiantes",
              "${widget.teacher.studentCount}",
              Icons.group,
            ),
            _buildStatCard(
              "Alertas activas",
              "${widget.teacher.alertCount}",
              Icons.assignment,
            ),
            _buildStatCard(
              "Estado",
              widget.teacher.isActive ? "Activo" : "Inactivo",
              Icons.check_circle,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: Colors.blueAccent),
        title: Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Text(
          value,
          style: TextStyle(fontSize: 15, color: Colors.grey[800]),
        ),
      ),
    );
  }
}
