import 'package:logger/logger.dart';

final Logger log = Logger(
  // Puedes ajustar configuración si necesitas más nivel
  printer: PrettyPrinter(
    methodCount: 0,
    errorMethodCount: 5,
    lineLength: 80,
    colors: true,
    printEmojis: false,
    dateTimeFormat: DateTimeFormat.none,  // Using dateTimeFormat instead of printTime
  ),
);
