import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class TokenDisplayPage extends StatelessWidget {
  const TokenDisplayPage({
    super.key,
    required this.token,
    required this.receiptNumber,
    required this.meterNumber,
  });

  final String token;
  final String receiptNumber;
  final String meterNumber;

  Future<void> _copy(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: token));
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Token copied.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Electricity Token'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF0A223D),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: AppColors.neonGold),
            ),
            child: Column(
              children: [
                const Text(
                  'Prepaid Token',
                  style: TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 16),
                SelectableText(
                  token.isEmpty ? 'POSTPAID RECEIPT' : token,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.neonGold,
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Receipt: ${receiptNumber.isEmpty ? 'N/A' : receiptNumber}',
                  style: const TextStyle(color: Colors.white70),
                ),
                Text(
                  'Meter: $meterNumber',
                  style: const TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: token.isEmpty ? null : () => _copy(context),
            icon: const Icon(Icons.copy_rounded),
            label: const Text('Copy Token'),
          ),
          const SizedBox(height: 22),
          const Text(
            'How to load',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Input the 20 digits into your prepaid meter keypad and press Enter. For postpaid meters, keep the receipt number for reference.',
            style: TextStyle(color: Colors.white70, height: 1.45),
          ),
        ],
      ),
    );
  }
}
