import 'package:flutter/material.dart';
import 'package:incluye_app/screens/auth/login_screen.dart';
import 'package:incluye_app/screens/home_screen.dart';
import 'package:incluye_app/services/api_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  Future<Widget> _getInitialScreen() async {
    final token = await ApiService.getToken();
    if (token != null) {
      return const HomeScreen();
    } else {
      return const LoginScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Inclui2',
      theme: ThemeData(primarySwatch: Colors.indigo),
      home: FutureBuilder<Widget>(
        future: _getInitialScreen(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return snapshot.data!;
          } else {
            return const Center(child: CircularProgressIndicator());
          }
        },
      ),
    );
  }
}
