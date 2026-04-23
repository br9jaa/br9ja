import 'package:flutter/material.dart';

import 'security_gateway.dart';

class SecurityOverlay {
  static Future<bool> authenticate({
    required BuildContext context,
    required String reason,
    String fallbackTitle = 'Enter 6-digit PIN',
  }) {
    return SecurityGateway.authenticate(
      context: context,
      reason: reason,
      fallbackTitle: fallbackTitle,
    );
  }
}
