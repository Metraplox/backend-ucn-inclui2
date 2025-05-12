import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/screens/auth/login_screen.dart';


class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _logout(BuildContext context) async {
    await ApiService.logout();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inicio'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: () => _logout(context),
          )
        ],
      ),
      body: const Center(
        child: Text(
          '¡Sesión iniciada correctamente!',
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}
