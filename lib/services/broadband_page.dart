import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import 'service_ui.dart';

class BroadbandPage extends StatefulWidget {
  const BroadbandPage({super.key});

  @override
  State<BroadbandPage> createState() => _BroadbandPageState();
}

class _BroadbandPageState extends State<BroadbandPage> {
  String _selectedProvider = 'Smile';
  String _selectedPlan = 'Standard Bundle';

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Broadband Service',
      subtitle:
          'Buy Smile, Spectranet, Swift, and Tizeti bundles in one place.',
      heroIcon: Icons.router_rounded,
      totalAmount: '₦0.00',
      child: Column(
        children: [
          ActionableSelectRow(
            label: 'Select Provider',
            value: _selectedProvider,
            icon: Icons.wifi_rounded,
            onTap: () => _showOptions(
              'Select Provider',
              ['Smile', 'Spectranet', 'Swift', 'Tizeti'],
              (value) {
                _selectedProvider = value;
              },
            ),
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _selectedPlan,
            icon: Icons.tune_rounded,
            onTap: () => _showOptions(
              'Select Plan',
              ['Standard Bundle', 'Night Bundle', 'Unlimited'],
              (value) {
                _selectedPlan = value;
              },
            ),
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Customer ID / User ID',
            icon: Icons.badge_rounded,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: () async {}, label: 'Proceed'),
        ],
      ),
    );
  }

  Future<void> _showOptions(
    String title,
    List<String> items,
    ValueChanged<String> setter,
  ) async {
    final picked = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.deepNavy,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => ListView(
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
              tileColor: const Color(0xFF0A223D),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              title: Text(item, style: const TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(context, item),
            ),
          ),
        ],
      ),
    );
    if (picked != null) setState(() => setter(picked));
  }
}
