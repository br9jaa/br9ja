import 'package:flutter/material.dart';

import '../utils/validators.dart';

const String currentUserKycStatus = 'Unverified';

bool checkKycRequirement(
  double amount, {
  String kycStatus = currentUserKycStatus,
}) {
  return !isTransactionAllowed(amount, kycStatus == 'Unverified' ? 1 : 2);
}

Future<void> showKycRequiredSheet(BuildContext context) {
  return showTier2UpgradeSheet(context);
}
