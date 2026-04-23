import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';
import '../../services/notification_service.dart';
import '../../services/security_gateway.dart';
import '../../services/transaction_pin_prompt.dart';
import 'gov_receipt_page.dart';

class GovernmentScreen extends StatefulWidget {
  const GovernmentScreen({super.key});

  @override
  State<GovernmentScreen> createState() => _GovernmentScreenState();
}

class _GovernmentScreenState extends State<GovernmentScreen> {
  final _amountController = TextEditingController();
  final _payerController = TextEditingController();
  final _rrrController = TextEditingController();
  final _existingAmountController = TextEditingController();
  final _mdaOptions = const ['University Fees', 'FRSC', 'Immigration', 'CAC'];

  String _serviceType = 'University Fees';
  bool _loading = false;

  @override
  void dispose() {
    _amountController.dispose();
    _payerController.dispose();
    _rrrController.dispose();
    _existingAmountController.dispose();
    super.dispose();
  }

  Future<void> _generateRrr() async {
    setState(() => _loading = true);
    try {
      final amount = double.tryParse(_amountController.text.trim()) ?? 0;
      final response = await BR9ApiClient.instance.generateRrr(
        serviceType: _serviceType,
        amount: amount,
        payerName: _payerController.text.trim(),
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      if (!mounted) {
        return;
      }
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => GovReceiptPage(
            rrr: (data['rrr'] ?? '').toString(),
            amount: (data['amount'] as num?)?.toDouble() ?? amount,
            serviceType: _serviceType,
            status: (data['status'] ?? 'generated').toString(),
            reference: (data['providerReference'] ?? '').toString(),
          ),
        ),
      );
    } on BR9ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _payExistingRrr() async {
    final authenticated = await SecurityGateway.authenticate(
      context: context,
      reason: 'Confirm government payment',
    );
    if (!authenticated || !mounted) {
      return;
    }

    final transactionPin = await requestTransactionPin(
      context: context,
      title: 'Confirm Government Payment',
    );
    if (transactionPin == null || !mounted) {
      return;
    }

    setState(() => _loading = true);
    try {
      final amount =
          double.tryParse(_existingAmountController.text.trim()) ?? 0;
      final response = await BR9ApiClient.instance.payRrr(
        rrr: _rrrController.text.trim(),
        amount: amount,
        transactionPin: transactionPin,
        serviceType: 'Existing RRR',
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      final points = data['br9GoldPoints'];
      if (points is num && mounted) {
        context.read<UserProvider>().setGoldPoints(points.toInt());
      }
      if (!mounted) {
        return;
      }
      await NotificationService.transactionSuccess();
      if (!mounted) {
        return;
      }
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => GovReceiptPage(
            rrr: (data['rrr'] ?? _rrrController.text).toString(),
            amount: (data['amount'] as num?)?.toDouble() ?? amount,
            serviceType: 'Existing RRR',
            status: 'paid',
            reference: (data['reference'] ?? data['receiptNumber'] ?? '')
                .toString(),
          ),
        ),
      );
    } on BR9ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.deepNavy,
        appBar: AppBar(
          title: const Text('Government'),
          backgroundColor: AppColors.deepNavy,
          bottom: const TabBar(
            indicatorColor: AppColors.neonGold,
            tabs: [
              Tab(text: 'Pay New Bill'),
              Tab(text: 'I have an RRR'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            ListView(
              padding: const EdgeInsets.all(20),
              children: [
                DropdownButtonFormField<String>(
                  initialValue: _serviceType,
                  dropdownColor: const Color(0xFF0A223D),
                  decoration: const InputDecoration(labelText: 'MDA / Service'),
                  items: _mdaOptions
                      .map(
                        (item) =>
                            DropdownMenuItem(value: item, child: Text(item)),
                      )
                      .toList(growable: false),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _serviceType = value);
                    }
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _payerController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Payer Name'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Amount'),
                ),
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: _loading ? null : _generateRrr,
                  icon: const Icon(Icons.account_balance_rounded),
                  label: Text(_loading ? 'Generating...' : 'Generate RRR'),
                ),
              ],
            ),
            ListView(
              padding: const EdgeInsets.all(20),
              children: [
                TextField(
                  controller: _rrrController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'RRR Number'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _existingAmountController,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Amount'),
                ),
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: _loading ? null : _payExistingRrr,
                  icon: const Icon(Icons.payments_rounded),
                  label: Text(_loading ? 'Paying...' : 'Pay with BR9ja Wallet'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
