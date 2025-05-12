import 'package:flutter/material.dart';
import 'package:incluye_app/widgets/app_scaffold.dart';
import 'package:incluye_app/widgets/course_widget.dart';
import 'package:incluye_app/services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isStudent = false;

  @override
void initState() {
  super.initState();
  _checkRole();
}

Future<void> _checkRole() async {
  final isStudent = await ApiService.isStudent();
  setState(() {
    _isStudent = isStudent;
  });
}


  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: _isStudent ? 'Mis Asignaturas y Ajustes' : '',
      isStudent: _isStudent,
      body: _isStudent
          ? SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: const [
                  CourseWidget(
                    courseName: 'Cálculo II',
                    professor: 'Jorge Díaz',
                    adjustments: [
                      'Más tiempo en evaluaciones',
                      'Letras más grandes',
                      'Audífonos',
                    ],
                    onEdit: _onEditDemo,
                  ),
                  CourseWidget(
                    courseName: 'Álgebra II',
                    professor: 'Pablo Díaz',
                    adjustments: [
                      'Más tiempo en evaluaciones',
                      'Letras más grandes',
                      'Audífonos',
                    ],
                    onEdit: _onEditDemo,
                  ),
                  CourseWidget(
                    courseName: 'Química',
                    professor: 'Lionel Messi',
                    adjustments: [
                      'Más tiempo en evaluaciones',
                      'Letras más grandes',
                      'Audífonos',
                    ],
                    onEdit: _onEditDemo,
                  ),
                ],
              ),
            )
          : const Center(child: Text('Bienvenido, ¡debes iniciar sesión como estudiante!')),
    );
  }

  static void _onEditDemo() {
    // Demo: aquí ejecutarías Navigator.push(...) a la pantalla de edición
  }
}
