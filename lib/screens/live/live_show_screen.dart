import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class LiveShowScreen extends StatefulWidget {
  const LiveShowScreen({super.key});

  @override
  State<LiveShowScreen> createState() => _LiveShowScreenState();
}

class _LiveShowScreenState extends State<LiveShowScreen> {
  static final Uri _facebookUrl = Uri.parse('https://facebook.com/br9ja');
  static final Uri _tiktokUrl = Uri.parse('https://www.tiktok.com/@br9ja');
  static final Uri _youtubeUrl = Uri.parse('https://youtube.com/@br9ja');

  List<Map<String, dynamic>> _topThree = <Map<String, dynamic>>[];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadTopThree();
  }

  Future<void> _loadTopThree() async {
    setState(() => _loading = true);
    try {
      final response = await BR9ApiClient.instance.get(
        '/api/games/leaderboard',
        queryParameters: {'limit': 3},
      );
      final data = response['data'];
      if (!mounted) {
        return;
      }
      setState(() {
        _topThree = data is List
            ? data.whereType<Map<String, dynamic>>().toList(growable: false)
            : <Map<String, dynamic>>[];
      });
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _open(Uri uri) async {
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Could not open ${uri.host}.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('BR9ja Live Show'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: RefreshIndicator(
        onRefresh: _loadTopThree,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF081B31), Color(0xFF312300)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(
                  color: AppColors.neonGold.withValues(alpha: 0.4),
                ),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.live_tv_rounded, color: AppColors.neonGold),
                  SizedBox(height: 14),
                  Text(
                    'Sunday 8 PM Live',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Watch the weekly BR9 Gold show and see who is leading the 20k prize race.',
                    style: TextStyle(color: Colors.white70, height: 1.45),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            _WatchButton(
              label: 'Watch on Facebook',
              icon: Icons.facebook_rounded,
              onTap: () => _open(_facebookUrl),
            ),
            _WatchButton(
              label: 'Watch on TikTok',
              icon: Icons.music_note_rounded,
              onTap: () => _open(_tiktokUrl),
            ),
            _WatchButton(
              label: 'Watch on YouTube',
              icon: Icons.play_circle_fill_rounded,
              onTap: () => _open(_youtubeUrl),
            ),
            const SizedBox(height: 24),
            const Text(
              'Current Top 3',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            if (_loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator(color: AppColors.neonGold),
                ),
              )
            else if (_topThree.isEmpty)
              const _LiveEmptyState()
            else
              ..._topThree.map(_TopThreeTile.new),
          ],
        ),
      ),
    );
  }
}

class _WatchButton extends StatelessWidget {
  const _WatchButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: FilledButton.icon(
        onPressed: onTap,
        icon: Icon(icon),
        label: Text(label),
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.neonGold,
          foregroundColor: AppColors.deepNavy,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}

class _TopThreeTile extends StatelessWidget {
  const _TopThreeTile(this.row);

  final Map<String, dynamic> row;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Text(
            '#${row['rank'] ?? '-'}',
            style: const TextStyle(
              color: AppColors.neonGold,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              (row['fullName'] ?? row['bayrightTag'] ?? 'Player').toString(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Text(
            '${row['br9GoldPoints'] ?? 0} pts',
            style: const TextStyle(color: Colors.white70),
          ),
        ],
      ),
    );
  }
}

class _LiveEmptyState extends StatelessWidget {
  const _LiveEmptyState();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(18),
      ),
      child: const Text(
        'The live leaderboard will appear once players start earning BR9 Gold.',
        textAlign: TextAlign.center,
        style: TextStyle(color: Colors.white70),
      ),
    );
  }
}
