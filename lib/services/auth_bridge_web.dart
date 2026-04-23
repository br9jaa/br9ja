// ignore_for_file: deprecated_member_use, avoid_web_libraries_in_flutter

import 'dart:html' as html;

import 'auth_bridge_base.dart';

class _WebAuthBridge implements AuthBridge {
  static const _sessionCookieName = 'br9_web_session';

  @override
  Future<void> write({
    required String key,
    required String value,
    bool mirrorSessionCookie = false,
  }) async {
    html.window.localStorage[key] = value;
    if (mirrorSessionCookie) {
      _setCookie(_sessionCookieName, 'active');
    }
  }

  @override
  Future<String?> read(String key) async {
    return html.window.localStorage[key];
  }

  @override
  Future<void> delete(String key, {bool clearSessionCookie = false}) async {
    html.window.localStorage.remove(key);
    if (clearSessionCookie) {
      _clearCookie(_sessionCookieName);
    }
  }

  @override
  Future<void> deleteAll() async {
    html.window.localStorage.clear();
    _clearCookie(_sessionCookieName);
  }

  void _setCookie(String key, String value) {
    html.document.cookie =
        '$key=$value; Path=/; Max-Age=2592000; SameSite=Strict; Secure';
  }

  void _clearCookie(String key) {
    html.document.cookie = '$key=; Path=/; Max-Age=0; SameSite=Strict; Secure';
  }
}

AuthBridge createAuthBridge() => _WebAuthBridge();
