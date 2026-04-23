class TransactionRecord {
  const TransactionRecord({
    required this.id,
    required this.reference,
    required this.service,
    required this.status,
    required this.amount,
    required this.createdAt,
    this.balanceAfter,
    this.recipientName,
    this.senderName,
    this.note,
  });

  final String id;
  final String reference;
  final String service;
  final String status;
  final double amount;
  final DateTime createdAt;
  final double? balanceAfter;
  final String? recipientName;
  final String? senderName;
  final String? note;

  factory TransactionRecord.fromJson(Map<String, dynamic> json) {
    return TransactionRecord(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      reference: (json['reference'] ?? '').toString(),
      service:
          (json['service'] ?? json['transactionType'] ?? json['type'] ?? '')
              .toString(),
      status: (json['status'] ?? 'pending').toString(),
      amount: _parseDouble(json['amount']),
      createdAt: _parseDateTime(
        json['createdAt'] ?? json['timestamp'] ?? json['date'],
      ),
      balanceAfter: _parseNullableDouble(
        json['balanceAfter'] ?? json['walletBalance'],
      ),
      recipientName:
          (json['recipientName'] ?? json['recipient'] ?? '')
              .toString()
              .trim()
              .isEmpty
          ? null
          : (json['recipientName'] ?? json['recipient']).toString(),
      senderName:
          (json['senderName'] ?? json['sender'] ?? '').toString().trim().isEmpty
          ? null
          : (json['senderName'] ?? json['sender']).toString(),
      note: (json['note'] ?? '').toString().trim().isEmpty
          ? null
          : json['note'].toString(),
    );
  }

  factory TransactionRecord.draft({
    required String service,
    required double amount,
    required DateTime createdAt,
    String? recipientName,
    double? balanceAfter,
    String status = 'successful',
    String? note,
  }) {
    final timestamp = createdAt.millisecondsSinceEpoch;
    return TransactionRecord(
      id: 'draft-$timestamp',
      reference: 'BR9-$timestamp',
      service: service,
      status: status,
      amount: amount,
      createdAt: createdAt,
      recipientName: recipientName,
      balanceAfter: balanceAfter,
      note: note,
    );
  }

  static double _parseDouble(Object? value) {
    if (value is num) {
      return value.toDouble();
    }
    return double.tryParse(value?.toString() ?? '') ?? 0.0;
  }

  static double? _parseNullableDouble(Object? value) {
    if (value == null) {
      return null;
    }
    return _parseDouble(value);
  }

  static DateTime _parseDateTime(Object? value) {
    if (value is DateTime) {
      return value;
    }
    return DateTime.tryParse(value?.toString() ?? '') ?? DateTime.now();
  }
}
