import 'package:flutter/material.dart';
import 'package:incluye_app/screens/auth/login_screen.dart';
import 'package:incluye_app/screens/home_screen.dart';
import 'package:incluye_app/services/api_service.dart';
import 'package:incluye_app/services/notification_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
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
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.indigo,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      debugShowCheckedModeBanner: false,
      scaffoldMessengerKey: NotificationService.messengerKey,
      home: FutureBuilder<Widget>(
        future: _getInitialScreen(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return snapshot.data!;
          } else {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
        },
      ),
    );
  }
}
