import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

class SuccessSubPage extends StatelessWidget {
  const SuccessSubPage({
    super.key,
    required this.title,
    required this.receiptNumber,
    this.nextRenewalDate,
  });

  final String title;
  final String receiptNumber;
  final DateTime? nextRenewalDate;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Subscription'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 120,
                width: 120,
                decoration: const BoxDecoration(
                  color: Color(0xFF1E8E5A),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_rounded,
                  color: Colors.white,
                  size: 72,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Receipt: ${receiptNumber.isEmpty ? 'N/A' : receiptNumber}',
                style: const TextStyle(color: Colors.white70),
              ),
              if (nextRenewalDate != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Next renewal: ${nextRenewalDate!.day}/${nextRenewalDate!.month}/${nextRenewalDate!.year}',
                  style: const TextStyle(color: AppColors.neonGold),
                ),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Done'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
