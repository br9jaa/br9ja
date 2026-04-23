import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';
import 'betting_funding_screen.dart';
import 'education_screen.dart';
import 'electricity_screen.dart';
import 'government_screen.dart';
import 'transport_screen.dart';
import 'tv_internet_screen.dart';

class MarketplaceScreen extends StatelessWidget {
  const MarketplaceScreen({super.key});

  static const List<_MarketplaceCategory> _categories = [
    _MarketplaceCategory(
      title: 'Airtime',
      subtitle: 'Top up all major networks',
      icon: Icons.phone_iphone_rounded,
      color: Color(0xFF2F80ED),
      sampleAmount: 1000,
      cashbackPoints: 10,
    ),
    _MarketplaceCategory(
      title: 'Education',
      subtitle: 'WAEC, JAMB, NECO, and NABTEB PINs',
      icon: Icons.school_rounded,
      color: Color(0xFF9B5DE5),
      sampleAmount: 3500,
      cashbackPoints: 70,
      destination: EducationScreen(),
    ),
    _MarketplaceCategory(
      title: 'Electricity',
      subtitle: 'Verify meter and buy power tokens',
      icon: Icons.bolt_rounded,
      color: Color(0xFFFFB703),
      sampleAmount: 2500,
      cashbackPoints: 25,
      destination: ElectricityScreen(),
    ),
    _MarketplaceCategory(
      title: 'TV & Internet',
      subtitle: 'Renew cable and internet subscriptions',
      icon: Icons.connected_tv_rounded,
      color: Color(0xFF00B4D8),
      sampleAmount: 4500,
      cashbackPoints: 68,
      destination: TvInternetScreen(),
    ),
    _MarketplaceCategory(
      title: 'Transport',
      subtitle: 'LCC tolls and inter-state bus booking',
      icon: Icons.directions_bus_rounded,
      color: Color(0xFF7C3AED),
      sampleAmount: 3000,
      cashbackPoints: 30,
      destination: TransportScreen(),
    ),
    _MarketplaceCategory(
      title: 'Government',
      subtitle: 'Generate or pay RRR bills',
      icon: Icons.account_balance_rounded,
      color: Color(0xFF16A34A),
      sampleAmount: 10000,
      cashbackPoints: 50,
      destination: GovernmentScreen(),
    ),
    _MarketplaceCategory(
      title: 'Betting',
      subtitle: 'Fund verified betting wallets',
      icon: Icons.sports_soccer_rounded,
      color: Color(0xFFEF4444),
      sampleAmount: 2000,
      cashbackPoints: 10,
      destination: BettingFundingScreen(),
    ),
    _MarketplaceCategory(
      title: 'Goods',
      subtitle: 'Daily needs and essentials',
      icon: Icons.shopping_bag_rounded,
      color: Color(0xFF22C55E),
      sampleAmount: 5000,
      cashbackPoints: 50,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Daily Needs'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _categories.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 14,
          mainAxisSpacing: 14,
          childAspectRatio: 0.84,
        ),
        itemBuilder: (context, index) {
          final category = _categories[index];
          return _MarketplaceTile(
            category: category,
            onTap: () => _openCategory(context, category),
          );
        },
      ),
    );
  }

  void _openCategory(BuildContext context, _MarketplaceCategory category) {
    final destination = category.destination;
    if (destination != null) {
      Navigator.of(
        context,
      ).push(MaterialPageRoute<void>(builder: (_) => destination));
      return;
    }

    _openCheckout(context, category);
  }

  void _openCheckout(BuildContext context, _MarketplaceCategory category) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF071B31),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (_) => _CheckoutSheet(category: category),
    );
  }
}

class _MarketplaceTile extends StatelessWidget {
  const _MarketplaceTile({required this.category, required this.onTap});

  final _MarketplaceCategory category;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF0A223D),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 52,
              width: 52,
              decoration: BoxDecoration(
                color: category.color.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(category.icon, color: category.color),
            ),
            const Spacer(),
            Text(
              category.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              category.subtitle,
              style: const TextStyle(color: Colors.white70, height: 1.35),
            ),
            const SizedBox(height: 10),
            Text(
              '+${category.cashbackPoints} BR9 Gold cashback',
              style: const TextStyle(
                color: AppColors.neonGold,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckoutSheet extends StatefulWidget {
  const _CheckoutSheet({required this.category});

  final _MarketplaceCategory category;

  @override
  State<_CheckoutSheet> createState() => _CheckoutSheetState();
}

class _CheckoutSheetState extends State<_CheckoutSheet> {
  bool _submitting = false;

  Future<void> _completePurchase() async {
    setState(() => _submitting = true);

    try {
      final response = await BR9ApiClient.instance.post(
        '/api/user/add-gold',
        data: {
          'points': widget.category.cashbackPoints,
          'reason': 'marketplace-cashback:${widget.category.title}',
        },
      );
      final data = response['data'];
      if (data is Map<String, dynamic>) {
        final points = data['br9GoldPoints'];
        if (points is num && mounted) {
          context.read<UserProvider>().setGoldPoints(points.toInt());
        }
      }

      if (!mounted) {
        return;
      }
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Purchase successful. +${widget.category.cashbackPoints} BR9 Gold awarded.',
          ),
        ),
      );
    } on BR9ApiException catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.message)));
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final walletBalance = context.watch<UserProvider>().walletBalance;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                height: 4,
                width: 46,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            const SizedBox(height: 22),
            Text(
              widget.category.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Wallet balance: ₦${walletBalance.toStringAsFixed(2)}',
              style: const TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 18),
            _CheckoutRow(
              label: 'Estimated purchase',
              value: '₦${widget.category.sampleAmount.toStringAsFixed(2)}',
            ),
            _CheckoutRow(
              label: 'Cashback',
              value: '+${widget.category.cashbackPoints} BR9 Gold',
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _submitting ? null : _completePurchase,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.neonGold,
                  foregroundColor: AppColors.deepNavy,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(_submitting ? 'Processing...' : 'Pay with Wallet'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckoutRow extends StatelessWidget {
  const _CheckoutRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Expanded(
            child: Text(label, style: const TextStyle(color: Colors.white70)),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _MarketplaceCategory {
  const _MarketplaceCategory({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.sampleAmount,
    required this.cashbackPoints,
    this.destination,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final double sampleAmount;
  final int cashbackPoints;
  final Widget? destination;
}
