import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

import 'firebase_config_probe.dart';

class FirebaseService {
  const FirebaseService._();

  static Future<bool> initializeIfConfigured() async {
    if (Firebase.apps.isNotEmpty) {
      return true;
    }

    if (!await hasFirebasePlatformConfig()) {
      debugPrint('[FirebaseService] Firebase config missing; skipping init.');
      return false;
    }

    try {
      await Firebase.initializeApp();
      return true;
    } catch (error) {
      debugPrint('[FirebaseService] Firebase init skipped: $error');
      return false;
    }
  }
}
