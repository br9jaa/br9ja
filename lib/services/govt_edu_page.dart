import 'package:flutter/material.dart';

import 'service_ui.dart';

class GovtEduPage extends StatelessWidget {
  const GovtEduPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Govt / Edu',
      subtitle:
          'Handle school, exam, and public payment references in one dense layout.',
      heroIcon: Icons.account_balance_rounded,
      serviceHeroTag: 'service-govt-edu',
      totalAmount: '₦0.00',
      child: Column(
        children: [
          const ActionableSelectRow(
            label: 'Select Plan',
            value: 'Government / School Payment',
            icon: Icons.approval_rounded,
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Reference / Matric / Profile Number',
            icon: Icons.badge_rounded,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: () async {}, label: 'Proceed'),
        ],
      ),
    );
  }
}
