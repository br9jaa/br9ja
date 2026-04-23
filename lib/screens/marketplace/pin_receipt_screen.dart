import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

class PinReceiptScreen extends StatelessWidget {
  const PinReceiptScreen({
    super.key,
    required this.serviceType,
    required this.pin,
    required this.serial,
    required this.createdAt,
  });

  final String serviceType;
  final String pin;
  final String serial;
  final DateTime createdAt;

  String get _instruction {
    switch (serviceType) {
      case 'JAMB':
        return 'Use this e-PIN on the official JAMB registration portal or at an accredited CBT centre with your profile code.';
      case 'WAEC_RESULT':
      case 'WAEC_GCE':
        return 'Visit the WAEC result checker portal, enter your exam number, card serial, PIN, and exam year.';
      case 'NECO':
        return 'Visit the NECO token portal, enter your token/PIN, exam number, and exam year to view results.';
      default:
        return 'Use this PIN on the official exam body portal. Keep the PIN and serial number safe.';
    }
  }

  String get _shareText {
    return 'BR9ja ${serviceType.replaceAll('_', ' ')} PIN\nPIN: $pin\nSerial: $serial\nDate: ${createdAt.toIso8601String()}';
  }

  Future<void> _copy(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: pin));
    if (context.mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('PIN copied.')));
    }
  }

  Future<void> _shareToWhatsApp() async {
    final text = Uri.encodeComponent(_shareText);
    final appUri = Uri.parse('whatsapp://send?text=$text');
    final webUri = Uri.parse('https://wa.me/?text=$text');
    if (!await launchUrl(appUri, mode: LaunchMode.externalApplication)) {
      await launchUrl(webUri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('PIN Receipt'),
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
                Text(
                  serviceType.replaceAll('_', ' '),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 18),
                SelectableText(
                  pin,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.neonGold,
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.4,
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'Serial: ${serial.isEmpty ? 'N/A' : serial}',
                  style: const TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: () => _copy(context),
            icon: const Icon(Icons.copy_rounded),
            label: const Text('Copy PIN'),
          ),
          OutlinedButton.icon(
            onPressed: _shareToWhatsApp,
            icon: const Icon(Icons.chat_rounded),
            label: const Text('Share to WhatsApp'),
          ),
          OutlinedButton.icon(
            onPressed: () => Share.share(_shareText),
            icon: const Icon(Icons.ios_share_rounded),
            label: const Text('Share Receipt'),
          ),
          const SizedBox(height: 22),
          const Text(
            'How to use',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _instruction,
            style: const TextStyle(color: Colors.white70, height: 1.45),
          ),
        ],
      ),
    );
  }
}
