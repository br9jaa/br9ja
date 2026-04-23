import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../logic/secure_storage_service.dart';

class BR9ApiException implements Exception {
  const BR9ApiException({required this.message, this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => 'BR9ApiException($statusCode): $message';
}

class BR9ApiClient {
  BR9ApiClient._internal({SecureStorageService? secureStorageService})
    : _secureStorageService = secureStorageService ?? SecureStorageService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        sendTimeout: const Duration(seconds: 20),
        headers: const {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final deviceId = await _secureStorageService.readOrCreateDeviceId();
          options.headers['X-Device-ID'] = deviceId;
          options.headers['X-Client-Platform'] = kIsWeb ? 'web' : 'mobile';
          final token = await _secureStorageService.readAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final path = error.requestOptions.path;
          final statusCode = error.response?.statusCode;
          debugPrint(
            '[BR9ApiClient] ${error.requestOptions.method} $path failed '
            '(${statusCode ?? 'network'}): ${error.message}',
          );

          final shouldHandleUnauthorized =
              statusCode == 401 &&
              !_handlingUnauthorized &&
              !_isAuthEndpoint(path) &&
              _onUnauthorized != null;

          if (shouldHandleUnauthorized) {
            _handlingUnauthorized = true;
            try {
              await _onUnauthorized!.call();
            } finally {
              _handlingUnauthorized = false;
            }
          }

          handler.next(error);
        },
      ),
    );
  }

  static final BR9ApiClient instance = BR9ApiClient._internal();
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();
  static const String _baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'http://10.0.2.2:5000',
  );

  final SecureStorageService _secureStorageService;
  late final Dio _dio;
  Future<void> Function()? _onUnauthorized;
  bool _handlingUnauthorized = false;

  String get baseUrl => _baseUrl;

  void registerUnauthorizedHandler(Future<void> Function() handler) {
    _onUnauthorized = handler;
  }

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) {
    return request('GET', path, queryParameters: queryParameters);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
  }) {
    return request('POST', path, data: data, queryParameters: queryParameters);
  }

  Future<Map<String, dynamic>> put(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
  }) {
    return request('PUT', path, data: data, queryParameters: queryParameters);
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
  }) {
    return request(
      'DELETE',
      path,
      data: data,
      queryParameters: queryParameters,
    );
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
  }) {
    return request('PATCH', path, data: data, queryParameters: queryParameters);
  }

  Future<Map<String, dynamic>> fetchEducationPrices() {
    return get('/api/vending/education/prices');
  }

  Future<Map<String, dynamic>> fetchPromoStatus() {
    return get('/api/site-promo');
  }

  Future<Map<String, dynamic>> sendPhoneVerification({
    required String phoneNumber,
  }) {
    return post(
      '/api/auth/send-phone-verification',
      data: {'phoneNumber': phoneNumber},
    );
  }

  Future<Map<String, dynamic>> verifyPhoneCode({
    required String phoneNumber,
    required String code,
  }) {
    return post(
      '/api/auth/verify-phone-code',
      data: {'phoneNumber': phoneNumber, 'code': code},
    );
  }

  Future<Map<String, dynamic>> registerAccount({
    required String fullName,
    required String username,
    required String email,
    required String phoneNumber,
    required String password,
    required String pin,
    required String phoneVerificationToken,
    String? referralCode,
    String? deviceId,
  }) {
    return post(
      '/api/auth/register',
      data: {
        'fullName': fullName,
        'username': username,
        'bayrightTag': username,
        'email': email,
        'phoneNumber': phoneNumber,
        'password': password,
        'pin': pin,
        'phoneVerificationToken': phoneVerificationToken,
        'referralCode': referralCode,
        'deviceId': deviceId,
        'platform': kIsWeb ? 'web' : 'mobile',
      },
    );
  }

  Future<Map<String, dynamic>> uploadPassportPhoto({
    required String imageDataUrl,
  }) {
    return patch(
      '/api/user/passport-photo',
      data: {'imageDataUrl': imageDataUrl},
    );
  }

  Future<Map<String, dynamic>> fetchEducationPinHistory() {
    return get('/api/vending/education/history');
  }

  Future<Map<String, dynamic>> purchasePin({
    required String serviceType,
    required String transactionPin,
    String? profileCode,
    int quantity = 1,
  }) {
    return post(
      '/api/vending/purchase-pin',
      data: {
        'serviceType': serviceType,
        'profileCode': profileCode,
        'quantity': quantity,
        'transactionPin': transactionPin,
      },
    );
  }

  Future<Map<String, dynamic>> verifyMeter({
    required String meterNumber,
    required String serviceID,
    required String type,
  }) {
    return post(
      '/api/utility/verify-meter',
      data: {'meterNumber': meterNumber, 'serviceID': serviceID, 'type': type},
    );
  }

  Future<Map<String, dynamic>> payElectricity({
    required String meterNumber,
    required String serviceID,
    required String type,
    required double amount,
    required String phone,
    required String transactionPin,
    String? customerName,
  }) {
    return post(
      '/api/utility/pay-electricity',
      data: {
        'meterNumber': meterNumber,
        'serviceID': serviceID,
        'type': type,
        'amount': amount,
        'phone': phone,
        'customerName': customerName,
        'transactionPin': transactionPin,
      },
    );
  }

  Future<Map<String, dynamic>> verifySmartCard({
    required String billersCode,
    required String serviceID,
  }) {
    return post(
      '/api/utility/verify-smartcard',
      data: {'billersCode': billersCode, 'serviceID': serviceID},
    );
  }

  Future<Map<String, dynamic>> payTvInternet({
    required String category,
    required String billersCode,
    required String serviceID,
    required String variationCode,
    required double amount,
    required String phone,
    required String transactionPin,
    String? customerName,
  }) {
    return post(
      '/api/utility/pay-tv-internet',
      data: {
        'category': category,
        'billersCode': billersCode,
        'serviceID': serviceID,
        'variationCode': variationCode,
        'amount': amount,
        'phone': phone,
        'customerName': customerName,
        'transactionPin': transactionPin,
      },
    );
  }

  Future<Map<String, dynamic>> verifyLccAccount({required String accountID}) {
    return post('/api/transport/verify-lcc', data: {'accountID': accountID});
  }

  Future<Map<String, dynamic>> payLcc({
    required String accountID,
    required double amount,
    required String phone,
    required String transactionPin,
    String? customerName,
  }) {
    return post(
      '/api/transport/pay-lcc',
      data: {
        'accountID': accountID,
        'amount': amount,
        'phone': phone,
        'customerName': customerName,
        'transactionPin': transactionPin,
      },
    );
  }

  Future<Map<String, dynamic>> requestBusTicket({
    required String departure,
    required String destination,
    required DateTime travelDate,
    required String operator,
    String? passengerName,
    String? phone,
  }) {
    return post(
      '/api/transport/bus-ticket',
      data: {
        'departure': departure,
        'destination': destination,
        'travelDate': travelDate.toIso8601String(),
        'operator': operator,
        'passengerName': passengerName,
        'phone': phone,
      },
    );
  }

  Future<Map<String, dynamic>> generateRrr({
    required String serviceType,
    required double amount,
    required String payerName,
    String? payerEmail,
    String? payerPhone,
  }) {
    return post(
      '/api/gov/generate-rrr',
      data: {
        'serviceType': serviceType,
        'details': {
          'amount': amount,
          'payerName': payerName,
          'payerEmail': payerEmail,
          'payerPhone': payerPhone,
        },
      },
    );
  }

  Future<Map<String, dynamic>> payRrr({
    required String rrr,
    required double amount,
    required String transactionPin,
    String? serviceType,
  }) {
    return post(
      '/api/gov/pay-rrr',
      data: {
        'rrr': rrr,
        'amount': amount,
        'serviceType': serviceType,
        'transactionPin': transactionPin,
      },
    );
  }

  Future<Map<String, dynamic>> verifyBettingAccount({
    required String bookmaker,
    required String customerId,
  }) {
    return post(
      '/api/betting/verify-account',
      data: {'bookmaker': bookmaker, 'customerId': customerId},
    );
  }

  Future<Map<String, dynamic>> fundBettingWallet({
    required String bookmaker,
    required String customerId,
    required double amount,
    required String phone,
    required String transactionPin,
    String? customerName,
  }) {
    return post(
      '/api/betting/fund',
      data: {
        'bookmaker': bookmaker,
        'customerId': customerId,
        'amount': amount,
        'phone': phone,
        'customerName': customerName,
        'transactionPin': transactionPin,
      },
    );
  }

  Future<Map<String, dynamic>> fetchLiveState() {
    return get('/api/live/state');
  }

  Future<Map<String, dynamic>> submitLiveCode(String liveCode) {
    return post('/api/live/submit-code', data: {'liveCode': liveCode});
  }

  Future<Map<String, dynamic>> fetchTriviaQuestions() {
    return get('/api/trivia/questions');
  }

  Future<Map<String, dynamic>> submitTriviaAnswer({
    required String questionId,
    required int selectedOptionIndex,
  }) {
    return post(
      '/api/trivia/answer',
      data: {
        'questionId': questionId,
        'selectedOptionIndex': selectedOptionIndex,
      },
    );
  }

  Future<Map<String, dynamic>> request(
    String method,
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.request<Map<String, dynamic>>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: Options(method: method),
      );
      return response.data ?? <String, dynamic>{};
    } on DioException catch (error) {
      throw _mapDioException(error);
    } catch (error, stackTrace) {
      debugPrint('[BR9ApiClient] Unexpected error: $error\n$stackTrace');
      throw const BR9ApiException(
        message: 'Unexpected network error. Please try again.',
      );
    }
  }

  BR9ApiException _mapDioException(DioException error) {
    final responseData = error.response?.data;
    final responseMap = responseData is Map<String, dynamic>
        ? responseData
        : null;
    final statusCode = error.response?.statusCode;
    final message =
        responseMap?['message']?.toString() ??
        error.message ??
        'We could not complete your request.';

    switch (statusCode) {
      case 401:
        return BR9ApiException(
          statusCode: statusCode,
          message: message.isEmpty ? 'Your session has expired.' : message,
        );
      case 404:
        return BR9ApiException(
          statusCode: statusCode,
          message: message.isEmpty
              ? 'The requested resource was not found.'
              : message,
        );
      case 500:
        return BR9ApiException(
          statusCode: statusCode,
          message: message.isEmpty
              ? 'The server encountered an error.'
              : message,
        );
      default:
        return BR9ApiException(statusCode: statusCode, message: message);
    }
  }

  bool _isAuthEndpoint(String path) {
    return path.contains('/api/auth/login') ||
        path.contains('/api/auth/refresh') ||
        path.contains('/api/auth/send-phone-verification') ||
        path.contains('/api/auth/verify-phone-code') ||
        path.contains('/api/auth/register');
  }
}
