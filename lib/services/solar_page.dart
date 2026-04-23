import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import 'service_ui.dart';

class SolarPage extends StatefulWidget {
  const SolarPage({super.key});

  @override
  State<SolarPage> createState() => _SolarPageState();
}

class _SolarPageState extends State<SolarPage> {
  String _provider = 'Sun King';
  String _plan = 'Solar Subscription';

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Solar Services',
      subtitle:
          'Select your solar brand and verify your account with a richer filled UI.',
      heroIcon: Icons.solar_power_rounded,
      serviceHeroTag: 'service-solar',
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
                label: 'Sun King',
                icon: Icons.wb_sunny_rounded,
                isSelected: _provider == 'Sun King',
                onTap: () => setState(() => _provider = 'Sun King'),
              ),
              _ProviderChip(
                label: 'Lumos',
                icon: Icons.solar_power_rounded,
                isSelected: _provider == 'Lumos',
                onTap: () => setState(() => _provider = 'Lumos'),
              ),
              _ProviderChip(
                label: 'd.light',
                icon: Icons.light_mode_rounded,
                isSelected: _provider == 'd.light',
                onTap: () => setState(() => _provider = 'd.light'),
              ),
              _ProviderChip(
                label: 'Arnergy',
                icon: Icons.bolt_rounded,
                isSelected: _provider == 'Arnergy',
                onTap: () => setState(() => _provider = 'Arnergy'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _plan,
            icon: Icons.tune_rounded,
            onTap: () => _pick('Select Plan', [
              'Solar Subscription',
              'Device Repayment',
            ], (value) => _plan = value),
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Solar Account / Meter Number',
            icon: Icons.solar_power_rounded,
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
