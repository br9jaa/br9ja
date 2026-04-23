import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';
import '../../services/notification_service.dart';
import '../../services/security_gateway.dart';
import '../../services/transaction_pin_prompt.dart';
import 'transport_success_page.dart';

class BettingFundingScreen extends StatefulWidget {
  const BettingFundingScreen({super.key});

  @override
  State<BettingFundingScreen> createState() => _BettingFundingScreenState();
}

class _BettingFundingScreenState extends State<BettingFundingScreen> {
  final _customerIdController = TextEditingController();
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();
  final _bookmakers = const ['SportyBet', 'Bet9ja', '1XBet', 'BetKing'];

  String _bookmaker = 'SportyBet';
  String? _customerName;
  bool _verifying = false;
  bool _funding = false;

  @override
  void dispose() {
    _customerIdController.dispose();
    _amountController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _verifyAccount() async {
    setState(() => _verifying = true);
    try {
      final response = await BR9ApiClient.instance.verifyBettingAccount(
        bookmaker: _bookmaker,
        customerId: _customerIdController.text.trim(),
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      if (mounted) {
        setState(() => _customerName = (data['customerName'] ?? '').toString());
      }
    } on BR9ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) {
        setState(() => _verifying = false);
      }
    }
  }

  Future<void> _fundWallet() async {
    final authenticated = await SecurityGateway.authenticate(
      context: context,
      reason: 'Confirm betting wallet funding',
    );
    if (!authenticated || !mounted) {
      return;
    }

    final transactionPin = await requestTransactionPin(
      context: context,
      title: 'Confirm Betting Funding',
    );
    if (transactionPin == null || !mounted) {
      return;
    }

    setState(() => _funding = true);
    try {
      final amount = double.tryParse(_amountController.text.trim()) ?? 0;
      final response = await BR9ApiClient.instance.fundBettingWallet(
        bookmaker: _bookmaker,
        customerId: _customerIdController.text.trim(),
        amount: amount,
        phone: _phoneController.text.trim(),
        transactionPin: transactionPin,
        customerName: _customerName,
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
          builder: (_) => TransportSuccessPage(
            title: 'Funding Successful',
            reference: (data['reference'] ?? data['receiptNumber'] ?? '')
                .toString(),
            message: 'Your $_bookmaker wallet funding has been submitted.',
            amount: amount,
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
        setState(() => _funding = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Betting Funding'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          DropdownButtonFormField<String>(
            initialValue: _bookmaker,
            dropdownColor: const Color(0xFF0A223D),
            decoration: const InputDecoration(labelText: 'Bookmaker'),
            items: _bookmakers
                .map((item) => DropdownMenuItem(value: item, child: Text(item)))
                .toList(growable: false),
            onChanged: (value) {
              if (value != null) {
                setState(() {
                  _bookmaker = value;
                  _customerName = null;
                });
              }
            },
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _customerIdController,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'User ID / Customer ID',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _verifying ? null : _verifyAccount,
            icon: const Icon(Icons.verified_user_rounded),
            label: Text(_verifying ? 'Verifying...' : 'Validate ID'),
          ),
          if (_customerName != null) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF063B2E),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Text(
                'Account owner: $_customerName',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
          const SizedBox(height: 18),
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(labelText: 'Amount'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(labelText: 'Phone Number'),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: _funding ? null : _fundWallet,
            icon: const Icon(Icons.sports_soccer_rounded),
            label: Text(_funding ? 'Funding...' : 'Fund Wallet'),
          ),
        ],
      ),
    );
  }
}
