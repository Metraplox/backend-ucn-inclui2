import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  const StorageService();

  final _storage = const FlutterSecureStorage();

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: 'accessToken', value: accessToken);
    await _storage.write(key: 'refreshToken', value: refreshToken);
  }

  Future<void> saveUserData({
    required String name,
    required String email,
    required String role,
  }) async {
    await _storage.write(key: 'userName', value: name);
    await _storage.write(key: 'userEmail', value: email);
    await _storage.write(key: 'userRole', value: role);
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: 'accessToken');
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: 'refreshToken');
  }

  Future<String?> getUserName() async {
    return await _storage.read(key: 'userName');
  }

  Future<String?> getUserEmail() async {
    return await _storage.read(key: 'userEmail');
  }

  Future<String?> getUserRole() async {
    return await _storage.read(key: 'userRole');
  }

  Future<void> clearTokens() async {
    await _storage.deleteAll();
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
