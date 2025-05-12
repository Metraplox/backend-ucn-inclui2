import 'package:flutter/material.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/screens/home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  String? errorMessage;

  Future<void> _handleLogin() async {
    final response = await ApiService.login(
      emailController.text.trim(),
      passwordController.text.trim(),
    );

    if (response != null && response.containsKey('access_token')) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const HomeScreen()),
      );
    } else {
      setState(() {
        errorMessage = 'Credenciales inválidas';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: emailController,
              decoration: const InputDecoration(labelText: 'Correo'),
            ),
            TextField(
              controller: passwordController,
              decoration: const InputDecoration(labelText: 'Contraseña'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _handleLogin,
              child: const Text('Iniciar sesión'),
            ),
            if (errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(errorMessage!, style: const TextStyle(color: Colors.red)),
              ),
          ],
        ),
      ),
    );
  }
}
