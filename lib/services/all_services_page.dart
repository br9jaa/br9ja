import 'package:flutter/material.dart';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import '../screens/marketplace/betting_funding_screen.dart';
import 'airtime_page.dart';
import 'broadband_page.dart';
import 'cable_page.dart';
import 'data_page.dart';
import 'electricity_page.dart';
import 'exams_page.dart';
import 'fiber_page.dart';
import 'jamb_page.dart';
import 'starlink_page.dart';
import 'toll_page.dart';

class AllServicesPage extends StatelessWidget {
  const AllServicesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final services = [
      _ServiceItem(
        label: 'Mobile Airtime',
        subtitle: 'MTN, Airtel, Glo, 9mobile',
        icon: Icons.phone_iphone_rounded,
        color: const Color(0xFF2F80ED),
        page: const AirtimePage(),
      ),
      _ServiceItem(
        label: 'Mobile Data',
        subtitle: 'SME, Corporate, Gifting',
        icon: Icons.wifi_tethering_rounded,
        color: const Color(0xFF00BFA5),
        page: const DataPage(),
      ),
      _ServiceItem(
        label: 'Electricity Tokens',
        subtitle: 'Prepaid and postpaid for DisCos',
        icon: Icons.bolt_rounded,
        color: const Color(0xFFFFB703),
        page: const ElectricityPage(),
      ),
      _ServiceItem(
        label: 'Cable TV',
        subtitle: 'DSTV, GOTV, StarTimes, Showmax',
        icon: Icons.tv_rounded,
        color: const Color(0xFFB5179E),
        page: const CablePage(),
      ),
      _ServiceItem(
        label: 'Toll Payments',
        subtitle: 'LCC e-tag top-up',
        icon: Icons.toll_rounded,
        color: const Color(0xFFF97316),
        page: const TollPage(),
      ),
      _ServiceItem(
        label: 'Broadband Service',
        subtitle: 'Smile, Spectranet, Swift, Tizeti',
        icon: Icons.router_rounded,
        color: const Color(0xFF7C3AED),
        page: const BroadbandPage(),
      ),
      _ServiceItem(
        label: 'Fiber Internet',
        subtitle: 'ipNX, FiberOne, VDT',
        icon: Icons.settings_input_antenna_rounded,
        color: const Color(0xFF16A34A),
        page: const FiberPage(),
      ),
      _ServiceItem(
        label: 'Starlink Support',
        subtitle: 'Subscription and hardware help',
        icon: Icons.satellite_alt_rounded,
        color: const Color(0xFF0EA5E9),
        page: const StarlinkPage(),
      ),
      _ServiceItem(
        label: 'Exam PINs',
        subtitle: 'WAEC, NECO, NABTEB',
        icon: Icons.school_rounded,
        color: const Color(0xFFEF4444),
        page: const ExamsPage(),
      ),
      _ServiceItem(
        label: 'Tertiary Entry',
        subtitle: 'JAMB UTME and Direct Entry',
        icon: Icons.menu_book_rounded,
        color: const Color(0xFF8B5CF6),
        page: const JambPage(),
      ),
      _ServiceItem(
        label: 'Bet Account Top Up',
        subtitle: 'Quick betting wallet funding',
        icon: Icons.sports_esports_rounded,
        color: const Color(0xFFEC4899),
        page: const BettingFundingScreen(),
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppColors.deepNavy,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          color: AppColors.neonGold,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
        title: const Text('All Services'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: services.length,
        separatorBuilder: (_, _) => const SizedBox(height: 14),
        itemBuilder: (context, index) {
          final service = services[index];
          return InkWell(
            borderRadius: BorderRadius.circular(24),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => service.page),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0A223D),
                borderRadius: BorderRadius.circular(24),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x120A2540),
                    blurRadius: 18,
                    offset: Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    height: 54,
                    width: 54,
                    decoration: BoxDecoration(
                      color: service.color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Icon(service.icon, color: service.color, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          service.label,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          service.subtitle,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 16,
                    color: AppColors.neonGold,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ServiceItem {
  final String label;
  final String subtitle;
  final IconData icon;
  final Color color;
  final Widget page;

  const _ServiceItem({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.page,
  });
}
