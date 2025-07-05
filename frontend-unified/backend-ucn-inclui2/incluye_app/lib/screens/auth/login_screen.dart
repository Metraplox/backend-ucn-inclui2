// screens/login_screen.dart
// import 'dart:developer'; // Ya no es necesario para print
import 'package:flutter/material.dart';
import 'package:incluye_app/screens/home_screen.dart';
import 'package:incluye_app/config/app_config.dart';
import 'package:incluye_app/config/test_credentials.dart';
import 'package:incluye_app/screens/auth/teacher_register_screen.dart';
import 'package:incluye_app/utils/validators.dart';
import 'package:incluye_app/features/authentication/providers/auth_provider.dart';
import 'package:provider/provider.dart';

// import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool _rememberMe = false;

  Future<void> _handleLogin(BuildContext context) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    final success = await authProvider.login(email, password, _rememberMe);

    if (!context.mounted) return;

    if (success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    }
  }

  Future<void> _handleGoogleSignIn(BuildContext context) async {
    // Esta función se deja como placeholder para una futura implementación
    // con el AuthProvider.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Inicio de sesión con Google no implementado con Provider.',
        ),
        backgroundColor: Colors.amber,
      ),
    );
  }

  @override
  void initState() {
    super.initState();
  }

  Widget _buildTestCredentialChip(
    BuildContext context,
    String label,
    String email,
    String password,
  ) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return ActionChip(
      label: Text(label),
      tooltip: '$email / $password',
      onPressed: () {
        if (authProvider.isLoading) return;
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
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final isLoading = authProvider.isLoading;

        return Scaffold(
          body: LayoutBuilder(
            builder: (context, constraints) {
              final formWidth =
                  constraints.maxWidth < 400
                      ? constraints.maxWidth * 0.9
                      : 400.0;
              return Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: formWidth),
                    child: Form(
                      key: _formKey,
                      autovalidateMode: AutovalidateMode.onUserInteraction,
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
                          Text(
                            'Inicio de sesión',
                            style: theme.textTheme.titleLarge,
                          ),
                          const SizedBox(height: 24),
                          TextFormField(
                            controller: emailController,
                            decoration: const InputDecoration(
                              labelText: 'RUT / Email Institucional',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.email),
                            ),
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            enabled: !isLoading,
                            validator: Validators.validateEmail,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: passwordController,
                            decoration: const InputDecoration(
                              labelText: 'Contraseña',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.lock),
                            ),
                            obscureText: true,
                            textInputAction: TextInputAction.done,
                            onFieldSubmitted:
                                isLoading ? null : (_) => _handleLogin(context),
                            enabled: !isLoading,
                            validator:
                                (value) => Validators.validateNotEmpty(
                                  value,
                                  'La contraseña',
                                ),
                          ),
                          const SizedBox(height: 16),
                          CheckboxListTile(
                            title: const Text('Recordar sesión'),
                            value: _rememberMe,
                            onChanged: (newValue) {
                              if (isLoading) return;
                              setState(() {
                                _rememberMe = newValue ?? false;
                              });
                            },
                            controlAffinity: ListTileControlAffinity.leading,
                            contentPadding: EdgeInsets.zero,
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
                                  isLoading
                                      ? null
                                      : () => _handleLogin(context),
                              child:
                                  isLoading
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
                              icon: const Icon(
                                Icons.g_mobiledata,
                              ), // Placeholder icon
                              label: const Text('Iniciar sesión con Google'),
                              onPressed:
                                  isLoading
                                      ? null
                                      : () => _handleGoogleSignIn(context),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: Colors.black,
                                side: const BorderSide(color: Colors.grey),
                              ),
                            ),
                          ),
                          if (authProvider.errorMessage != null) ...[
                            const SizedBox(height: 16),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8.0,
                              ),
                              child: Text(
                                authProvider.errorMessage!,
                                style: const TextStyle(color: Colors.red),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                          const SizedBox(height: 24),
                          const Text('¿No tienes cuenta?'),
                          TextButton(
                            onPressed:
                                isLoading
                                    ? null
                                    : () => Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder:
                                            (_) =>
                                                const TeacherRegisterScreen(),
                                      ),
                                    ),
                            child: const Text('Regístrate aquí como docente'),
                          ),
                          if (AppConfig.isDevelopment)
                            Wrap(
                              spacing: 8.0,
                              alignment: WrapAlignment.center,
                              children: [
                                _buildTestCredentialChip(
                                  context,
                                  'Estudiante',
                                  TestCredentials.studentEmail,
                                  TestCredentials.studentPassword,
                                ),
                                _buildTestCredentialChip(
                                  context,
                                  'Docente',
                                  TestCredentials.teacherEmail,
                                  TestCredentials.teacherPassword,
                                ),
                                _buildTestCredentialChip(
                                  context,
                                  'Coordinador',
                                  TestCredentials.coordinadoraEmail,
                                  TestCredentials.coordinadoraPassword,
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
