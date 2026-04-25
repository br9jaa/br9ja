import 'dart:async';

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
  final _searchController = TextEditingController();
  final _customerIdController = TextEditingController();
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();

  final _bookmakers = const <_BookmakerOption>[
    _BookmakerOption('SportyBet', Icons.sports_soccer_rounded),
    _BookmakerOption('Bet9ja', Icons.confirmation_number_rounded),
    _BookmakerOption('1XBet', Icons.flash_on_rounded),
    _BookmakerOption('BetKing', Icons.workspace_premium_rounded),
    _BookmakerOption('MSport', Icons.sports_basketball_rounded),
    _BookmakerOption('22Bet', Icons.stars_rounded),
  ];

  String _selectedBookmaker = 'SportyBet';
  String? _customerName;
  bool _verifying = false;
  bool _funding = false;
  bool _nameConfirmed = false;
  String? _pendingFundingId;
  Timer? _statusPollTimer;

  @override
  void initState() {
    super.initState();
    _phoneController.text = context.read<UserProvider>().phoneNumber;
    _customerIdController.addListener(_resetVerificationState);
  }

  @override
  void dispose() {
    _statusPollTimer?.cancel();
    _searchController.dispose();
    _customerIdController
      ..removeListener(_resetVerificationState)
      ..dispose();
    _amountController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _resetVerificationState() {
    if (!mounted) {
      return;
    }
    setState(() {
      _customerName = null;
      _nameConfirmed = false;
    });
  }

  List<_BookmakerOption> get _filteredBookmakers {
    final query = _searchController.text.trim().toLowerCase();
    if (query.isEmpty) {
      return _bookmakers;
    }

    return _bookmakers
        .where((option) => option.label.toLowerCase().contains(query))
        .toList(growable: false);
  }

  Future<void> _verifyAccount() async {
    if (_customerIdController.text.trim().isEmpty) {
      _showMessage('Enter the betting user ID before validation.');
      return;
    }

    setState(() => _verifying = true);
    try {
      final response = await BR9ApiClient.instance.verifyBettingAccount(
        bookmaker: _selectedBookmaker,
        customerId: _customerIdController.text.trim(),
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      final name = (data['customerName'] ?? '').toString().trim();

      if (!mounted) {
        return;
      }

      if (name.isEmpty) {
        _showMessage('This provider did not return an account name yet.');
        return;
      }

      setState(() {
        _customerName = name;
        _nameConfirmed = false;
      });
      _showMessage('Account name fetched. Confirm before payment.');
    } on BR9ApiException catch (error) {
      _showMessage(error.message);
    } finally {
      if (mounted) {
        setState(() => _verifying = false);
      }
    }
  }

  Future<void> _fundWallet() async {
    if (_customerName == null || !_nameConfirmed) {
      _showMessage('Confirm the returned account name before paying.');
      return;
    }

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
        bookmaker: _selectedBookmaker,
        customerId: _customerIdController.text.trim(),
        amount: amount,
        phone: _phoneController.text.trim(),
        transactionPin: transactionPin,
        customerName: _customerName,
      );

      final data = response['data'] as Map<String, dynamic>? ?? {};
      final status = (data['status'] ?? 'success').toString();

      if (status == 'pending') {
        final fundingId = (data['fundingId'] ?? '').toString();
        if (fundingId.isNotEmpty) {
          _startPendingPoll(fundingId, amount);
        }
        _showMessage(
          'Provider timed out. Wallet not debited. We are polling the funding status now.',
        );
        return;
      }

      await _handleFundingSuccess(data, amount);
    } on BR9ApiException catch (error) {
      _showMessage(error.message);
    } finally {
      if (mounted) {
        setState(() => _funding = false);
      }
    }
  }

  void _startPendingPoll(String fundingId, double amount) {
    _statusPollTimer?.cancel();
    setState(() => _pendingFundingId = fundingId);

    _statusPollTimer = Timer.periodic(const Duration(seconds: 15), (
      timer,
    ) async {
      try {
        final response = await BR9ApiClient.instance.checkBettingFundingStatus(
          fundingId: fundingId,
        );
        final data = response['data'] as Map<String, dynamic>? ?? {};
        final status = (data['status'] ?? 'pending').toString();

        if (status == 'pending') {
          return;
        }

        timer.cancel();
        if (!mounted) {
          return;
        }

        setState(() => _pendingFundingId = null);

        if (status == 'failed') {
          _showMessage(
            (response['message'] ??
                    'Funding failed and your wallet was not debited.')
                .toString(),
          );
          return;
        }

        await _handleFundingSuccess(data, amount);
      } on BR9ApiException catch (error) {
        timer.cancel();
        if (!mounted) {
          return;
        }
        setState(() => _pendingFundingId = null);
        _showMessage(error.message);
      }
    });
  }

  Future<void> _handleFundingSuccess(
    Map<String, dynamic> data,
    double amount,
  ) async {
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
          message:
              'Your $_selectedBookmaker wallet funding has been completed.',
          amount: amount,
        ),
      ),
    );
  }

  void _showMessage(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    final isDark = brightness == Brightness.dark;
    final surface = isDark ? const Color(0xFF121826) : Colors.white;
    final border = isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0);
    final pageBackground = isDark
        ? const Color(0xFF0A0A0A)
        : const Color(0xFFF8FAFC);
    final mutedText = isDark ? Colors.white70 : const Color(0xFF64748B);
    final primaryText = isDark ? Colors.white : const Color(0xFF0F172A);

    return Scaffold(
      backgroundColor: pageBackground,
      appBar: AppBar(
        title: const Text('Gaming Funding'),
        backgroundColor: pageBackground,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Choose provider',
                  style: TextStyle(
                    color: primaryText,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Search, pick a betting wallet, validate the account name, then pay.',
                  style: TextStyle(color: mutedText, height: 1.4),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _searchController,
                  onChanged: (_) => setState(() {}),
                  style: TextStyle(color: primaryText),
                  decoration: InputDecoration(
                    labelText: 'Search provider',
                    prefixIcon: const Icon(Icons.search_rounded),
                    filled: true,
                    fillColor: isDark
                        ? const Color(0xFF0F1720)
                        : const Color(0xFFF8FAFC),
                  ),
                ),
                const SizedBox(height: 16),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _filteredBookmakers.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.45,
                  ),
                  itemBuilder: (context, index) {
                    final option = _filteredBookmakers[index];
                    final isSelected = option.label == _selectedBookmaker;
                    return InkWell(
                      borderRadius: BorderRadius.circular(22),
                      onTap: () {
                        setState(() {
                          _selectedBookmaker = option.label;
                          _customerName = null;
                          _nameConfirmed = false;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.neonGold.withValues(alpha: 0.14)
                              : surface,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(
                            color: isSelected ? AppColors.neonGold : border,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              height: 42,
                              width: 42,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.neonGold
                                    : AppColors.deepNavy.withValues(
                                        alpha: 0.08,
                                      ),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                option.icon,
                                color: isSelected
                                    ? AppColors.deepNavy
                                    : AppColors.deepNavy,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              option.label,
                              style: TextStyle(
                                color: primaryText,
                                fontWeight: FontWeight.w800,
                                fontSize: 15,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Validate before funding',
                              style: TextStyle(color: mutedText, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: _customerIdController,
                  style: TextStyle(color: primaryText),
                  decoration: const InputDecoration(
                    labelText: 'User ID / Customer ID',
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _verifying ? null : _verifyAccount,
                  icon: const Icon(Icons.verified_user_rounded),
                  label: Text(_verifying ? 'Validating...' : 'Validate User'),
                ),
                if (_customerName != null) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF082B22)
                          : const Color(0xFFEAFBF3),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFF28C76F).withValues(alpha: 0.34),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Account name',
                          style: TextStyle(
                            color: mutedText,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _customerName!,
                          style: TextStyle(
                            color: primaryText,
                            fontWeight: FontWeight.w900,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 12),
                        CheckboxListTile(
                          value: _nameConfirmed,
                          onChanged: (value) {
                            setState(() => _nameConfirmed = value ?? false);
                          },
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            'I confirm this is the right account name',
                            style: TextStyle(
                              color: primaryText,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          controlAffinity: ListTileControlAffinity.leading,
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                TextField(
                  controller: _amountController,
                  keyboardType: TextInputType.number,
                  style: TextStyle(color: primaryText),
                  decoration: const InputDecoration(
                    labelText: 'Amount in Naira',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  style: TextStyle(color: primaryText),
                  decoration: const InputDecoration(labelText: 'Phone Number'),
                ),
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: (_funding || _pendingFundingId != null)
                      ? null
                      : _fundWallet,
                  icon: Icon(
                    _pendingFundingId != null
                        ? Icons.sync_rounded
                        : Icons.sports_esports_rounded,
                  ),
                  label: Text(
                    _pendingFundingId != null
                        ? 'Checking Pending Funding...'
                        : _funding
                        ? 'Funding...'
                        : 'Fund Wallet',
                  ),
                ),
                if (_pendingFundingId != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    'Provider timeout detected. BR9ja is polling the status before any wallet debit happens.',
                    style: TextStyle(
                      color: mutedText,
                      fontSize: 12,
                      height: 1.5,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BookmakerOption {
  const _BookmakerOption(this.label, this.icon);

  final String label;
  final IconData icon;
}
