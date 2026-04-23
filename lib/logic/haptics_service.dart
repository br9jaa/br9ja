import 'package:flutter/services.dart';

class HapticsService {
  static Future<void> softTick() async {
    await HapticFeedback.selectionClick();
  }

  static Future<void> successThump() async {
    await HapticFeedback.mediumImpact();
    await Future<void>.delayed(const Duration(milliseconds: 90));
    await HapticFeedback.mediumImpact();
  }

  static Future<void> longBuzz() async {
    await HapticFeedback.heavyImpact();
    await Future<void>.delayed(const Duration(milliseconds: 120));
    await HapticFeedback.heavyImpact();
  }
}
