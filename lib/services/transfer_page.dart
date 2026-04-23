import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api/br9_api_client.dart';
import '../models/transaction_model.dart';
import '../providers/user_provider.dart';
import '../widgets/br9ja_snackbar.dart';
import 'kyc_helper.dart';
import 'receipt_page.dart';
import 'security_overlay.dart';
import 'service_ui.dart';
import 'transaction_pin_prompt.dart';

class TransferPage extends StatefulWidget {
  const TransferPage({super.key});

  @override
  State<TransferPage> createState() => _TransferPageState();
}

class _TransferPageState extends State<TransferPage> {
  final TextEditingController _recipientController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _noteController = TextEditingController();

  static const Map<String, String> _bayrightUsers = {
    '08031234567': 'Chidinma Okeke',
    '08039876543': 'Emeka Udeh',
    '08123456789': 'Amaka Nwosu',
    '07012345678': 'Tobi Afolayan',
  };

  String? _foundUser;
  String? _recipientReference;
  bool _recipientInvalid = false;
  bool _isVerifying = false;
  bool _isSubmitting = false;
  int _lookupVersion = 0;

  @override
  void dispose() {
    _recipientController.dispose();
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Transfer to Buddy',
      subtitle:
          'Send money instantly to another BR9ja user with @username, email, or phone number.',
      heroIcon: Icons.swap_horiz_rounded,
      serviceHeroTag: 'service-transfer',
      totalAmount: _amountController.text.isEmpty
          ? '₦0.00'
          : '₦${_amountController.text}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0A223D),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Text(
              'Buddy transfers keep money inside BR9ja. Search by @username, email, or phone number, then confirm with your secure login method.',
              style: TextStyle(color: Colors.white70, height: 1.4),
            ),
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Buddy Username, Email, or Phone Number',
            hint: '@username, email, or 08012345678',
            icon: Icons.person_search_rounded,
            controller: _recipientController,
            keyboardType: TextInputType.text,
            invalid: _recipientInvalid,
            onChanged: _handleRecipientInput,
          ),
          if (_isVerifying) ...[
            const SizedBox(height: 8),
            Row(
              children: const [
                SizedBox(
                  height: 16,
                  width: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Color(0xFF00A86B),
                    ),
                  ),
                ),
                SizedBox(width: 10),
                Text(
                  'Verifying...',
                  style: TextStyle(
                    color: Color(0xFF00A86B),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ] else if (_foundUser != null) ...[
            const SizedBox(height: 8),
            Text(
              'Recipient: $_foundUser',
              style: const TextStyle(
                color: Color(0xFF00A86B),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          const SizedBox(height: 12),
          const ActionableSelectRow(
            label: 'Transfer Type',
            value: 'BR9ja Buddy Transfer',
            icon: Icons.account_balance_wallet_rounded,
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Amount in Naira (₦)',
            hint: '5000',
            icon: Icons.payments_outlined,
            controller: _amountController,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Add Narration',
            hint: 'Dinner split or game challenge',
            icon: Icons.notes_rounded,
            controller: _noteController,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(
            onPressed: _confirmTransfer,
            label: 'Send to Buddy',
            amount:
                double.tryParse(_amountController.text.replaceAll(',', '')) ??
                0,
          ),
        ],
      ),
    );
  }

  Future<void> _handleRecipientInput(String value) async {
    final normalized = value.trim();
    final digits = normalized.replaceAll(RegExp(r'\D'), '');
    final looksLikePhone =
        digits.length == 11 && RegExp(r'^\d+$').hasMatch(digits);
    final looksLikeEmail = normalized.contains('@') && normalized.contains('.');
    final looksLikeUsername = normalized.startsWith('@')
        ? normalized.length >= 4
        : RegExp(r'^[a-zA-Z0-9._-]{3,}$').hasMatch(normalized);
    final canLookup = looksLikePhone || looksLikeEmail || looksLikeUsername;

    setState(() {
      _foundUser = null;
      _recipientReference = null;
      _isVerifying = canLookup;
      if (_recipientInvalid) {
        _recipientInvalid = false;
      }
    });

    if (!canLookup) {
      return;
    }

    final version = ++_lookupVersion;
    await Future<void>.delayed(const Duration(milliseconds: 800));
    if (!mounted || version != _lookupVersion) {
      return;
    }

    try {
      final response = await BR9ApiClient.instance.post(
        '/api/auth/verify-user',
        data: {'identifier': normalized.isEmpty ? digits : normalized},
      );
      final data = (response['data'] as Map<String, dynamic>?) ?? response;
      if (!mounted || version != _lookupVersion) {
        return;
      }
      setState(() {
        _isVerifying = false;
        _foundUser =
            (data['fullName'] ?? _bayrightUsers[digits] ?? 'BR9ja User')
                .toString();
        _recipientReference =
            (data['bayrightTag'] ??
                    data['email'] ??
                    data['phoneNumber'] ??
                    normalized)
                .toString();
      });
    } on BR9ApiException {
      if (!mounted || version != _lookupVersion) {
        return;
      }
      setState(() {
        _isVerifying = false;
        _foundUser = null;
        _recipientReference = null;
      });
    }
  }

  Future<void> _confirmTransfer() async {
    if (_isSubmitting) {
      return;
    }

    final amountText = _amountController.text.trim();
    final recipientText = _recipientController.text.trim();

    final hasValidRecipient = _foundUser != null && recipientText.isNotEmpty;
    if (!hasValidRecipient || amountText.isEmpty) {
      setState(() => _recipientInvalid = !hasValidRecipient);
      return;
    }

    final parsedAmount = double.tryParse(amountText.replaceAll(',', '')) ?? 0;
    if (checkKycRequirement(parsedAmount)) {
      await showKycRequiredSheet(context);
      return;
    }

    final authenticated = await SecurityOverlay.authenticate(
      context: context,
      reason: 'Authenticate to confirm buddy transfer',
      fallbackTitle: 'Enter 6-digit PIN',
    );

    if (!authenticated || !mounted) {
      return;
    }

    final transactionPin = await requestTransactionPin(
      context: context,
      title: 'Confirm Buddy Transfer',
    );
    if (transactionPin == null || !mounted) {
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final response = await BR9ApiClient.instance.post(
        '/api/transactions/transfer',
        data: {
          'recipient': _recipientReference ?? recipientText,
          'amount': parsedAmount,
          'note': _noteController.text.trim(),
          'transactionPin': transactionPin,
        },
      );
      final transaction = TransactionRecord.fromJson(
        (response['data'] as Map<String, dynamic>?) ?? response,
      );

      if (!mounted) {
        return;
      }

      context.read<UserProvider>().applyTransaction(transaction);
      if (!mounted) {
        return;
      }

      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ReceiptPage(transaction: transaction),
        ),
      );
    } on BR9ApiException catch (error) {
      if (!mounted) {
        return;
      }
      Br9jaSnackBar.show(
        context,
        message: error.message,
        icon: Icons.error_outline_rounded,
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }
}
