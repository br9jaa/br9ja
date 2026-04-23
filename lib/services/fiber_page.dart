import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import 'service_ui.dart';

class FiberPage extends StatefulWidget {
  const FiberPage({super.key});

  @override
  State<FiberPage> createState() => _FiberPageState();
}

class _FiberPageState extends State<FiberPage> {
  String _selectedProvider = 'FiberOne';
  String _selectedPlan = 'Monthly Renewal';

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Fiber Internet',
      subtitle: 'Renew ipNX, FiberOne, and VDT plans with a rich-filled flow.',
      heroIcon: Icons.settings_input_antenna_rounded,
      serviceHeroTag: 'service-fiber',
      totalAmount: '₦0.00',
      child: Column(
        children: [
          ActionableSelectRow(
            label: 'Select Provider',
            value: _selectedProvider,
            icon: Icons.router_rounded,
            onTap: () => _pick('Select Provider', [
              'FiberOne',
              'ipNX',
              'VDT',
            ], (value) => _selectedProvider = value),
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _selectedPlan,
            icon: Icons.tune_rounded,
            onTap: () => _pick('Select Plan', [
              'Monthly Renewal',
              'Quarterly Renewal',
              'Dedicated Link',
            ], (value) => _selectedPlan = value),
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'User ID / Account Number',
            icon: Icons.badge_rounded,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: () async {}, label: 'Proceed'),
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
