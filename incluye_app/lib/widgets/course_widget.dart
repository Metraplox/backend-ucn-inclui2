import 'package:flutter/material.dart';

class CourseWidget extends StatelessWidget {
  final String courseName;
  final String professor;
  final List<String> adjustments;
  final VoidCallback onEdit;

  const CourseWidget({
    super.key,
    required this.courseName,
    required this.professor,
    required this.adjustments,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(courseName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Profesor: $professor', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 8),
            ...adjustments.map((a) => Row(
              children: [
                const Text('• ', style: TextStyle(fontSize: 14)),
                Expanded(child: Text(a, style: const TextStyle(fontSize: 14))),
              ],
            )),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onEdit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Editar Ajustes'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
