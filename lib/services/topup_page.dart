import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../widgets/br9ja_snackbar.dart';
import 'service_ui.dart';

class TopupPage extends StatelessWidget {
  const TopupPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Fund Wallet',
      subtitle:
          'Add money into your Bayright9ja wallet from your preferred source.',
      heroIcon: Icons.account_balance_wallet_rounded,
      totalAmount: '₦0.00',
      child: Column(
        children: [
          const _DepositAccountCard(),
          const SizedBox(height: 16),
          ServiceActionButton(
            onPressed: _noop,
            label: 'I Have Made The Transfer',
          ),
        ],
      ),
    );
  }

  static Future<void> _noop() async {}
}

class _DepositAccountCard extends StatelessWidget {
  const _DepositAccountCard();

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    final accountNumber = userProvider.depositAccountNumber.isNotEmpty
        ? userProvider.depositAccountNumber
        : userProvider.accountNumber;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF06172A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.neonGold.withValues(alpha: 0.45)),
        boxShadow: [
          BoxShadow(
            color: AppColors.neonGold.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                height: 46,
                width: 46,
                decoration: BoxDecoration(
                  color: AppColors.neonGold.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Icon(
                  Icons.account_balance_rounded,
                  color: AppColors.neonGold,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Dedicated Deposit Account',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Transfer here and your BR9ja wallet credits automatically.',
                      style: TextStyle(color: Colors.white70, height: 1.35),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _DepositDetailRow(
            label: 'Account Number',
            value: accountNumber,
            canCopy: true,
          ),
          _DepositDetailRow(
            label: 'Bank Name',
            value: userProvider.depositBankName,
          ),
          _DepositDetailRow(
            label: 'Account Name',
            value: userProvider.depositAccountName,
          ),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white12),
            ),
            child: Text(
              'Provider: ${userProvider.depositProvider.toUpperCase()} • Status: ${userProvider.depositAccountStatus.toUpperCase()}',
              style: const TextStyle(
                color: Colors.white70,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DepositDetailRow extends StatelessWidget {
  const _DepositDetailRow({
    required this.label,
    required this.value,
    this.canCopy = false,
  });

  final String label;
  final String value;
  final bool canCopy;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white60,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value.isEmpty ? 'Pending assignment' : value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 19,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.4,
                  ),
                ),
              ],
            ),
          ),
          if (canCopy)
            IconButton.filledTonal(
              onPressed: value.isEmpty
                  ? null
                  : () async {
                      await Clipboard.setData(ClipboardData(text: value));
                      if (context.mounted) {
                        Br9jaSnackBar.show(
                          context,
                          message: 'Deposit account copied.',
                        );
                      }
                    },
              icon: const Icon(Icons.copy_rounded),
              color: AppColors.neonGold,
            ),
        ],
      ),
    );
  }
}
