import 'package:flutter/material.dart';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';

class PinEntryPage extends StatefulWidget {
  final String amount;
  final String recipient;

  const PinEntryPage({
    super.key,
    required this.amount,
    required this.recipient,
  });

  @override
  State<PinEntryPage> createState() => _PinEntryPageState();
}

class _PinEntryPageState extends State<PinEntryPage> {
  String pin = '';

  void _addDigit(String digit) {
    if (pin.length < 4) {
      setState(() => pin += digit);
    }

    if (pin.length == 4) {
      _verifyAndProcess();
    }
  }

  void _verifyAndProcess() {
    Navigator.pop(context, true);
  }

  void _removeDigit() {
    if (pin.isEmpty) {
      return;
    }

    setState(() => pin = pin.substring(0, pin.length - 1));
  }

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
        iconTheme: const IconThemeData(color: AppColors.neonGold),
        title: const Text('Secure PIN'),
      ),
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Confirm ₦${widget.amount}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                widget.recipient,
                style: const TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                4,
                (index) => Container(
                  margin: const EdgeInsets.all(10),
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.neonGold),
                    color: pin.length > index
                        ? AppColors.neonGold
                        : Colors.transparent,
                  ),
                ),
              ),
            ),
            const Spacer(),
            _buildKeypad(AppColors.neonGold),
          ],
        ),
      ),
    );
  }

  Widget _buildKeypad(Color color) {
    const keypadRows = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', '⌫'],
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          for (final row in keypadRows)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                for (final key in row)
                  TextButton(
                    onPressed: key.isEmpty
                        ? null
                        : () => key == '⌫' ? _removeDigit() : _addDigit(key),
                    child: SizedBox(
                      width: 48,
                      child: Text(
                        key,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: color,
                          fontSize: 28,
                          fontWeight: FontWeight.w300,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}
