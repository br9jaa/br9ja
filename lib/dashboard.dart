import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/theme/br9_theme.dart';
import 'providers/user_provider.dart';
import 'screens/gaming/prediction_screen.dart';
import 'screens/marketplace/electricity_screen.dart';
import 'screens/marketplace/tv_internet_screen.dart';
import 'services/airtime_page.dart';
import 'services/all_services_page.dart';
import 'services/profile_page.dart';
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
      const _Br9HomePage(),
      const _RewardsPage(),
      const PredictionScreen(),
      const ProfilePage(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF081427),
      body: IndexedStack(index: _currentIndex, children: pages),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Container(
            height: 78,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x22000000),
                  blurRadius: 24,
                  offset: Offset(0, 14),
                ),
              ],
            ),
            child: Row(
              children: [
                _NavItem(
                  label: 'Home',
                  icon: Icons.home_rounded,
                  selected: _currentIndex == 0,
                  onTap: () => setState(() => _currentIndex = 0),
                ),
                _NavItem(
                  label: 'Rewards',
                  icon: Icons.workspace_premium_rounded,
                  selected: _currentIndex == 1,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
                _NavItem(
                  label: 'Game',
                  icon: Icons.sports_esports_rounded,
                  selected: _currentIndex == 2,
                  onTap: () => setState(() => _currentIndex = 2),
                  highlighted: true,
                ),
                _NavItem(
                  label: 'Profile',
                  icon: Icons.person_rounded,
                  selected: _currentIndex == 3,
                  onTap: () => setState(() => _currentIndex = 3),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Br9HomePage extends StatelessWidget {
  const _Br9HomePage();

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final displayName = _dashboardName(userProvider.userName);
    final balance = userProvider.isLoggedIn
        ? userProvider.walletBalance
        : 56390.26;

    const quickBills = <_BillShortcut>[
      _BillShortcut(
        label: 'Electricity',
        icon: Icons.bolt_rounded,
        color: Color(0xFFFFC857),
        page: ElectricityScreen(),
      ),
      _BillShortcut(
        label: 'Water',
        icon: Icons.water_drop_rounded,
        color: Color(0xFF6EC6FF),
        page: AllServicesPage(),
      ),
      _BillShortcut(
        label: 'TV Subscription',
        icon: Icons.live_tv_rounded,
        color: Color(0xFFD39CFF),
        page: TvInternetScreen(),
      ),
      _BillShortcut(
        label: 'Airtime & Data',
        icon: Icons.phone_android_rounded,
        color: Color(0xFF9CE0FF),
        page: AirtimePage(),
      ),
      _BillShortcut(
        label: 'Internet',
        icon: Icons.wifi_rounded,
        color: Color(0xFF8DEB90),
        page: TvInternetScreen(),
      ),
      _BillShortcut(
        label: 'More',
        icon: Icons.grid_view_rounded,
        color: AppColors.primary,
        page: AllServicesPage(),
      ),
    ];

    const transactions = <_RecentTransaction>[
      _RecentTransaction(
        title: 'Electricity Payment',
        subtitle: 'PHCN',
        amount: '₦12,000.00',
        time: 'Today 10:24 AM',
      ),
      _RecentTransaction(
        title: 'Airtime Purchase',
        subtitle: 'MTN Nigeria',
        amount: '₦1,500.00',
        time: 'Today 9:15 AM',
      ),
    ];

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF07111F), Color(0xFF0B1D3B), Color(0xFF07111F)],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: Opacity(
              opacity: 0.08,
              child: Image.asset(
                'assets/images/app_home.jpg',
                fit: BoxFit.cover,
                alignment: Alignment.topCenter,
              ),
            ),
          ),
          const _BlueBackdrop(),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 28),
              children: [
                const _DashboardLogo(),
                const SizedBox(height: 18),
                _UserRow(name: displayName),
                const SizedBox(height: 18),
                _WalletCard(balance: balance),
                const SizedBox(height: 22),
                _SectionHeader(
                  title: 'Recent Transactions',
                  actionLabel: 'View all',
                  onActionTap: () =>
                      _pushPage(context, const AllServicesPage()),
                ),
                const SizedBox(height: 12),
                ...transactions.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _TransactionTile(item: item),
                  ),
                ),
                const SizedBox(height: 10),
                const _SectionHeader(title: 'Pay Bills'),
                const SizedBox(height: 12),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final crossAxisCount = constraints.maxWidth < 340 ? 2 : 3;
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: quickBills.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.94,
                      ),
                      itemBuilder: (context, index) {
                        return _BillShortcutCard(shortcut: quickBills[index]);
                      },
                    );
                  },
                ),
                const SizedBox(height: 20),
                _PlayBanner(
                  onPlay: () => _pushPage(context, const PredictionScreen()),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RewardsPage extends StatelessWidget {
  const _RewardsPage();

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final goldPoints = userProvider.br9GoldPoints > 0
        ? userProvider.br9GoldPoints
        : 1000;
    final streak = userProvider.dailyStreak == 0 ? 4 : userProvider.dailyStreak;
    final progress = ((goldPoints / 2000).clamp(0, 1)).toDouble();

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF07111F), Color(0xFF0B1D3B), Color(0xFF07111F)],
        ),
      ),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
          children: [
            const _DashboardLogo(),
            const SizedBox(height: 22),
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                gradient: const LinearGradient(
                  colors: [Color(0xFF102346), Color(0xFF0C1730)],
                ),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'BR9 GOLD',
                    style: TextStyle(
                      color: AppColors.primary,
                      letterSpacing: 1.2,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '$goldPoints',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Keep your streak alive, pay bills, and play games to grow your next Monday payout.',
                    style: TextStyle(color: Colors.white70, height: 1.5),
                  ),
                  const SizedBox(height: 18),
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
                ],
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: _RewardStat(
                    title: 'Daily Streak',
                    value: '$streak days',
                    icon: Icons.local_fire_department_rounded,
                    tone: const Color(0xFFFFA24D),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _RewardStat(
                    title: 'Wallet Ready',
                    value: userProvider.walletBalance > 0
                        ? 'Active'
                        : 'Fund now',
                    icon: Icons.account_balance_wallet_rounded,
                    tone: const Color(0xFF6EC6FF),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            _PlayBanner(
              onPlay: () => _pushPage(context, const PredictionScreen()),
              compact: true,
            ),
            const SizedBox(height: 18),
            _RewardChecklist(
              items: <String>[
                'Play Market Runner daily',
                'Pay at least one bill this week',
                'Keep your quick wallet actions active',
                'Return on Monday for BR9 Gold conversion',
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardLogo extends StatelessWidget {
  const _DashboardLogo();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        Text(
          'br9',
          style: TextStyle(
            color: Colors.white,
            fontSize: 30,
            fontWeight: FontWeight.w900,
            letterSpacing: -1,
          ),
        ),
        Text(
          '.ng',
          style: TextStyle(
            color: AppColors.primary,
            fontSize: 30,
            fontWeight: FontWeight.w900,
            letterSpacing: -1,
          ),
        ),
      ],
    );
  }
}

class _UserRow extends StatelessWidget {
  const _UserRow({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          height: 56,
          width: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              colors: [Color(0xFFFFD56A), Color(0xFFFFB703)],
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x40FFD700),
                blurRadius: 18,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: const Icon(
            Icons.person_rounded,
            color: Color(0xFF14315A),
            size: 30,
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.2,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Premium wallet & bill payments',
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
            ],
          ),
        ),
        Container(
          height: 48,
          width: 48,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white10),
          ),
          child: const Icon(
            Icons.notifications_none_rounded,
            color: Colors.white,
            size: 24,
          ),
        ),
      ],
    );
  }
}

class _WalletCard extends StatelessWidget {
  const _WalletCard({required this.balance});

  final double balance;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1B5CC7), Color(0xFF233B94), Color(0xFF8A2BE2)],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33000000),
            blurRadius: 34,
            offset: Offset(0, 18),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'WALLET BALANCE',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 9,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'Wallet',
                  style: TextStyle(
                    color: Color(0xFF173A6E),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            '₦${balance.toStringAsFixed(2)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 34,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.8,
            ),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: _PrimaryActionButton(
                  label: 'TOP UP',
                  icon: Icons.add_circle_outline_rounded,
                  onTap: () => _pushPage(context, const TopupPage()),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _SecondaryActionButton(
                  label: 'GIFT USER',
                  icon: Icons.card_giftcard_rounded,
                  onTap: () => _pushPage(context, const TransferPage()),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PrimaryActionButton extends StatelessWidget {
  const _PrimaryActionButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return FilledButton.icon(
      style: FilledButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF173A6E),
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      onPressed: onTap,
      icon: Icon(icon, size: 18),
      label: Text(
        label,
        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
      ),
    );
  }
}

class _SecondaryActionButton extends StatelessWidget {
  const _SecondaryActionButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        side: const BorderSide(color: Colors.white24),
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      onPressed: onTap,
      icon: Icon(icon, size: 18),
      label: Text(
        label,
        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    this.actionLabel,
    this.onActionTap,
  });

  final String title;
  final String? actionLabel;
  final VoidCallback? onActionTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        if (actionLabel != null)
          TextButton(
            onPressed: onActionTap,
            child: Text(
              actionLabel!,
              style: const TextStyle(
                color: Colors.white70,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
      ],
    );
  }
}

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.item});

  final _RecentTransaction item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Container(
            height: 50,
            width: 50,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF3FF),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(
              item.title.contains('Electricity')
                  ? Icons.bolt_rounded
                  : Icons.phone_android_rounded,
              color: const Color(0xFF1B5CC7),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: const TextStyle(
                    color: Color(0xFF111827),
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  item.subtitle,
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  item.time,
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Text(
            item.amount,
            style: const TextStyle(
              color: Color(0xFFE11D48),
              fontWeight: FontWeight.w900,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}

class _BillShortcutCard extends StatelessWidget {
  const _BillShortcutCard({required this.shortcut});

  final _BillShortcut shortcut;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: () => _pushPage(context, shortcut.page),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              height: 50,
              width: 50,
              decoration: BoxDecoration(
                color: shortcut.color.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(shortcut.icon, color: shortcut.color, size: 28),
            ),
            const SizedBox(height: 10),
            Text(
              shortcut.label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF0F172A),
                fontWeight: FontWeight.w800,
                fontSize: 13,
                height: 1.25,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlayBanner extends StatelessWidget {
  const _PlayBanner({required this.onPlay, this.compact = false});

  final VoidCallback onPlay;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(compact ? 18 : 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF162C57), Color(0xFF0B1730), Color(0xFF3F2B78)],
        ),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'PLAY GAMES WIN BR9 GOLD',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 19,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Step into BR9ja game mode, push your streak, and keep your next reward conversion moving.',
                  style: TextStyle(color: Colors.white70, height: 1.5),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: const Color(0xFF102346),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                  onPressed: onPlay,
                  child: const Text(
                    'Play Now',
                    style: TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Container(
            height: compact ? 78 : 92,
            width: compact ? 78 : 92,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [Color(0xFFFFE082), Color(0xFFFFD700)],
              ),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x44FFD700),
                  blurRadius: 24,
                  offset: Offset(0, 12),
                ),
              ],
            ),
            child: const Icon(
              Icons.emoji_events_rounded,
              color: Color(0xFF14315A),
              size: 42,
            ),
          ),
        ],
      ),
    );
  }
}

class _RewardStat extends StatelessWidget {
  const _RewardStat({
    required this.title,
    required this.value,
    required this.icon,
    required this.tone,
  });

  final String title;
  final String value;
  final IconData icon;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF102346),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 42,
            width: 42,
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: tone),
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white70,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _RewardChecklist extends StatelessWidget {
  const _RewardChecklist({required this.items});

  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1D35),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Weekly Flow',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 14),
          ...items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 26,
                    width: 26,
                    margin: const EdgeInsets.only(top: 1),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Icon(
                      Icons.check_rounded,
                      color: AppColors.primary,
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      item,
                      style: const TextStyle(
                        color: Colors.white70,
                        height: 1.45,
                      ),
                    ),
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

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
    this.highlighted = false,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final background = highlighted && selected
        ? const LinearGradient(colors: [Color(0xFFFFE082), AppColors.primary])
        : null;

    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            decoration: BoxDecoration(
              gradient: background,
              color: background == null && selected
                  ? const Color(0xFFF3F7FF)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(22),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  color: selected
                      ? const Color(0xFF173A6E)
                      : const Color(0xFF6B7280),
                  size: highlighted && selected ? 28 : 24,
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: TextStyle(
                    color: selected
                        ? const Color(0xFF173A6E)
                        : const Color(0xFF6B7280),
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BlueBackdrop extends StatelessWidget {
  const _BlueBackdrop();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        children: [
          Positioned(
            top: -110,
            left: -90,
            child: Container(
              height: 240,
              width: 240,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0x331F7CFF),
              ),
            ),
          ),
          Positioned(
            top: 210,
            right: -84,
            child: Container(
              height: 210,
              width: 210,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0x22298BFF),
              ),
            ),
          ),
          Positioned(
            bottom: 80,
            left: -72,
            child: Container(
              height: 180,
              width: 180,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0x183C5CFF),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BillShortcut {
  const _BillShortcut({
    required this.label,
    required this.icon,
    required this.color,
    required this.page,
  });

  final String label;
  final IconData icon;
  final Color color;
  final Widget page;
}

class _RecentTransaction {
  const _RecentTransaction({
    required this.title,
    required this.subtitle,
    required this.amount,
    required this.time,
  });

  final String title;
  final String subtitle;
  final String amount;
  final String time;
}

String _dashboardName(String userName) {
  final trimmed = userName.trim();
  if (trimmed.isEmpty) {
    return 'STANKINGS';
  }
  final firstToken = trimmed.split(RegExp(r'\s+')).first;
  return firstToken.toUpperCase();
}

void _pushPage(BuildContext context, Widget page) {
  Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => page));
}
