import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import 'service_ui.dart';

class StreamingPage extends StatefulWidget {
  const StreamingPage({super.key});

  @override
  State<StreamingPage> createState() => _StreamingPageState();
}

class _StreamingPageState extends State<StreamingPage> {
  String _provider = 'DSTV';
  String _plan = 'Compact';

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Streaming',
      subtitle:
          'Select your TV provider, package, and account in a denser payment layout.',
      heroIcon: Icons.ondemand_video_rounded,
      serviceHeroTag: 'service-streaming',
      totalAmount: '₦0.00',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Select Provider',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: [
              _ProviderChip(
                label: 'DSTV',
                icon: Icons.live_tv_rounded,
                isSelected: _provider == 'DSTV',
                onTap: () => setState(() => _provider = 'DSTV'),
              ),
              _ProviderChip(
                label: 'GOTV',
                icon: Icons.tv_rounded,
                isSelected: _provider == 'GOTV',
                onTap: () => setState(() => _provider = 'GOTV'),
              ),
              _ProviderChip(
                label: 'StarTimes',
                icon: Icons.ondemand_video_rounded,
                isSelected: _provider == 'StarTimes',
                onTap: () => setState(() => _provider = 'StarTimes'),
              ),
              _ProviderChip(
                label: 'Showmax',
                icon: Icons.movie_rounded,
                isSelected: _provider == 'Showmax',
                onTap: () => setState(() => _provider = 'Showmax'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _plan,
            icon: Icons.tune_rounded,
            onTap: () => _pick('Select Plan', [
              'Compact',
              'Premium',
              'Basic',
              'Family',
            ], (value) => _plan = value),
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Smartcard / Profile Number',
            icon: Icons.confirmation_number_rounded,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: () {}, label: 'Proceed'),
        ],
      ),
    );
  }

  Future<void> _pick(
    String title,
    List<String> items,
    ValueChanged<String> setter,
  ) async {
    final picked = await showModalBottomSheet<String>(
      context: context,
      builder: (_) => _Sheet(title: title, items: items),
    );
    if (picked != null) setState(() => setter(picked));
  }
}

class _ProviderChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _ProviderChip({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: SizedBox(
        width: 72,
        child: Column(
          children: [
            Container(
              height: 60,
              width: 60,
              decoration: BoxDecoration(
                color: const Color(0xFF0A223D),
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.neonGold : Colors.white12,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Icon(icon, color: AppColors.neonGold),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Sheet extends StatelessWidget {
  final String title;
  final List<String> items;

  const _Sheet({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.deepNavy,
      child: ListView(
        shrinkWrap: true,
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          ...items.map(
            (item) => ListTile(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              tileColor: const Color(0xFF0A223D),
              title: Text(item, style: const TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(context, item),
            ),
          ),
        ],
      ),
    );
  }
}
