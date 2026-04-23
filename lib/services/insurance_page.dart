import 'package:flutter/material.dart';

import 'service_ui.dart';

class InsurancePage extends StatelessWidget {
  const InsurancePage({super.key});

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Insurance',
      subtitle:
          'Verify policy numbers and prepare premium payments in one flow.',
      heroIcon: Icons.verified_user_rounded,
      serviceHeroTag: 'service-insurance',
      totalAmount: '₦0.00',
      child: Column(
        children: [
          const ActionableSelectRow(
            label: 'Select Plan',
            value: 'Premium Payment',
            icon: Icons.shield_rounded,
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Policy Number',
            icon: Icons.confirmation_number_rounded,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: () async {}, label: 'Proceed'),
        ],
      ),
    );
  }
}
