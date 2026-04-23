import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'auth_bridge_base.dart';

class _IoAuthBridge implements AuthBridge {
  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  @override
  Future<void> write({
    required String key,
    required String value,
    bool mirrorSessionCookie = false,
  }) {
    return _storage.write(key: key, value: value);
  }

  @override
  Future<String?> read(String key) {
    return _storage.read(key: key);
  }

  @override
  Future<void> delete(String key, {bool clearSessionCookie = false}) {
    return _storage.delete(key: key);
  }

  @override
  Future<void> deleteAll() {
    return _storage.deleteAll();
  }
}

AuthBridge createAuthBridge() => _IoAuthBridge();
