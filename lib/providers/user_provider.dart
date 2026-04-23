import 'dart:async';

import 'package:flutter/foundation.dart';

import '../logic/auth_provider.dart';
import '../models/transaction_model.dart';
import '../models/user_model.dart';
import '../services/notification_service.dart';

class UserProvider extends ChangeNotifier {
  String _userName = 'Chukwudi Bayright';
  String _accountNumber = '0012345678';
  String _depositAccountNumber = '0012345678';
  String _depositBankName = 'GTBank';
  String _depositAccountName = '@CHUKWUDI';
  String _depositProvider = 'demo';
  String _depositAccountStatus = 'provisional';
  String _email = '';
  String _phoneNumber = '';
  double _walletBalance = 2450000.00;
  int _br9GoldPoints = 0;
  String _referralCode = '';
  int _kycTier = 1;
  bool _isLivenessVerified = false;
  bool _phoneVerified = false;
  bool _isLoggedIn = false;
  bool _isLoading = false;
  bool _transactionsFrozen = false;
  double _dailySpendingCap = 15000.00;
  String _passportPhotoDataUrl = '';
  List<TransactionRecord> _transactions = <TransactionRecord>[];

  String get userName => _userName;
  String get accountNumber => _accountNumber;
  String get depositAccountNumber => _depositAccountNumber;
  String get depositBankName => _depositBankName;
  String get depositAccountName => _depositAccountName;
  String get depositProvider => _depositProvider;
  String get depositAccountStatus => _depositAccountStatus;
  String get email => _email;
  String get phoneNumber => _phoneNumber;
  double get walletBalance => _walletBalance;
  int get br9GoldPoints => _br9GoldPoints;
  String get referralCode => _referralCode;
  int get kycTier => _kycTier;
  bool get isLivenessVerified => _isLivenessVerified;
  bool get phoneVerified => _phoneVerified;
  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  bool get transactionsFrozen => _transactionsFrozen;
  double get dailySpendingCap => _dailySpendingCap;
  String get passportPhotoDataUrl => _passportPhotoDataUrl;
  List<TransactionRecord> get transactions => List.unmodifiable(_transactions);
  String get bankStatus {
    if (_transactionsFrozen) {
      return 'Temporarily Frozen';
    }
    if (_kycTier >= 2 && _isLivenessVerified) {
      return 'Bank Ready';
    }
    if (_kycTier >= 2) {
      return 'Verified';
    }
    return 'Starter Tier';
  }

  int get dailyStreak {
    if (!_isLoggedIn) {
      return 0;
    }

    final today = DateTime.now();
    final activityDates = _transactions
        .map(
          (tx) =>
              DateTime(tx.createdAt.year, tx.createdAt.month, tx.createdAt.day),
        )
        .toSet();

    if (activityDates.isEmpty) {
      return 1;
    }

    var streak = 0;
    var cursor = DateTime(today.year, today.month, today.day);
    while (activityDates.contains(cursor)) {
      streak += 1;
      cursor = cursor.subtract(const Duration(days: 1));
    }
    return streak == 0 ? 1 : streak;
  }

  int get marketRunnerScore {
    final walletMomentum = (_walletBalance / 1000).clamp(0, 240).round();
    final securityBonus = _isLivenessVerified ? 120 : 0;
    return _br9GoldPoints +
        (dailyStreak * 40) +
        (_transactions.length * 15) +
        walletMomentum +
        securityBonus;
  }

  double get marketRunnerProgress {
    var completed = 0;
    if (_walletBalance > 0) {
      completed += 1;
    }
    if (_br9GoldPoints >= 100) {
      completed += 1;
    }
    if (dailyStreak >= 3) {
      completed += 1;
    }
    if (_isLivenessVerified) {
      completed += 1;
    }
    return completed / 4;
  }

  double get spentToday {
    final now = DateTime.now();
    return _transactions
        .where((tx) {
          final timestamp = tx.createdAt;
          return timestamp.year == now.year &&
              timestamp.month == now.month &&
              timestamp.day == now.day;
        })
        .fold<double>(0, (sum, tx) => sum + tx.amount);
  }

  void syncSession(AuthProvider authProvider) {
    final profile = authProvider.userProfile;
    if (!authProvider.isAuthenticated || profile == null) {
      if (_isLoggedIn || _transactions.isNotEmpty) {
        logout();
      }
      return;
    }

    _hydrate(profile);
  }

  void logout() {
    _userName = 'Chukwudi Bayright';
    _accountNumber = '0012345678';
    _depositAccountNumber = '0012345678';
    _depositBankName = 'GTBank';
    _depositAccountName = '@CHUKWUDI';
    _depositProvider = 'demo';
    _depositAccountStatus = 'provisional';
    _email = '';
    _phoneNumber = '';
    _walletBalance = 2450000.00;
    _br9GoldPoints = 0;
    _referralCode = '';
    _kycTier = 1;
    _isLivenessVerified = false;
    _phoneVerified = false;
    _isLoggedIn = false;
    _transactionsFrozen = false;
    _dailySpendingCap = 15000.00;
    _passportPhotoDataUrl = '';
    _transactions = <TransactionRecord>[];
    _isLoading = false;
    notifyListeners();
  }

  void setKycTier(int tier) {
    _kycTier = tier;
    notifyListeners();
  }

  void setLivenessVerified(bool value) {
    _isLivenessVerified = value;
    notifyListeners();
  }

  void setGoldPoints(int points) {
    _br9GoldPoints = points;
    notifyListeners();
  }

  void applyTransaction(TransactionRecord transaction) {
    final previousBalance = _walletBalance;
    _walletBalance = transaction.balanceAfter ?? _walletBalance;
    _transactions = <TransactionRecord>[transaction, ..._transactions];
    notifyListeners();
    unawaited(
      NotificationService.triggerForTransaction(
        transaction,
        previousBalance: previousBalance,
      ),
    );
  }

  void setTransactionFreeze(bool value) {
    _transactionsFrozen = value;
    notifyListeners();
  }

  void setDailySpendingCap(double cap) {
    _dailySpendingCap = cap;
    notifyListeners();
  }

  void _hydrate(UserProfile profile) {
    _userName = profile.fullName;
    _accountNumber = profile.accountNumber;
    _depositAccountNumber = profile.virtualAccount.accountNumber.isNotEmpty
        ? profile.virtualAccount.accountNumber
        : profile.accountNumber;
    _depositBankName = profile.virtualAccount.bankName.isNotEmpty
        ? profile.virtualAccount.bankName
        : 'GTBank';
    _depositAccountName = profile.virtualAccount.accountName.isNotEmpty
        ? profile.virtualAccount.accountName
        : profile.bayrightTag.toUpperCase();
    _depositProvider = profile.virtualAccount.provider.isNotEmpty
        ? profile.virtualAccount.provider
        : 'demo';
    _depositAccountStatus = profile.virtualAccount.status.isNotEmpty
        ? profile.virtualAccount.status
        : 'pending';
    _email = profile.email;
    _phoneNumber = profile.phoneNumber;
    _walletBalance = profile.walletBalance;
    _br9GoldPoints = profile.br9GoldPoints;
    _referralCode = profile.referralCode;
    _kycTier = profile.kycTier;
    _isLivenessVerified = profile.isLivenessVerified;
    _phoneVerified = profile.phoneVerified;
    _passportPhotoDataUrl = profile.passportPhotoDataUrl;
    _transactions = profile.transactions;
    _isLoggedIn = true;
    _isLoading = false;
    notifyListeners();
  }
}
