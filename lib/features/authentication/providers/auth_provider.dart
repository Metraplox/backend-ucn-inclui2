import 'package:flutter/material.dart';
import 'package:incluye_app/models/user_model.dart';
import 'package:incluye_app/services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _errorMessage;
  String? _activeRole;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _user != null;
  String? get activeRole => _activeRole;

  final AuthService _authService = AuthService.instance;

  Future<bool> login(String email, String password, bool rememberMe) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final loggedInUser = await _authService.login(
        email,
        password,
        rememberMe,
      );
      if (loggedInUser != null) {
        _user = loggedInUser;
        // Set the active role to the first role by default
        _activeRole =
            loggedInUser.roles.isNotEmpty ? loggedInUser.roles.first : null;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = "Credenciales inválidas.";
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = "Error de conexión: ${e.toString()}";
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _activeRole = null;
    notifyListeners();
  }

  Future<bool> tryAutoLogin() async {
    _isLoading = true;
    notifyListeners();

    final success = await _authService.tryAutoLogin();
    if (success) {
      _user = await _authService.getLoggedInUser();
      // Set the active role to the first role by default
      _activeRole = _user?.roles.isNotEmpty == true ? _user!.roles.first : null;
    }

    _isLoading = false;
    notifyListeners();

    return success;
  }

  void setActiveRole(String role) {
    if (_user != null && _user!.roles.contains(role)) {
      _activeRole = role;
      notifyListeners();
    }
  }
}
