import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';

import '../services/auth_bridge.dart';

class RememberedLogin {
  const RememberedLogin({
    required this.identifier,
    required this.email,
    required this.displayName,
  });

  final String identifier;
  final String email;
  final String displayName;
}

class SecureStorageService {
  SecureStorageService({AuthBridge? authBridge})
    : _authBridge = authBridge ?? createAuthBridge();

  static const _accessTokenKey = 'br9_access_token';
  static const _refreshTokenKey = 'br9_refresh_token';
  static const _pinKey = 'br9_pin';
  static const _trustedDeviceKey = 'br9_trusted_device';
  static const _deviceIdKey = 'br9_device_id';
  static const _rememberedIdentifierKey = 'br9_login_identifier';
  static const _rememberedEmailKey = 'br9_login_email';
  static const _rememberedDisplayKey = 'br9_login_display';
  static const _quickUnlockPinKey = 'br9_quick_unlock_pin';

  final AuthBridge _authBridge;

  Future<void> saveAccessToken(String token) {
    final encoded = base64UrlEncode(utf8.encode(token));
    return _authBridge.write(
      key: _accessTokenKey,
      value: encoded,
      mirrorSessionCookie: true,
    );
  }

  Future<String?> readAccessToken() async {
    final encoded = await _authBridge.read(_accessTokenKey);
    if (encoded == null || encoded.isEmpty) {
      return null;
    }
    return utf8.decode(base64Url.decode(encoded));
  }

  Future<void> saveRefreshToken(String token) {
    final encoded = base64UrlEncode(utf8.encode(token));
    return _authBridge.write(
      key: _refreshTokenKey,
      value: encoded,
      mirrorSessionCookie: true,
    );
  }

  Future<String?> readRefreshToken() async {
    final encoded = await _authBridge.read(_refreshTokenKey);
    if (encoded == null || encoded.isEmpty) {
      return null;
    }
    return utf8.decode(base64Url.decode(encoded));
  }

  Future<void> saveAuthTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await saveAccessToken(accessToken);
    await saveRefreshToken(refreshToken);
  }

  Future<void> clearAuthTokens() async {
    await _authBridge.delete(_accessTokenKey, clearSessionCookie: true);
    await _authBridge.delete(_refreshTokenKey, clearSessionCookie: true);
  }

  Future<void> savePin(String pin) {
    final hashedPin = sha256.convert(utf8.encode(pin)).toString();
    return _authBridge.write(key: _pinKey, value: hashedPin);
  }

  Future<String?> readPin() {
    return _authBridge.read(_pinKey);
  }

  Future<bool> hasPin() async {
    final pinHash = await readPin();
    return pinHash != null && pinHash.isNotEmpty;
  }

  Future<bool> verifyPin(String pin) async {
    final storedHash = await readPin();
    if (storedHash == null || storedHash.isEmpty) {
      return false;
    }
    final inputHash = sha256.convert(utf8.encode(pin)).toString();
    return storedHash == inputHash;
  }

  Future<void> clearPin() {
    return _authBridge.delete(_pinKey);
  }

  Future<void> saveTrustedDevice(String deviceId) {
    return _authBridge.write(key: _trustedDeviceKey, value: deviceId);
  }

  Future<String?> readTrustedDevice() {
    return _authBridge.read(_trustedDeviceKey);
  }

  Future<String> readOrCreateDeviceId() async {
    final existing = await _authBridge.read(_deviceIdKey);
    if (existing != null && existing.isNotEmpty) {
      return existing;
    }

    final random = Random.secure();
    final bytes = List<int>.generate(24, (_) => random.nextInt(256));
    final deviceId = 'br9-${base64UrlEncode(bytes).replaceAll('=', '')}';
    await _authBridge.write(key: _deviceIdKey, value: deviceId);
    return deviceId;
  }

  Future<void> saveRememberedLogin({
    required String identifier,
    required String email,
    required String displayName,
  }) async {
    await _authBridge.write(
      key: _rememberedIdentifierKey,
      value: identifier,
      mirrorSessionCookie: true,
    );
    await _authBridge.write(
      key: _rememberedEmailKey,
      value: email,
      mirrorSessionCookie: true,
    );
    await _authBridge.write(
      key: _rememberedDisplayKey,
      value: displayName,
      mirrorSessionCookie: true,
    );
  }

  Future<RememberedLogin?> readRememberedLogin() async {
    final identifier = await _authBridge.read(_rememberedIdentifierKey);
    final email = await _authBridge.read(_rememberedEmailKey);
    final displayName = await _authBridge.read(_rememberedDisplayKey);
    if (identifier == null ||
        identifier.isEmpty ||
        email == null ||
        email.isEmpty ||
        displayName == null ||
        displayName.isEmpty) {
      return null;
    }

    return RememberedLogin(
      identifier: identifier,
      email: email,
      displayName: displayName,
    );
  }

  Future<void> clearRememberedLogin() async {
    await _authBridge.delete(_rememberedIdentifierKey);
    await _authBridge.delete(_rememberedEmailKey);
    await _authBridge.delete(_rememberedDisplayKey);
  }

  Future<void> saveQuickUnlockPin(String pin) {
    final hashedPin = sha256.convert(utf8.encode(pin)).toString();
    return _authBridge.write(key: _quickUnlockPinKey, value: hashedPin);
  }

  Future<bool> hasQuickUnlockPin() async {
    final hash = await _authBridge.read(_quickUnlockPinKey);
    return hash != null && hash.isNotEmpty;
  }

  Future<bool> verifyQuickUnlockPin(String pin) async {
    final storedHash = await _authBridge.read(_quickUnlockPinKey);
    if (storedHash == null || storedHash.isEmpty) {
      return false;
    }
    final inputHash = sha256.convert(utf8.encode(pin)).toString();
    return storedHash == inputHash;
  }

  Future<void> clearQuickUnlockPin() {
    return _authBridge.delete(_quickUnlockPinKey);
  }

  Future<bool> hasStoredSession() async {
    final accessToken = await readAccessToken();
    final refreshToken = await readRefreshToken();
    return (accessToken != null && accessToken.isNotEmpty) ||
        (refreshToken != null && refreshToken.isNotEmpty);
  }

  Future<void> saveJwtToken(String token) => saveAccessToken(token);

  Future<String?> readJwtToken() => readAccessToken();

  Future<void> clearAll() {
    return _authBridge.deleteAll();
  }
}
