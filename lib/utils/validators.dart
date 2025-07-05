class Validators {
  static String? validateNotEmpty(
    String? value, [
    String fieldName = 'El campo',
  ]) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName no puede estar vacío.';
    }
    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'El correo electrónico no puede estar vacío.';
    }
    final emailRegex = RegExp(
      r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+",
    );
    if (!emailRegex.hasMatch(value)) {
      return 'Por favor, introduce un correo electrónico válido.';
    }
    return null;
  }

  static String? validatePassword(String? value, [int minLength = 8]) {
    if (value == null || value.isEmpty) {
      return 'La contraseña no puede estar vacía.';
    }
    if (value.length < minLength) {
      return 'La contraseña debe tener al menos $minLength caracteres.';
    }
    // Check for uppercase letter
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Debe contener al menos una mayúscula.';
    }
    // Check for lowercase letter
    if (!value.contains(RegExp(r'[a-z]'))) {
      return 'Debe contener al menos una minúscula.';
    }
    // Check for digit
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Debe contener al menos un número.';
    }
    return null;
  }

  static String? validateConfirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) {
      return 'Por favor, confirma tu contraseña.';
    }
    if (value != password) {
      return 'Las contraseñas no coinciden.';
    }
    return null;
  }
}
