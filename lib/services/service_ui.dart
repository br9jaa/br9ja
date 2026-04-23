import 'dart:async';
import 'dart:ui';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../logic/haptics_service.dart';
import '../providers/user_provider.dart';
import '../utils/validators.dart';
import '../widgets/br9ja_snackbar.dart';

const kWalletHeroTag = 'wallet-card-hero';

class ServiceScaffold extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData heroIcon;
  final Widget child;
  final String totalAmount;
  final String? serviceHeroTag;

  const ServiceScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.heroIcon,
    required this.child,
    this.totalAmount = '₦0.00',
    this.serviceHeroTag,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppColors.deepNavy,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          color: AppColors.neonGold,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
        title: Text(title),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const PaymentSourceCard(),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF06172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.glassEffect),
              ),
              child: Row(
                children: [
                  Hero(
                    tag: serviceHeroTag ?? 'service-$title',
                    child: Material(
                      color: Colors.transparent,
                      child: Container(
                        height: 52,
                        width: 52,
                        decoration: BoxDecoration(
                          color: AppColors.glassEffect,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(heroIcon, color: AppColors.neonGold),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          subtitle,
                          style: const TextStyle(
                            color: Colors.white70,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            child,
            const SizedBox(height: 16),
            TransactionSummaryCard(totalAmount: totalAmount),
          ],
        ),
      ),
    );
  }
}

class PaymentSourceCard extends StatelessWidget {
  const PaymentSourceCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Hero(
      tag: kWalletHeroTag,
      child: Consumer<UserProvider>(
        builder: (context, userProvider, _) {
          return Material(
            color: Colors.transparent,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.glassEffect,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        height: 44,
                        width: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFF06172A),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Semantics(
                          label: 'BR9 Gold wallet source icon',
                          child: Icon(
                            Icons.account_balance_wallet_rounded,
                            color: AppColors.neonGold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Payment Source',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              userProvider.userName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              userProvider.accountNumber,
                              style: const TextStyle(color: Colors.white70),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '₦${userProvider.walletBalance.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: AppColors.neonGold,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class ActionableSelectRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final VoidCallback? onTap;

  const ActionableSelectRow({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0A223D),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.neonGold),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.keyboard_arrow_down_rounded,
              color: Colors.white70,
            ),
          ],
        ),
      ),
    );
  }
}

class ActionableInputRow extends StatelessWidget {
  final String label;
  final String hint;
  final IconData icon;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final bool invalid;
  final ValueChanged<String>? onChanged;
  final FocusNode? focusNode;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;
  final String? helperText;
  final bool? valid;

  const ActionableInputRow({
    super.key,
    required this.label,
    required this.hint,
    required this.icon,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.invalid = false,
    this.onChanged,
    this.focusNode,
    this.textInputAction,
    this.onSubmitted,
    this.helperText,
    this.valid,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveLabel = _resolveLabel(label, hint);
    final effectiveHint = _resolveHint(hint);
    final effectiveHelperText =
        helperText ?? _resolveHelperText(effectiveLabel);
    final suffixIcon = invalid
        ? const Icon(Icons.error_outline_rounded, color: Color(0xFFFF8080))
        : valid == true
        ? const Icon(Icons.check_circle_rounded, color: AppColors.success)
        : null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(AppColors.radius),
        border: Border.all(
          color: invalid ? const Color(0xFFFF4D4D) : Colors.transparent,
        ),
        boxShadow: invalid
            ? const [
                BoxShadow(
                  color: Color(0x55FF4D4D),
                  blurRadius: 18,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Row(
        children: [
          Semantics(
            label: '$effectiveLabel gold action icon',
            child: Icon(icon, color: AppColors.neonGold),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: controller == null
                ? _buildTextField(
                    effectiveLabel: effectiveLabel,
                    effectiveHint: effectiveHint,
                    effectiveHelperText: effectiveHelperText,
                    suffixIcon: suffixIcon,
                  )
                : ValueListenableBuilder<TextEditingValue>(
                    valueListenable: controller!,
                    builder: (context, value, _) {
                      final hasValue = value.text.trim().isNotEmpty;
                      final showSuccess = valid ?? (hasValue && !invalid);

                      return _buildTextField(
                        effectiveLabel: effectiveLabel,
                        effectiveHint: effectiveHint,
                        effectiveHelperText: effectiveHelperText,
                        suffixIcon: invalid
                            ? suffixIcon
                            : showSuccess
                            ? const Icon(
                                Icons.check_circle_rounded,
                                color: AppColors.success,
                              )
                            : null,
                      );
                    },
                  ),
          ),
          Container(
            height: 34,
            width: 34,
            decoration: BoxDecoration(
              color: AppColors.neonGold,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.deepNavy,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String effectiveLabel,
    required String effectiveHint,
    required String? effectiveHelperText,
    required Widget? suffixIcon,
  }) {
    return TextField(
      controller: controller,
      onChanged: onChanged,
      focusNode: focusNode,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      onSubmitted: onSubmitted,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: effectiveLabel,
        hintText: effectiveHint,
        helperText: effectiveHelperText,
        labelStyle: const TextStyle(color: Colors.white70),
        hintStyle: const TextStyle(color: Colors.white38),
        border: InputBorder.none,
        suffixIcon: suffixIcon,
      ),
    );
  }

  static String _resolveLabel(String label, String hint) {
    if (label != 'Enter Details') {
      return label;
    }

    final lowerHint = hint.toLowerCase();
    if (lowerHint.contains('bayright tag') || lowerHint.contains('tag')) {
      return 'Enter Username or Bayright Tag';
    }
    if (lowerHint.contains('account number')) {
      return 'Enter Account Number';
    }
    if (lowerHint.contains('phone')) {
      return 'Enter Phone Number';
    }
    if (lowerHint.contains('amount')) {
      return 'Enter Amount in Naira (₦)';
    }
    if (lowerHint.contains('meter')) {
      return 'Enter Meter Number';
    }
    if (lowerHint.contains('smartcard') || lowerHint.contains('decoder')) {
      return 'Enter Decoder Number';
    }
    return 'Enter ${hint.replaceAll('(₦)', '').trim()}';
  }

  static String _resolveHint(String hint) {
    final lowerHint = hint.toLowerCase();
    if (lowerHint.contains('bayright tag') || lowerHint.contains('tag')) {
      return 'br9kings or +234 801 234 5678';
    }
    if (lowerHint.contains('phone')) {
      return '+234 801 234 5678';
    }
    if (lowerHint.contains('amount')) {
      return '₦5,000';
    }
    if (lowerHint.contains('meter')) {
      return '01234567890';
    }
    if (lowerHint.contains('smartcard') || lowerHint.contains('decoder')) {
      return 'Smartcard / IUC Number';
    }
    return hint;
  }

  static String? _resolveHelperText(String label) {
    if (label.contains('Bayright Tag')) {
      return 'Use a BR9 username, Bayright tag, or phone number to find the recipient.';
    }
    if (label.contains('Phone Number')) {
      return 'We use this number to confirm and fulfil your payment instantly.';
    }
    if (label.contains('Amount in Naira')) {
      return 'Type the exact amount you want BR9ja to process in naira.';
    }
    if (label.contains('Meter Number')) {
      return 'We verify the meter owner in real time before payment.';
    }
    if (label.contains('Decoder Number')) {
      return 'We fetch the active bouquet before you renew the subscription.';
    }
    return null;
  }
}

class ServiceActionButton extends StatelessWidget {
  final String label;
  final FutureOr<void> Function() onPressed;
  final double amount;

  const ServiceActionButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.amount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: () async {
          final userProvider = context.read<UserProvider>();
          await HapticsService.softTick();
          if (!context.mounted) {
            return;
          }
          if (userProvider.transactionsFrozen) {
            Br9jaSnackBar.show(
              context,
              message: 'Transactions are frozen in Security Center',
              icon: Icons.lock_rounded,
            );
            return;
          }
          if (amount > userProvider.dailySpendingCap) {
            Br9jaSnackBar.show(
              context,
              message: 'Amount exceeds your daily spending cap',
              icon: Icons.shield_moon_rounded,
            );
            return;
          }
          final kycTier = userProvider.kycTier;
          if (!isTransactionAllowed(amount, kycTier)) {
            await HapticsService.longBuzz();
            if (!context.mounted) {
              return;
            }
            await showTier2UpgradeSheet(context);
            return;
          }
          await onPressed();
        },
        child: Text(label),
      ),
    );
  }
}

class TransactionSummaryCard extends StatelessWidget {
  final String totalAmount;

  const TransactionSummaryCard({super.key, required this.totalAmount});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          _row('Service Fee', '₦0.00'),
          const SizedBox(height: 12),
          _row('Total Amount', totalAmount, emphasized: true),
        ],
      ),
    );
  }

  Widget _row(String label, String value, {bool emphasized = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70)),
        Text(
          value,
          style: TextStyle(
            color: emphasized ? AppColors.neonGold : Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}
