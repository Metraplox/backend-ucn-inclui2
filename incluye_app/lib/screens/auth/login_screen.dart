// screens/login_screen.dart
// import 'dart:developer'; // Ya no es necesario para print
import 'package:flutter/material.dart';
import 'package:incluye_app/services/auth_service.dart';
import 'package:incluye_app/screens/home_screen.dart';
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/config/test_credentials.dart';
// import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  String? errorMessage;
  bool _isLoading = false; // Para login normal
  bool _isGoogleLoading = false; // Para login con Google

  Future<void> _handleLogin() async {
    // Prevenir múltiples envíos
    if (_isLoading || _isGoogleLoading) {
      //print('LOGIN_SCREEN (_handleLogin): Operación de login ya en curso.');
      return;
    }

    setState(() {
      _isLoading = true;
      errorMessage = null;
    });

    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    //print('LOGIN_SCREEN (_handleLogin): Intentando login con: $email / ${password.replaceAll(RegExp(r'.'), '*')}');
    //print('LOGIN_SCREEN (_handleLogin): URL API: ${AppConfig.apiBaseUrl}');

    try {
      final user = await AuthService.login(email, password);
      print(email);
      print(password);

      if (!mounted) return;

      if (user != null) {
        //print('LOGIN_SCREEN (_handleLogin): Login exitoso: ${user.email} - Roles: ${user.roles.join(', ')}');
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Bienvenido/a ${user.name}')));
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      } else {
        //print('LOGIN_SCREEN (_handleLogin): Login fallido para: $email (AuthService.login devolvió null)');
        setState(() {
          errorMessage =
              'Credenciales inválidas. Por favor, intente nuevamente.';
        });
      }
    } catch (e, s) {
      //print('LOGIN_SCREEN (_handleLogin): Excepción en _handleLogin: $e');
      //print('LOGIN_SCREEN (_handleLogin): Stacktrace: $s');
      if (!mounted) return;
      setState(() {
        errorMessage = 'Error de conexión: ${e.toString()}';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        //print("LOGIN_SCREEN (_handleLogin): _isLoading puesto a false.");
      }
    }
  }

  Future<void> _handleGoogleSignIn() async {
    //print("LOGIN_SCREEN (_handleGoogleSignIn): Botón de Google presionado. _isGoogleLoading: $_isGoogleLoading, _isLoading: $_isLoading");

    if (_isLoading || _isGoogleLoading) {
      //  print("LOGIN_SCREEN (_handleGoogleSignIn): Ya hay una operación de login en curso.");
      return;
    }

    setState(() {
      _isGoogleLoading = true;
      errorMessage = null;
    });

    try {
      // print("LOGIN_SCREEN (_handleGoogleSignIn): Llamando a AuthService.loginWithGoogle()...");
      final user =
          await AuthService.loginWithGoogle(); // Esta es la llamada importante

      //print("LOGIN_SCREEN (_handleGoogleSignIn): AuthService.loginWithGoogle() completado. User devuelto: ${user?.email ?? "null"}");

      if (!mounted) return; // Verificar si el widget sigue montado

      if (user != null) {
        //print('LOGIN_SCREEN (_handleGoogleSignIn): Login con Google exitoso vía AuthService: ${user.email} - Roles: ${user.roles.join(', ')}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Bienvenido/a ${user.name} (vía Google)')),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      } else {
        //print('LOGIN_SCREEN (_handleGoogleSignIn): Login con Google fallido (AuthService.loginWithGoogle devolvió null).');
        setState(() {
          errorMessage =
              'Tu cuenta de Google no está registrada en el sistema o no ha sido vinculada. Contacta al administrador.';
        });
      }
    } catch (e, s) {
      //print('LOGIN_SCREEN (_handleGoogleSignIn): Excepción en _handleGoogleSignIn (después de llamar a AuthService): $e');
      //print('LOGIN_SCREEN (_handleGoogleSignIn): Stacktrace: $s');
      if (!mounted) return; // Verificar si el widget sigue montado
      setState(() {
        errorMessage =
            'Error inesperado al intentar iniciar sesión con Google: ${e.toString()}';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isGoogleLoading = false;
        });
        print(
          "LOGIN_SCREEN (_handleGoogleSignIn): _isGoogleLoading puesto a false.",
        );
      }
    }
  }

  Widget _buildTestCredentialChip(String label, String email, String password) {
    return ActionChip(
      label: Text(label),
      tooltip: '$email / $password',
      onPressed: () {
        if (_isLoading || _isGoogleLoading) return;
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
          final formWidth =
              constraints.maxWidth < 400 ? constraints.maxWidth * 0.9 : 400.0;
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
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    Image.asset('assets/logo_ucn.png', height: 120),
                    const SizedBox(height: 24),
                    Text('Inicio de sesión', style: theme.textTheme.titleLarge),
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
                      enabled: !_isLoading && !_isGoogleLoading,
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
                      onSubmitted:
                          (_isLoading || _isGoogleLoading)
                              ? null
                              : (_) => _handleLogin(),
                      enabled: !_isLoading && !_isGoogleLoading,
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
                        onPressed:
                            (_isLoading || _isGoogleLoading)
                                ? null
                                : _handleLogin,
                        child:
                            _isLoading
                                ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation(
                                      Colors.white,
                                    ),
                                    strokeWidth: 3,
                                  ),
                                )
                                : const Text('Ingresar'),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        icon:
                            _isGoogleLoading
                                ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                                : Image.asset(
                                  'assets/google_logo.png',
                                  height: 20.0,
                                  width: 20.0,
                                ),
                        label: const Text('Ingresar con Google'),
                        onPressed:
                            (_isLoading || _isGoogleLoading)
                                ? null
                                : _handleGoogleSignIn,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.grey[700],
                          side: BorderSide(color: Colors.grey[300]!),
                        ),
                      ),
                    ),
                    if (AppConfig.isDevelopment) ...[
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 8),
                      const Text(
                        'Credenciales de prueba:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        alignment: WrapAlignment.center,
                        children: [
                          for (final cred in TestCredentials.allCredentials)
                            _buildTestCredentialChip(
                              cred['label']!,
                              cred['email']!,
                              cred['password']!,
                            ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'API URL: ${AppConfig.apiBaseUrl}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Ambiente: ${AppConfig.currentEnvironment.name}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                    if (errorMessage != null) ...[
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8.0),
                        child: Text(
                          errorMessage!,
                          style: const TextStyle(color: Colors.red),
                          textAlign: TextAlign.center,
                        ),
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
