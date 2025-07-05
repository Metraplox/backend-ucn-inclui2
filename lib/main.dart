import 'package:flutter/material.dart';
import 'package:incluye_app/features/authentication/providers/auth_provider.dart';
import 'package:incluye_app/screens/splash_screen.dart';
import 'package:incluye_app/services/notification_service.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        // Aquí se podrían añadir otros providers en el futuro
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      scaffoldMessengerKey: NotificationService.messengerKey,
      title: 'Incluye UCN',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const SplashScreen(),
    );
  }
}
