abstract class AuthBridge {
  Future<void> write({
    required String key,
    required String value,
    bool mirrorSessionCookie = false,
  });

  Future<String?> read(String key);

  Future<void> delete(String key, {bool clearSessionCookie = false});

  Future<void> deleteAll();
}
