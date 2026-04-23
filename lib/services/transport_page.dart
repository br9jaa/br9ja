import 'package:flutter/material.dart';

import 'service_ui.dart';

class TransportPage extends StatelessWidget {
  const TransportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Transport',
      subtitle: 'Top up transport wallets, transit IDs, and rider profiles.',
      heroIcon: Icons.directions_bus_rounded,
      serviceHeroTag: 'service-transport',
      totalAmount: '₦0.00',
      child: Column(
        children: [
          const ActionableSelectRow(
            label: 'Select Plan',
            value: 'Transit Wallet',
            icon: Icons.route_rounded,
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Transport Wallet / Plate / Rider ID',
            icon: Icons.local_taxi_rounded,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: () async {}, label: 'Proceed'),
        ],
      ),
    );
  }
}
