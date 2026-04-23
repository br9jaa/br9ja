import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'providers/user_provider.dart';
import 'screens/gaming/prediction_screen.dart';
import 'screens/marketplace/education_screen.dart';
import 'screens/marketplace/electricity_screen.dart';
import 'screens/marketplace/betting_funding_screen.dart';
import 'screens/marketplace/government_screen.dart';
import 'screens/marketplace/marketplace_screen.dart';
import 'screens/marketplace/transport_screen.dart';
import 'screens/marketplace/tv_internet_screen.dart';
import 'services/airtime_page.dart';
import 'services/all_services_page.dart';
import 'services/profile_page.dart';
import 'services/service_ui.dart';
import 'services/topup_page.dart';
import 'services/transfer_page.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      _HomeContent(onOpenTab: _openTab),
      const MarketplaceScreen(),
      const PredictionScreen(),
      const _GoldHubPage(),
      const ProfilePage(),
    ];

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      body: IndexedStack(index: _currentIndex, children: pages),
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(
          color: Color(0xFF090909),
          border: Border(top: BorderSide(color: Colors.white10)),
        ),
        child: NavigationBar(
          height: 82,
          selectedIndex: _currentIndex,
          backgroundColor: Colors.transparent,
          indicatorColor: AppColors.primary.withValues(alpha: 0.14),
          labelTextStyle: WidgetStateProperty.resolveWith(
            (states) => TextStyle(
              color: states.contains(WidgetState.selected)
                  ? AppColors.primary
                  : Colors.white70,
              fontWeight: FontWeight.w700,
            ),
          ),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined),
              selectedIcon: Icon(Icons.receipt_long_rounded),
              label: 'Bills',
            ),
            NavigationDestination(
              icon: _GamesNavIcon(selected: false),
              selectedIcon: _GamesNavIcon(selected: true),
              label: 'Games',
            ),
            NavigationDestination(
              icon: Icon(Icons.workspace_premium_outlined),
              selectedIcon: Icon(Icons.workspace_premium_rounded),
              label: 'BR9 Gold',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
          onDestinationSelected: (index) {
            setState(() => _currentIndex = index);
          },
        ),
      ),
    );
  }

  void _openTab(int index) {
    setState(() => _currentIndex = index);
  }
}

class _HomeContent extends StatelessWidget {
  const _HomeContent({required this.onOpenTab});

  final ValueChanged<int> onOpenTab;

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final shortcuts = <_Shortcut>[
      _Shortcut(
        label: 'Airtime',
        icon: Icons.phone_android_rounded,
        color: const Color(0xFF4EA8FF),
        page: const AirtimePage(),
        aliases: const ['recharge', 'phone', 'mtn', 'airtel', 'glo', '9mobile'],
      ),
      _Shortcut(
        label: 'Electricity',
        icon: Icons.bolt_rounded,
        color: AppColors.success,
        page: const ElectricityScreen(),
        aliases: const ['meter', 'disco', 'ikeja', 'eko', 'aedc', 'power'],
      ),
      _Shortcut(
        label: 'Cable TV',
        icon: Icons.tv_rounded,
        color: const Color(0xFF8B5CF6),
        page: const TvInternetScreen(),
        aliases: const [
          'dstv',
          'gotv',
          'startimes',
          'showmax',
          'decoder',
          'internet',
        ],
      ),
      _Shortcut(
        label: 'Education',
        icon: Icons.school_rounded,
        color: const Color(0xFFFF8A00),
        page: const EducationScreen(),
        aliases: const ['waec', 'jamb', 'neco', 'nabteb', 'pin'],
      ),
      _Shortcut(
        label: 'Transport',
        icon: Icons.directions_bus_rounded,
        color: const Color(0xFF38BDF8),
        page: const TransportScreen(),
        aliases: const ['lcc', 'toll', 'etag', 'bus', 'gig', 'abc'],
      ),
      _Shortcut(
        label: 'Government',
        icon: Icons.account_balance_rounded,
        color: const Color(0xFFFFD166),
        page: const GovernmentScreen(),
        aliases: const ['rrr', 'remita', 'frsc', 'passport', 'cac'],
      ),
      _Shortcut(
        label: 'Betting',
        icon: Icons.sports_soccer_rounded,
        color: const Color(0xFFFF4D4D),
        page: const BettingFundingScreen(),
        aliases: const ['sportybet', 'bet9ja', '1xbet', 'betking'],
      ),
      _Shortcut(
        label: 'More',
        icon: Icons.grid_view_rounded,
        color: AppColors.primary,
        page: const AllServicesPage(),
        aliases: const ['marketplace', 'netflix', 'gift cards', 'events'],
      ),
    ];

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(AppColors.radius),
            onTap: () => onOpenTab(4),
            child: Row(
              children: [
                Container(
                  height: 54,
                  width: 54,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFE082), AppColors.primary],
                    ),
                    borderRadius: BorderRadius.circular(AppColors.radius),
                  ),
                  child: const Icon(
                    Icons.person_rounded,
                    color: AppColors.deepNavy,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        userProvider.userName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${userProvider.bankStatus} • ${userProvider.accountNumber}',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: const Text(
                    'Profile',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _HomeHero(onOpenTab: onOpenTab),
          const SizedBox(height: 16),
          const _PromoHudCard(),
          const SizedBox(height: 16),
          _SmartSearchCard(shortcuts: shortcuts),
          const SizedBox(height: 18),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _MetricCard(
                label: 'Bank Status',
                value: userProvider.bankStatus,
                icon: Icons.verified_user_rounded,
                tone: AppColors.success,
              ),
              _MetricCard(
                label: 'Total BR9 Gold',
                value: '${userProvider.br9GoldPoints}',
                icon: Icons.workspace_premium_rounded,
                tone: AppColors.primary,
              ),
              _MetricCard(
                label: 'Daily Streak',
                value: '${userProvider.dailyStreak} days',
                icon: Icons.local_fire_department_rounded,
                tone: const Color(0xFFFF8A00),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Hero(
            tag: kWalletHeroTag,
            child: Material(
              color: Colors.transparent,
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF121212), Color(0xFF1F1A00)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white10),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Wallet Balance',
                      style: TextStyle(color: Colors.white70),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '₦${userProvider.walletBalance.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 30,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _WalletActionButton(
                            label: 'Add Money',
                            icon: Icons.add_circle_outline_rounded,
                            highlighted: true,
                            onTap: () =>
                                _pushServicePage(context, const TopupPage()),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _WalletActionButton(
                            label: 'Transfer to Buddy',
                            icon: Icons.swap_horiz_rounded,
                            onTap: () =>
                                _pushServicePage(context, const TransferPage()),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 22),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Quick Bill Pay',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              TextButton(
                onPressed: () => onOpenTab(1),
                child: const Text('Open Bills'),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Clear, specific actions so every payment feels simple and premium.',
            style: TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: shortcuts.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.96,
            ),
            itemBuilder: (context, index) {
              return _ShortcutTile(shortcut: shortcuts[index]);
            },
          ),
          const SizedBox(height: 22),
          InkWell(
            borderRadius: BorderRadius.circular(24),
            onTap: () => onOpenTab(2),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF101010),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                children: [
                  Container(
                    height: 54,
                    width: 54,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(
                      Icons.sports_esports_rounded,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Market Runner',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Score ${userProvider.marketRunnerScore} • ${(userProvider.marketRunnerProgress * 100).round()}% completion',
                          style: const TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SmartSearchCard extends StatefulWidget {
  const _SmartSearchCard({required this.shortcuts});

  final List<_Shortcut> shortcuts;

  @override
  State<_SmartSearchCard> createState() => _SmartSearchCardState();
}

class _SmartSearchCardState extends State<_SmartSearchCard> {
  final _controller = TextEditingController();
  List<_Shortcut> _matches = const [];

  @override
  void initState() {
    super.initState();
    _matches = widget.shortcuts.take(4).toList(growable: false);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _updateMatches(String value) {
    final query = value.trim().toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _matches = widget.shortcuts.take(4).toList(growable: false);
        return;
      }

      _matches = widget.shortcuts
          .where((shortcut) {
            final haystack = [
              shortcut.label,
              ...shortcut.aliases,
            ].join(' ').toLowerCase();
            return haystack.contains(query);
          })
          .take(4)
          .toList(growable: false);
    });
  }

  void _openFirstMatch() {
    final match = _matches.isNotEmpty ? _matches.first : null;
    if (match != null) {
      _pushServicePage(context, match.page);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF101010),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Find any BR9ja service',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try DStv, LCC, WAEC, SportyBet, RRR, or Electricity.',
            style: TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _controller,
            onChanged: _updateMatches,
            onSubmitted: (_) => _openFirstMatch(),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              prefixIcon: const Icon(
                Icons.search_rounded,
                color: AppColors.primary,
              ),
              suffixIcon: IconButton(
                onPressed: _openFirstMatch,
                icon: const Icon(Icons.arrow_forward_rounded),
                color: AppColors.primary,
              ),
              hintText: 'Search service, biller, or keyword',
              hintStyle: const TextStyle(color: Colors.white54),
              filled: true,
              fillColor: Colors.white.withValues(alpha: 0.05),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: Colors.white12),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: Colors.white12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(
                  color: AppColors.primary,
                  width: 1.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _matches
                .map(
                  (shortcut) => ActionChip(
                    avatar: Icon(
                      shortcut.icon,
                      size: 18,
                      color: shortcut.color,
                    ),
                    label: Text(shortcut.label),
                    onPressed: () => _pushServicePage(context, shortcut.page),
                    backgroundColor: shortcut.color.withValues(alpha: 0.12),
                    labelStyle: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
                    side: BorderSide(
                      color: shortcut.color.withValues(alpha: 0.26),
                    ),
                  ),
                )
                .toList(growable: false),
          ),
        ],
      ),
    );
  }
}

class _PromoHudCard extends StatefulWidget {
  const _PromoHudCard();

  @override
  State<_PromoHudCard> createState() => _PromoHudCardState();
}

class _PromoHudCardState extends State<_PromoHudCard> {
  Map<String, dynamic>? _promo;
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _loadPromo();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _loadPromo() async {
    try {
      final response = await BR9ApiClient.instance.fetchPromoStatus();
      final data = response['data'] as Map<String, dynamic>?;
      if (!mounted) {
        return;
      }
      setState(() => _promo = data);
      _startTicker();
    } on BR9ApiException {
      if (!mounted) {
        return;
      }
      setState(() => _promo = null);
    }
  }

  void _startTicker() {
    _ticker?.cancel();
    final promo = _promo;
    if (promo == null) {
      return;
    }

    final status = (promo['status'] ?? '').toString();
    if (status != 'active' && status != 'upcoming') {
      return;
    }

    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted || _promo == null) {
        timer.cancel();
        return;
      }

      setState(() {
        if (status == 'active') {
          final next = (((_promo!['secondsRemaining'] as num?) ?? 0) - 1).clamp(
            0,
            999999,
          );
          _promo = {..._promo!, 'secondsRemaining': next};
          if (next == 0) {
            timer.cancel();
            unawaited(_loadPromo());
          } else if (next % 15 == 0) {
            unawaited(_loadPromo());
          }
        } else {
          final next = (((_promo!['secondsUntilStart'] as num?) ?? 0) - 1)
              .clamp(0, 999999);
          _promo = {..._promo!, 'secondsUntilStart': next};
          if (next == 0) {
            timer.cancel();
            unawaited(_loadPromo());
          }
        }
      });
    });
  }

  String _formatCountdown(int seconds) {
    final safe = seconds < 0 ? 0 : seconds;
    final hours = safe ~/ 3600;
    final minutes = (safe % 3600) ~/ 60;
    final remaining = safe % 60;
    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${remaining.toString().padLeft(2, '0')}';
    }
    return '${minutes.toString().padLeft(2, '0')}:${remaining.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final promo = _promo;
    if (promo == null || (promo['status'] == null)) {
      return const SizedBox.shrink();
    }

    final status = (promo['status'] ?? '').toString();
    final active = status == 'active';
    final upcoming = status == 'upcoming';
    final spotsRemaining = promo['spotsRemaining'];
    final bannerText = (promo['bannerText'] ?? '').toString();
    final countdown = active
        ? _formatCountdown(((promo['secondsRemaining'] as num?) ?? 0).toInt())
        : _formatCountdown(((promo['secondsUntilStart'] as num?) ?? 0).toInt());

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: active
              ? const [Color(0xFFFFD84D), Color(0xFFFFA400)]
              : const [Color(0xFF1D2433), Color(0xFF0F172A)],
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: (active ? AppColors.primary : Colors.black).withValues(
              alpha: 0.18,
            ),
            blurRadius: 22,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 46,
            width: 46,
            decoration: BoxDecoration(
              color: active
                  ? AppColors.deepNavy.withValues(alpha: 0.16)
                  : Colors.white.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              active ? Icons.flash_on_rounded : Icons.schedule_rounded,
              color: active ? AppColors.deepNavy : AppColors.primary,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  active
                      ? 'Golden Window Live'
                      : upcoming
                      ? 'Golden Window Scheduled'
                      : 'Promo Update',
                  style: TextStyle(
                    color: active ? AppColors.deepNavy : AppColors.primary,
                    fontWeight: FontWeight.w900,
                    fontSize: 13,
                    letterSpacing: 0.4,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  bannerText.isEmpty
                      ? 'Flash Sale Ended! Stay tuned for the next Golden Window.'
                      : bannerText,
                  style: TextStyle(
                    color: active ? AppColors.deepNavy : Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _PromoPill(
                      label: active
                          ? 'Ends in $countdown'
                          : 'Starts in $countdown',
                      darkText: active,
                    ),
                    if (spotsRemaining != null)
                      _PromoPill(
                        label: '$spotsRemaining spots left',
                        darkText: active,
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PromoPill extends StatelessWidget {
  const _PromoPill({required this.label, required this.darkText});

  final String label;
  final bool darkText;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: darkText
            ? AppColors.deepNavy.withValues(alpha: 0.14)
            : Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: darkText ? AppColors.deepNavy : Colors.white,
          fontWeight: FontWeight.w800,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _HomeHero extends StatelessWidget {
  const _HomeHero({required this.onOpenTab});

  final ValueChanged<int> onOpenTab;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF000000), Color(0xFF1D1600), Color(0xFF000000)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white10),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -18,
            top: -18,
            child: Container(
              height: 120,
              width: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primary.withValues(alpha: 0.12),
              ),
            ),
          ),
          Positioned(
            left: 12,
            bottom: -26,
            child: Container(
              height: 92,
              width: 92,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.success.withValues(alpha: 0.10),
              ),
            ),
          ),
          Column(
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
                  'Afrocentric Minimalism',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'Play Games. Pay Bills. Get Paid.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 34,
                  height: 1.02,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'BR9ja now leads with Games, BR9 Gold, and Profile clarity. Your next move is obvious whether you are paying bills fast or climbing the Market Runner board.',
                style: TextStyle(color: Colors.white70, height: 1.6),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => onOpenTab(2),
                      icon: const Icon(Icons.sports_esports_rounded),
                      label: const Text('Start Gaming Now'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => onOpenTab(1),
                      icon: const Icon(Icons.receipt_long_rounded),
                      label: const Text('Quick Bill Pay'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
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
      width: 160,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF111111),
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
            const SizedBox(height: 14),
            Text(
              label,
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WalletActionButton extends StatelessWidget {
  const _WalletActionButton({
    required this.label,
    required this.icon,
    required this.onTap,
    this.highlighted = false,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    return FilledButton.icon(
      style: FilledButton.styleFrom(
        backgroundColor: highlighted
            ? AppColors.primary
            : Colors.white.withValues(alpha: 0.06),
        foregroundColor: highlighted ? AppColors.deepNavy : Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 15),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: highlighted
              ? BorderSide.none
              : const BorderSide(color: Colors.white12),
        ),
      ),
      onPressed: onTap,
      icon: Icon(icon, size: 18),
      label: Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
    );
  }
}

class _Shortcut {
  const _Shortcut({
    required this.label,
    required this.icon,
    required this.color,
    required this.page,
    this.aliases = const [],
  });

  final String label;
  final IconData icon;
  final Color color;
  final Widget page;
  final List<String> aliases;
}

class _ShortcutTile extends StatelessWidget {
  const _ShortcutTile({required this.shortcut});

  final _Shortcut shortcut;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: () => _pushServicePage(context, shortcut.page),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF111111),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 46,
              width: 46,
              decoration: BoxDecoration(
                color: shortcut.color.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(shortcut.icon, color: shortcut.color),
            ),
            const Spacer(),
            Text(
              shortcut.label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GoldHubPage extends StatelessWidget {
  const _GoldHubPage();

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final progress = userProvider.marketRunnerProgress;

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('BR9 Gold'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF171100), Color(0xFF050505)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.2),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Game Completion Progress',
                  style: TextStyle(
                    color: Colors.white70,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${(progress * 100).round()}% complete',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    minHeight: 12,
                    value: progress,
                    backgroundColor: Colors.white12,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'BR9 Gold now grows from Market Runner completion, wallet momentum, and consistent streaks instead of match-result prediction.',
                  style: TextStyle(color: Colors.white70, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _MetricCard(
                label: 'BR9 Gold Wallet',
                value: '${userProvider.br9GoldPoints}',
                icon: Icons.workspace_premium_rounded,
                tone: AppColors.primary,
              ),
              _MetricCard(
                label: 'Runner Score',
                value: '${userProvider.marketRunnerScore}',
                icon: Icons.speed_rounded,
                tone: const Color(0xFF38BDF8),
              ),
              _MetricCard(
                label: 'Daily Streak',
                value: '${userProvider.dailyStreak} days',
                icon: Icons.local_fire_department_rounded,
                tone: const Color(0xFFFF8A00),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'Progress Milestones',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          _GoldMilestoneTile(
            title: 'Wallet Ready',
            subtitle:
                'Fund your BR9 wallet to unlock your first runner milestone.',
            complete: userProvider.walletBalance > 0,
          ),
          _GoldMilestoneTile(
            title: '100 BR9 Gold Checkpoint',
            subtitle:
                'Reach at least 100 BR9 Gold to light up your weekly run.',
            complete: userProvider.br9GoldPoints >= 100,
          ),
          _GoldMilestoneTile(
            title: '3-Day Streak',
            subtitle: 'Show consistency by keeping your daily streak alive.',
            complete: userProvider.dailyStreak >= 3,
          ),
          _GoldMilestoneTile(
            title: 'Verified Status',
            subtitle:
                'Finish liveness verification to unlock the security bonus.',
            complete: userProvider.isLivenessVerified,
          ),
        ],
      ),
    );
  }
}

class _GoldMilestoneTile extends StatelessWidget {
  const _GoldMilestoneTile({
    required this.title,
    required this.subtitle,
    required this.complete,
  });

  final String title;
  final String subtitle;
  final bool complete;

  @override
  Widget build(BuildContext context) {
    final tone = complete ? AppColors.success : Colors.white54;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF101010),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Container(
            height: 42,
            width: 42,
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              complete
                  ? Icons.check_circle_rounded
                  : Icons.radio_button_unchecked,
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
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white70, height: 1.45),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GamesNavIcon extends StatelessWidget {
  const _GamesNavIcon({required this.selected});

  final bool selected;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      height: selected ? 48 : 42,
      width: selected ? 48 : 42,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: selected
            ? const LinearGradient(
                colors: [Color(0xFFFFE082), AppColors.primary],
              )
            : null,
        color: selected ? null : Colors.white.withValues(alpha: 0.04),
        boxShadow: selected
            ? const [
                BoxShadow(
                  color: Color(0x44FFD700),
                  blurRadius: 18,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      child: Icon(
        Icons.sports_esports_rounded,
        size: selected ? 26 : 22,
        color: selected ? AppColors.deepNavy : Colors.white70,
      ),
    );
  }
}

void _pushServicePage(BuildContext context, Widget page) {
  Navigator.push(
    context,
    PageRouteBuilder<void>(
      transitionDuration: const Duration(milliseconds: 320),
      pageBuilder: (_, animation, secondaryAnimation) => page,
      transitionsBuilder: (_, animation, secondaryAnimation, child) {
        final fade = CurvedAnimation(parent: animation, curve: Curves.easeOut);
        final slide = Tween<Offset>(
          begin: const Offset(0, 0.04),
          end: Offset.zero,
        ).animate(fade);
        return FadeTransition(
          opacity: fade,
          child: SlideTransition(position: slide, child: child),
        );
      },
    ),
  );
}
