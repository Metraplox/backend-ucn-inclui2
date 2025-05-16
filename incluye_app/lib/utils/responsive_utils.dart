import 'package:flutter/material.dart';

/// Clase de utilidad para manejar la responsividad en la aplicación
class ResponsiveUtils {
  /// Determina si el dispositivo es móvil basado en el ancho de la pantalla
  static bool isMobile(BuildContext context) {
    return MediaQuery.of(context).size.width < 600;
  }

  /// Determina si el dispositivo es tablet basado en el ancho de la pantalla
  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= 600 && width < 900;
  }

  /// Determina si el dispositivo es desktop basado en el ancho de la pantalla
  static bool isDesktop(BuildContext context) {
    return MediaQuery.of(context).size.width >= 900;
  }

  /// Obtiene el padding adecuado según el tipo de dispositivo
  static double getPadding(BuildContext context) {
    if (isMobile(context)) return 12.0;
    if (isTablet(context)) return 16.0;
    return 20.0;
  }

  /// Obtiene el tamaño de fuente para títulos según el tipo de dispositivo
  static double getTitleFontSize(BuildContext context) {
    if (isMobile(context)) return 18.0;
    if (isTablet(context)) return 20.0;
    return 22.0;
  }

  /// Obtiene la altura de botón adecuada según el tipo de dispositivo
  static double getButtonHeight(BuildContext context) {
    return isMobile(context) ? 44.0 : 48.0;
  }

  /// Obtiene la elevación de tarjetas según el tipo de dispositivo
  static double getCardElevation(BuildContext context) {
    return isMobile(context) ? 1.0 : 2.0;
  }

  /// Obtiene el espaciado entre columnas en tablas según el tipo de dispositivo
  static double getColumnSpacing(BuildContext context) {
    return isMobile(context) ? 16.0 : 24.0;
  }

  /// Obtiene el margen horizontal en tablas según el tipo de dispositivo
  static double getHorizontalMargin(BuildContext context) {
    return isMobile(context) ? 8.0 : 12.0;
  }

  /// Obtiene el tamaño de fuente para texto en tablas según el tipo de dispositivo
  static double getTableFontSize(BuildContext context) {
    return isMobile(context) ? 13.0 : 14.0;
  }
}
