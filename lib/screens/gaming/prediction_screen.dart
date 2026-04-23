import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../providers/user_provider.dart';

class PredictionScreen extends StatelessWidget {
  const PredictionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return const _GamesAppOnlyGate();
    }

    final userProvider = context.watch<UserProvider>();
    final progress = userProvider.marketRunnerProgress;
    final leaderboard = _buildLeaderboard(userProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.deepNavy,
        appBar: AppBar(
          backgroundColor: AppColors.deepNavy,
          title: const Text('Games'),
          bottom: const TabBar(
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: Colors.white70,
            tabs: [
              Tab(text: 'Market Runner'),
              Tab(text: 'Leaderboard'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF000000),
                        Color(0xFF1A1400),
                        Color(0xFF000000),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Text(
                          'Market Runner',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Your score now comes from momentum, completion, and secure play.',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          height: 1.1,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Runner Score ${userProvider.marketRunnerScore} • ${(progress * 100).round()}% completion',
                        style: const TextStyle(color: Colors.white70),
                      ),
                      const SizedBox(height: 16),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(999),
                        child: LinearProgressIndicator(
                          minHeight: 12,
                          value: progress,
                          backgroundColor: Colors.white10,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            AppColors.primary,
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: [
                          _GameStatCard(
                            label: 'BR9 Gold',
                            value: '${userProvider.br9GoldPoints}',
                            icon: Icons.workspace_premium_rounded,
                            tone: AppColors.primary,
                          ),
                          _GameStatCard(
                            label: 'Streak',
                            value: '${userProvider.dailyStreak} days',
                            icon: Icons.local_fire_department_rounded,
                            tone: const Color(0xFFFF8A00),
                          ),
                          _GameStatCard(
                            label: 'Bank Status',
                            value: userProvider.bankStatus,
                            icon: Icons.verified_user_rounded,
                            tone: AppColors.success,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Today’s Run',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 12),
                _ChallengeCard(
                  title: 'Wallet Sprint',
                  subtitle:
                      'Keep your wallet funded so your run stays active and your score keeps moving.',
                  complete: userProvider.walletBalance > 0,
                  reward: '+120 runner energy',
                ),
                _ChallengeCard(
                  title: 'BR9 Gold Builder',
                  subtitle:
                      'Reach at least 100 BR9 Gold to unlock the next completion checkpoint.',
                  complete: userProvider.br9GoldPoints >= 100,
                  reward: '+80 gold momentum',
                ),
                _ChallengeCard(
                  title: 'Consistency Bonus',
                  subtitle:
                      'Build a 3-day streak through steady gameplay and bill activity.',
                  complete: userProvider.dailyStreak >= 3,
                  reward: '+60 streak points',
                ),
                _ChallengeCard(
                  title: 'Secure Mode',
                  subtitle:
                      'Verify your account with liveness to collect the security multiplier.',
                  complete: userProvider.isLivenessVerified,
                  reward: '+120 secure play bonus',
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF101010),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: const Text(
                    'Football prediction has been retired from the main game loop. Market Runner score is now the benchmark that drives the leaderboard and BR9 Gold completion experience.',
                    style: TextStyle(color: Colors.white70, height: 1.5),
                  ),
                ),
              ],
            ),
            ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF101010),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: const Text(
                    'Leaderboard benchmark: Market Runner score. Higher completion, stronger streaks, and verified play push you upward.',
                    style: TextStyle(color: Colors.white70, height: 1.5),
                  ),
                ),
                const SizedBox(height: 16),
                ...leaderboard.asMap().entries.map(
                  (entry) => _LeaderboardTile(
                    rank: entry.key + 1,
                    player: entry.value,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  List<_LeaderboardPlayer> _buildLeaderboard(UserProvider userProvider) {
    final players = <_LeaderboardPlayer>[
      const _LeaderboardPlayer(
        name: 'Ada Gold',
        subtitle: '7-day streak',
        score: 1240,
      ),
      const _LeaderboardPlayer(
        name: 'Kunle Runner',
        subtitle: 'Wallet momentum maxed',
        score: 1090,
      ),
      const _LeaderboardPlayer(
        name: 'Ifeoma Prime',
        subtitle: 'Verified profile',
        score: 970,
      ),
      const _LeaderboardPlayer(
        name: 'Tega Swift',
        subtitle: 'Bills streak',
        score: 910,
      ),
      _LeaderboardPlayer(
        name: userProvider.userName,
        subtitle: 'You',
        score: userProvider.marketRunnerScore,
        currentUser: true,
      ),
    ];
    players.sort((left, right) => right.score.compareTo(left.score));
    return players;
  }
}

class _GamesAppOnlyGate extends StatelessWidget {
  const _GamesAppOnlyGate();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        backgroundColor: AppColors.deepNavy,
        title: const Text('Games'),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF101010),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    height: 72,
                    width: 72,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(22),
                    ),
                    child: const Icon(
                      Icons.sports_esports_rounded,
                      color: AppColors.primary,
                      size: 36,
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Games stay exclusive to the BR9ja app.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      height: 1.1,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Use mobile to play Market Runner, climb the leaderboard, and earn BR9 Gold. Web stays focused on bills, profile, and account management.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white70, height: 1.55),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: () => _openStore(
                        'https://play.google.com/store/apps/details?id=com.bayright9ja.bayright9ja_mobile',
                      ),
                      icon: const Icon(Icons.download_rounded),
                      label: const Text('Download the App to Play'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _openStore(String url) async {
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }
}

class _GameStatCard extends StatelessWidget {
  const _GameStatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.tone,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 150,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: tone.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: tone),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChallengeCard extends StatelessWidget {
  const _ChallengeCard({
    required this.title,
    required this.subtitle,
    required this.complete,
    required this.reward,
  });

  final String title;
  final String subtitle;
  final bool complete;
  final String reward;

  @override
  Widget build(BuildContext context) {
    final tone = complete ? AppColors.success : AppColors.primary;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF101010),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              complete ? Icons.check_rounded : Icons.flag_rounded,
              color: tone,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white70, height: 1.45),
                ),
                const SizedBox(height: 10),
                Text(
                  reward,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LeaderboardTile extends StatelessWidget {
  const _LeaderboardTile({required this.rank, required this.player});

  final int rank;
  final _LeaderboardPlayer player;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: player.currentUser
            ? AppColors.primary.withValues(alpha: 0.10)
            : const Color(0xFF101010),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: player.currentUser ? AppColors.primary : Colors.white10,
        ),
      ),
      child: Row(
        children: [
          Container(
            height: 42,
            width: 42,
            decoration: BoxDecoration(
              color: rank <= 3
                  ? AppColors.primary.withValues(alpha: 0.14)
                  : Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Text(
                '$rank',
                style: TextStyle(
                  color: rank <= 3 ? AppColors.primary : Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  player.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  player.subtitle,
                  style: const TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          Text(
            '${player.score}',
            style: const TextStyle(
              color: AppColors.primary,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _LeaderboardPlayer {
  const _LeaderboardPlayer({
    required this.name,
    required this.subtitle,
    required this.score,
    this.currentUser = false,
  });

  final String name;
  final String subtitle;
  final int score;
  final bool currentUser;
}
