import 'transaction_model.dart';

class VirtualAccount {
  const VirtualAccount({
    required this.accountNumber,
    required this.bankName,
    required this.accountName,
    required this.provider,
    required this.status,
  });

  final String accountNumber;
  final String bankName;
  final String accountName;
  final String provider;
  final String status;

  factory VirtualAccount.fromJson(Map<String, dynamic>? json) {
    final data = json ?? const <String, dynamic>{};
    return VirtualAccount(
      accountNumber: (data['accountNumber'] ?? '').toString(),
      bankName: (data['bankName'] ?? '').toString(),
      accountName: (data['accountName'] ?? '').toString(),
      provider: (data['provider'] ?? '').toString(),
      status: (data['status'] ?? '').toString(),
    );
  }
}

class UserProfile {
  const UserProfile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    required this.phoneVerified,
    required this.bayrightTag,
    required this.accountNumber,
    required this.virtualAccount,
    required this.kycTier,
    required this.walletBalance,
    required this.br9GoldPoints,
    required this.referralCode,
    required this.isLivenessVerified,
    required this.passportPhotoDataUrl,
    required this.favoriteTeamIds,
    required this.transactions,
  });

  final String id;
  final String fullName;
  final String email;
  final String phoneNumber;
  final bool phoneVerified;
  final String bayrightTag;
  final String accountNumber;
  final VirtualAccount virtualAccount;
  final int kycTier;
  final double walletBalance;
  final int br9GoldPoints;
  final String referralCode;
  final bool isLivenessVerified;
  final String passportPhotoDataUrl;
  final List<String> favoriteTeamIds;
  final List<TransactionRecord> transactions;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final transactionItems =
        (json['transactions'] ?? json['recentTransactions'] ?? [])
            as List<dynamic>;

    final virtualAccount = VirtualAccount.fromJson(
      json['virtualAccount'] is Map<String, dynamic>
          ? json['virtualAccount'] as Map<String, dynamic>
          : null,
    );
    final accountNumber = (json['accountNumber'] ?? '').toString();

    return UserProfile(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      fullName: (json['fullName'] ?? json['userName'] ?? json['name'] ?? '')
          .toString(),
      email: (json['email'] ?? '').toString(),
      phoneNumber: (json['phoneNumber'] ?? '').toString(),
      phoneVerified: json['phoneVerified'] == true,
      bayrightTag: (json['bayrightTag'] ?? '').toString(),
      accountNumber: accountNumber.isNotEmpty
          ? accountNumber
          : virtualAccount.accountNumber,
      virtualAccount: virtualAccount,
      kycTier: (json['kycTier'] as num?)?.toInt() ?? 1,
      walletBalance:
          (json['walletBalance'] as num?)?.toDouble() ??
          (json['balance'] as num?)?.toDouble() ??
          double.tryParse(json['balance']?.toString() ?? '') ??
          0.0,
      br9GoldPoints:
          (json['br9GoldPoints'] as num?)?.toInt() ??
          int.tryParse(json['br9GoldPoints']?.toString() ?? '') ??
          0,
      referralCode: (json['referralCode'] ?? '').toString(),
      isLivenessVerified: json['isLivenessVerified'] == true,
      passportPhotoDataUrl: (json['passportPhotoDataUrl'] ?? '').toString(),
      favoriteTeamIds: ((json['favoriteTeamIds'] ?? []) as List<dynamic>)
          .map((item) => item.toString())
          .toList(growable: false),
      transactions: transactionItems
          .whereType<Map<String, dynamic>>()
          .map(TransactionRecord.fromJson)
          .toList(growable: false),
    );
  }
}
