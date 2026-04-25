import 'package:flutter/foundation.dart';

import '../core/api/br9_api_client.dart';
import '../models/user_model.dart';
import 'secure_storage_service.dart';

class AuthProvider extends ChangeNotifier {
  static const bool _demoAccessEnabled = bool.fromEnvironment(
    'DEMO_ACCESS',
    defaultValue: false,
  );
  static const String _demoLoginIdentifier = String.fromEnvironment(
    'DEMO_LOGIN_IDENTIFIER',
    defaultValue: 'demo@br9.ng',
  );
  static const String _demoLoginPassword = String.fromEnvironment(
    'DEMO_LOGIN_PASSWORD',
    defaultValue: 'BR9demo!2026',
  );
  static const String _demoAccessToken = 'demo-access-token';
  static const String _demoRefreshToken = 'demo-refresh-token';

  AuthProvider({
    SecureStorageService? secureStorageService,
    BR9ApiClient? apiClient,
  }) : _secureStorageService = secureStorageService ?? SecureStorageService(),
       _apiClient = apiClient ?? BR9ApiClient.instance {
    _apiClient.registerUnauthorizedHandler(_handleUnauthorized);
  }

  final SecureStorageService _secureStorageService;
  final BR9ApiClient _apiClient;

  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _accessToken;
  String? _refreshToken;
  String? _errorMessage;
  bool _requiresSecureDeviceTransfer = false;
  String? _sessionTransferMessage;
  UserProfile? _userProfile;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get jwtToken => _accessToken;
  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  String? get errorMessage => _errorMessage;
  bool get requiresSecureDeviceTransfer => _requiresSecureDeviceTransfer;
  String? get sessionTransferMessage => _sessionTransferMessage;
  UserProfile? get userProfile => _userProfile;

  Future<void> tryAutoLogin() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    _accessToken = await _secureStorageService.readAccessToken();
    _refreshToken = await _secureStorageService.readRefreshToken();

    if ((_accessToken == null || _accessToken!.isEmpty) &&
        (_refreshToken == null || _refreshToken!.isEmpty)) {
      _isLoading = false;
      notifyListeners();
      return;
    }

    if (_usesDemoSession()) {
      _restoreDemoSession();
      _isLoading = false;
      notifyListeners();
      return;
    }

    var profileLoaded = await _fetchLatestProfile();
    if (!profileLoaded && _refreshToken != null && _refreshToken!.isNotEmpty) {
      final refreshed = await _refreshSession();
      if (refreshed) {
        profileLoaded = await _fetchLatestProfile();
      }
    }

    if (!profileLoaded) {
      await _clearSession(notify: false);
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login({
    required String identifier,
    required String password,
    required bool rememberMe,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final deviceId = await _secureStorageService.readOrCreateDeviceId();
      final response = await _apiClient.post(
        '/api/auth/login',
        data: {
          'identifier': identifier.trim(),
          'email': identifier.trim(),
          'username': identifier.trim(),
          'password': password,
          'rememberMe': rememberMe,
          'deviceId': deviceId,
          'platform': kIsWeb ? 'web' : 'mobile',
        },
      );
      final data = _unwrapData(response);
      await _applySessionData(
        data,
        rememberedIdentifier: identifier.trim(),
        rememberMe: rememberMe,
      );
      await _secureStorageService.saveTrustedDevice(deviceId);
      _isLoading = false;
      notifyListeners();
      return true;
    } on BR9ApiException catch (error) {
      final demoLoggedIn = await _maybeLoginWithDemoUser(
        identifier: identifier,
        password: password,
        rememberMe: rememberMe,
      );
      if (demoLoggedIn) {
        return true;
      }
      _errorMessage = error.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (_) {
      final demoLoggedIn = await _maybeLoginWithDemoUser(
        identifier: identifier,
        password: password,
        rememberMe: rememberMe,
      );
      if (demoLoggedIn) {
        return true;
      }
      _errorMessage = 'Unable to sign in right now. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>?> sendPhoneVerificationCode(
    String phoneNumber,
  ) async {
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.sendPhoneVerification(
        phoneNumber: phoneNumber,
      );
      return _unwrapData(response);
    } on BR9ApiException catch (error) {
      _errorMessage = error.message;
      notifyListeners();
      return null;
    }
  }

  Future<String?> verifyPhoneCode({
    required String phoneNumber,
    required String code,
  }) async {
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.verifyPhoneCode(
        phoneNumber: phoneNumber,
        code: code,
      );
      final data = _unwrapData(response);
      return data['phoneVerificationToken']?.toString();
    } on BR9ApiException catch (error) {
      _errorMessage = error.message;
      notifyListeners();
      return null;
    }
  }

  Future<bool> register({
    required String fullName,
    required String username,
    required String email,
    required String phoneNumber,
    required String password,
    required String pin,
    required String phoneVerificationToken,
    String? referralCode,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final deviceId = await _secureStorageService.readOrCreateDeviceId();
      final response = await _apiClient.registerAccount(
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password,
        pin: pin,
        phoneVerificationToken: phoneVerificationToken,
        referralCode: referralCode?.trim(),
        deviceId: deviceId,
      );
      final data = _unwrapData(response);

      await _applySessionData(
        data,
        rememberedIdentifier: username.trim().isNotEmpty
            ? username.trim()
            : email.trim(),
        rememberMe: true,
      );
      await _secureStorageService.saveTrustedDevice(deviceId);
      await _secureStorageService.saveQuickUnlockPin(pin);
      await _secureStorageService.savePin(pin);

      _isLoading = false;
      notifyListeners();
      return true;
    } on BR9ApiException catch (error) {
      _errorMessage = error.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (_) {
      _errorMessage = 'Unable to create your account right now.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _clearSession();
  }

  Future<bool> restoreSessionAfterQuickUnlock() async {
    await tryAutoLogin();
    return _isAuthenticated;
  }

  Future<void> forgetRememberedLogin() async {
    await _secureStorageService.clearRememberedLogin();
    await _secureStorageService.clearQuickUnlockPin();
    notifyListeners();
  }

  Future<void> _applySessionData(
    Map<String, dynamic> data, {
    required String rememberedIdentifier,
    required bool rememberMe,
  }) async {
    final accessToken = (data['accessToken'] ?? '').toString();
    final refreshToken = (data['refreshToken'] ?? '').toString();
    final userMap =
        (data['user'] as Map<String, dynamic>?) ?? <String, dynamic>{};

    _accessToken = accessToken;
    _refreshToken = refreshToken;
    _userProfile = UserProfile.fromJson(userMap);
    _isAuthenticated = true;
    _errorMessage = null;
    final sessionTransfer =
        data['sessionTransfer'] as Map<String, dynamic>? ?? <String, dynamic>{};
    _requiresSecureDeviceTransfer = sessionTransfer['required'] == true;
    _sessionTransferMessage = sessionTransfer['message']?.toString();

    await _secureStorageService.saveAuthTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );

    if (rememberMe && _userProfile != null) {
      await _secureStorageService.saveRememberedLogin(
        identifier: rememberedIdentifier,
        email: _userProfile!.email,
        displayName: _userProfile!.fullName,
      );
    } else if (!rememberMe) {
      await _secureStorageService.clearRememberedLogin();
      await _secureStorageService.clearQuickUnlockPin();
    }

    notifyListeners();
  }

  Future<bool> _fetchLatestProfile() async {
    try {
      final response = await _apiClient.get('/api/user/profile');
      final data = _unwrapData(response);
      _userProfile = UserProfile.fromJson(data);
      _isAuthenticated = true;
      _errorMessage = null;
      return true;
    } on BR9ApiException {
      return false;
    }
  }

  Future<bool> refreshProfile() async {
    final loaded = await _fetchLatestProfile();
    notifyListeners();
    return loaded;
  }

  Future<bool> _refreshSession() async {
    try {
      final response = await _apiClient.post(
        '/api/auth/refresh',
        data: {'refreshToken': _refreshToken},
      );
      final data = _unwrapData(response);
      _accessToken = (data['accessToken'] ?? '').toString();
      _refreshToken = (data['refreshToken'] ?? _refreshToken ?? '').toString();

      await _secureStorageService.saveAuthTokens(
        accessToken: _accessToken ?? '',
        refreshToken: _refreshToken ?? '',
      );
      return true;
    } on BR9ApiException catch (error) {
      _errorMessage = error.message;
      return false;
    }
  }

  Future<void> _handleUnauthorized() async {
    await _clearSession(notify: false);
    _errorMessage = 'Your session has expired. Please log in again.';
    notifyListeners();
    BR9ApiClient.navigatorKey.currentState?.pushNamedAndRemoveUntil(
      '/login',
      (_) => false,
    );
  }

  Future<void> _clearSession({bool notify = true}) async {
    _isAuthenticated = false;
    _accessToken = null;
    _refreshToken = null;
    _userProfile = null;
    _requiresSecureDeviceTransfer = false;
    _sessionTransferMessage = null;
    await _secureStorageService.clearAuthTokens();
    if (notify) {
      notifyListeners();
    }
  }

  Map<String, dynamic> _unwrapData(Map<String, dynamic> response) {
    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return data;
    }
    return response;
  }

  bool _usesDemoSession() {
    return _demoAccessEnabled &&
        ((_accessToken ?? '') == _demoAccessToken ||
            (_refreshToken ?? '') == _demoRefreshToken);
  }

  Future<bool> _maybeLoginWithDemoUser({
    required String identifier,
    required String password,
    required bool rememberMe,
  }) async {
    if (!_demoAccessEnabled) {
      return false;
    }

    final trimmedIdentifier = identifier.trim().toLowerCase();
    if (trimmedIdentifier != _demoLoginIdentifier.toLowerCase() ||
        password != _demoLoginPassword) {
      return false;
    }

    final demoProfile = _buildDemoUserProfile();
    _accessToken = _demoAccessToken;
    _refreshToken = _demoRefreshToken;
    _userProfile = demoProfile;
    _isAuthenticated = true;
    _errorMessage = null;
    _requiresSecureDeviceTransfer = false;
    _sessionTransferMessage = null;

    await _secureStorageService.saveAuthTokens(
      accessToken: _demoAccessToken,
      refreshToken: _demoRefreshToken,
    );

    if (rememberMe) {
      await _secureStorageService.saveRememberedLogin(
        identifier: demoProfile.email,
        email: demoProfile.email,
        displayName: demoProfile.fullName,
      );
      await _secureStorageService.saveQuickUnlockPin('246810');
    }

    _isLoading = false;
    notifyListeners();
    return true;
  }

  void _restoreDemoSession() {
    _userProfile = _buildDemoUserProfile();
    _isAuthenticated = true;
    _errorMessage = null;
    _requiresSecureDeviceTransfer = false;
    _sessionTransferMessage = null;
  }

  UserProfile _buildDemoUserProfile() {
    return UserProfile.fromJson({
      'id': 'demo-user-001',
      'fullName': 'Stan Kings',
      'email': _demoLoginIdentifier,
      'phoneNumber': '08030000001',
      'phoneVerified': true,
      'bayrightTag': '@stankings',
      'accountNumber': '1029384756',
      'virtualAccount': {
        'accountNumber': '1029384756',
        'bankName': 'GTBank',
        'accountName': 'BR9 - 08030000001',
        'provider': 'squad',
        'status': 'active',
      },
      'kycTier': 2,
      'walletBalance': 56390.26,
      'br9GoldPoints': 1280,
      'referralCode': 'STANKINGS',
      'isLivenessVerified': true,
      'passportPhotoDataUrl': '',
      'favoriteTeamIds': const <String>[],
      'transactions': [
        {
          'id': 'demo-tx-1',
          'reference': 'BR9-ELEC-10024',
          'title': 'Electricity Payment',
          'description': 'PHCN',
          'type': 'debit',
          'status': 'success',
          'amount': 12000,
          'balanceAfter': 68390.26,
          'createdAt': DateTime.now()
              .subtract(const Duration(hours: 2))
              .toIso8601String(),
        },
        {
          'id': 'demo-tx-2',
          'reference': 'BR9-AIR-0915',
          'title': 'Airtime Purchase',
          'description': 'MTN Nigeria',
          'type': 'debit',
          'status': 'success',
          'amount': 1500,
          'balanceAfter': 56390.26,
          'createdAt': DateTime.now()
              .subtract(const Duration(hours: 3))
              .toIso8601String(),
        },
      ],
    });
  }
}
