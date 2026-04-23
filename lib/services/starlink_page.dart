import 'package:flutter/material.dart';

import 'service_ui.dart';

class StarlinkPage extends StatelessWidget {
  const StarlinkPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Starlink Support',
      subtitle:
          'Manage Starlink subscriptions and hardware assistance in Naira.',
      heroIcon: Icons.satellite_alt_rounded,
      totalAmount: '₦0.00',
      child: Column(
        children: [
          const ActionableSelectRow(
            label: 'Select Plan',
            value: 'Monthly Subscription',
            icon: Icons.public_rounded,
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Service Note / Identifier',
            icon: Icons.receipt_long_rounded,
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Amount (₦)',
            icon: Icons.payments_outlined,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: _noop, label: 'Proceed'),
        ],
      ),
    );
  }

  static Future<void> _noop() async {}
}
