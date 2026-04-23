import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

bool isTransactionAllowed(double amount, int kycTier) {
  if (amount <= 20000) {
    return true;
  }
  if (kycTier >= 2) {
    return true;
  }
  return false;
}

Future<void> showTier2UpgradeSheet(BuildContext context) {
  return showModalBottomSheet<void>(
    context: context,
    backgroundColor: AppColors.deepNavy,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (_) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 52,
              width: 52,
              decoration: BoxDecoration(
                color: const Color(0xFF0A223D),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.neonGold),
              ),
              child: const Icon(
                Icons.verified_user_rounded,
                color: AppColors.neonGold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'KYC Upgrade Required',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'Transactions above ₦20,000 require Tier 2 verification. Please upgrade with your BVN or NIN to continue.',
              style: TextStyle(color: Colors.white70, height: 1.45),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: () async {
                  await HapticFeedback.lightImpact();
                  if (!context.mounted) {
                    return;
                  }
                  Navigator.pop(context);
                  Navigator.of(context).pushNamed('/kyc');
                },
                child: const Text('Upgrade to Tier 2'),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
