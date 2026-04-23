import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import '../models/transaction_model.dart';

class NotificationService {
  NotificationService._();

  static final AudioPlayer _audioPlayer = AudioPlayer()
    ..setReleaseMode(ReleaseMode.stop);

  static Future<void> transactionSuccess({
    bool walletCredit = false,
    bool goldConversion = false,
  }) async {
    try {
      await HapticFeedback.heavyImpact();
      if (walletCredit || goldConversion) {
        await _playChaChing();
      }
    } catch (error, stackTrace) {
      debugPrint(
        'NotificationService.transactionSuccess failed: $error\n$stackTrace',
      );
    }
  }

  static Future<void> celebrateWin() {
    return transactionSuccess(walletCredit: true);
  }

  static Future<void> celebrateGoldConversion() {
    return transactionSuccess(walletCredit: true, goldConversion: true);
  }

  static Future<void> triggerForTransaction(
    TransactionRecord transaction, {
    required double previousBalance,
  }) async {
    final newBalance = transaction.balanceAfter;
    final service = transaction.service.toLowerCase();
    final isGoldConversion =
        service.contains('gold') && service.contains('conversion');
    final walletCredit =
        (newBalance != null && newBalance > previousBalance) ||
        isGoldConversion;

    await transactionSuccess(
      walletCredit: walletCredit,
      goldConversion: isGoldConversion,
    );
  }

  static Future<void> _playChaChing() async {
    await _audioPlayer.stop();
    await _audioPlayer.play(AssetSource('audio/cha_ching.wav'), volume: 1);
  }
}
