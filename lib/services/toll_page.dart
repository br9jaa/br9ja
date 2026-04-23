import 'package:flutter/material.dart';

import 'service_ui.dart';

class TollPage extends StatelessWidget {
  const TollPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Toll Payments',
      subtitle:
          'Top up your LCC E-Tag and road access profile in a rich payment flow.',
      heroIcon: Icons.toll_rounded,
      totalAmount: '₦0.00',
      child: Column(
        children: [
          const ActionableSelectRow(
            label: 'Select Plan',
            value: 'LCC E-Tag Top-up',
            icon: Icons.route_rounded,
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'E-Tag / Account Number',
            icon: Icons.confirmation_number_rounded,
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
