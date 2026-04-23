import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../providers/user_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/confetti_overlay.dart';

class SundayLiveInteractScreen extends StatefulWidget {
  const SundayLiveInteractScreen({super.key});

  @override
  State<SundayLiveInteractScreen> createState() =>
      _SundayLiveInteractScreenState();
}

class _SundayLiveInteractScreenState extends State<SundayLiveInteractScreen> {
  final _codeController = TextEditingController();
  final _screenshotController = ScreenshotController();
  bool _liveActive = false;
  bool _loading = true;
  bool _submitting = false;
  bool _won = false;
  int _winnerCount = 0;

  @override
  void initState() {
    super.initState();
    _loadState();
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _loadState() async {
    try {
      final response = await BR9ApiClient.instance.fetchLiveState();
      final data = response['data'] as Map<String, dynamic>? ?? {};
      if (mounted) {
        setState(() {
          _liveActive = data['isActive'] == true;
          _winnerCount = (data['winnerCount'] as num?)?.toInt() ?? 0;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _submitCode() async {
    setState(() => _submitting = true);
    try {
      final response = await BR9ApiClient.instance.submitLiveCode(
        _codeController.text.trim(),
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      final points = data['br9GoldPoints'];
      if (points is num && mounted) {
        context.read<UserProvider>().setGoldPoints(points.toInt());
      }
      if (mounted) {
        if (data['alreadyWon'] != true) {
          await NotificationService.celebrateWin();
        }
        setState(() {
          _won = data['alreadyWon'] != true;
          _winnerCount = (data['winnerCount'] as num?)?.toInt() ?? _winnerCount;
        });
      }
    } on BR9ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  Future<void> _openStream(String url) async {
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  Future<void> _shareVictoryCard() async {
    final image = await _screenshotController.capture();
    if (image == null) {
      return;
    }
    await Share.shareXFiles([
      XFile.fromData(image, mimeType: 'image/png', name: 'br9ja-victory.png'),
    ], text: 'I just won BR9 Gold on BR9ja Sunday Live!');
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<UserProvider>();

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Sunday Live'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: ConfettiOverlay(
        play: _won,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Container(
              height: 220,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF210B16), Color(0xFF071B31)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Live Stream Player',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Embed placeholder: launch the official stream while WebView credentials are finalized.',
                    style: TextStyle(color: Colors.white70),
                  ),
                  const Spacer(),
                  Wrap(
                    spacing: 8,
                    children: [
                      OutlinedButton(
                        onPressed: () => _openStream('https://facebook.com'),
                        child: const Text('Facebook'),
                      ),
                      OutlinedButton(
                        onPressed: () => _openStream('https://tiktok.com'),
                        child: const Text('TikTok'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0A223D),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _loading
                        ? 'Checking live state...'
                        : _liveActive
                        ? 'Fastest Finger Unlocked'
                        : 'Waiting for admin trigger',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Winner count: $_winnerCount',
                    style: const TextStyle(color: Colors.white70),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _codeController,
                    enabled: _liveActive,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Enter live code',
                    ),
                  ),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: !_liveActive || _submitting ? null : _submitCode,
                    child: Text(_submitting ? 'Submitting...' : 'Submit Code'),
                  ),
                ],
              ),
            ),
            if (_won) ...[
              const SizedBox(height: 18),
              Screenshot(
                controller: _screenshotController,
                child: _VictoryCard(userName: user.userName),
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _shareVictoryCard,
                icon: const Icon(Icons.ios_share_rounded),
                label: const Text('Generate Victory Card'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _VictoryCard extends StatelessWidget {
  const _VictoryCard({required this.userName});

  final String userName;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFD166), Color(0xFF0A223D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'BR9ja Live Winner',
                  style: TextStyle(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                Text(
                  userName,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const Text('Won BR9 Gold on Sunday Live'),
              ],
            ),
          ),
          QrImageView(
            data: 'https://br9ja.app',
            size: 82,
            backgroundColor: Colors.white,
          ),
        ],
      ),
    );
  }
}
