import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/screens/home_screen.dart';
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/config/test_credentials.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  String? errorMessage;
  bool _loading = false;

  Future<void> _handleLogin() async {
    setState(() {
      _loading = true;
      errorMessage = null;
    });
    
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    
    log('Intentando login con: $email / ${password.replaceAll(RegExp(r'.'), '*')}');
    log('URL API: ${AppConfig.apiBaseUrl}');
    
    try {
      final user = await AuthService.login(email, password);
      
      // Verificar si el widget sigue montado antes de actualizar el estado
      if (!mounted) return;
      
      if (user != null) {
        // Login exitoso
        log('Login exitoso: ${user.email} - Rol: ${user.rol}');
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Bienvenido/a ${user.name}'))
        );
        
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      } else {
        // Login fallido
        log('Login fallido para: $email');
        setState(() {
          errorMessage = 'Credenciales inválidas. Por favor, intente nuevamente.';
          _loading = false;
        });
      }
    } catch (e) {
      // Error durante el login
      log('Error de excepción en login: $e');
      if (!mounted) return;
      
      setState(() {
        errorMessage = 'Error de conexión: ${e.toString()}';
        _loading = false;
      });
    }
  }

  // Método para construir chips de credenciales de prueba
  Widget _buildTestCredentialChip(String label, String email, String password) {
    return ActionChip(
      label: Text(label),
      tooltip: '$email / $password',
      onPressed: () {
        setState(() {
          emailController.text = email;
          passwordController.text = password;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          // maxWidth para el formulario
          final formWidth = constraints.maxWidth < 400
              ? constraints.maxWidth * 0.9
              : 400.0;
          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: formWidth),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'IncluyeUCN',
                      style: theme.textTheme.headlineMedium
                          ?.copyWith(fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    // Logo UCN
                    Image.asset(
                      'assets/logo_ucn.png',
                      height: 120,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Inicio de sesión',
                      style: theme.textTheme.titleLarge,
                    ),
                    const SizedBox(height: 24),
                    TextField(
                      controller: emailController,
                      decoration: const InputDecoration(
                        labelText: 'RUT / Email Institucional',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.email),
                      ),
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: passwordController,
                      decoration: const InputDecoration(
                        labelText: 'Contraseña',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.lock),
                      ),
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => _handleLogin(),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          foregroundColor: Colors.white,
                        ),
                        onPressed: _loading ? null : _handleLogin,
                        child: _loading
                            ? const CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation(Colors.white),
                              )
                            : const Text('Ingresar'),
                      ),
                    ),
                    if (AppConfig.isDevelopment) ...[  // Solo mostrar en desarrollo
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 8),
                      const Text('Credenciales de prueba:', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        alignment: WrapAlignment.center,
                        children: [
                          for (final cred in TestCredentials.allCredentials)
                            _buildTestCredentialChip(cred['label']!, cred['email']!, cred['password']!),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text('API URL: ${AppConfig.apiBaseUrl}', 
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Text('Ambiente: ${AppConfig.currentEnvironment.name}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                    if (errorMessage != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
