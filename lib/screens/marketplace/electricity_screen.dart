import 'dart:async';

import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';
import '../../services/security_gateway.dart';
import '../../services/transaction_pin_prompt.dart';
import 'token_display_page.dart';

class ElectricityScreen extends StatefulWidget {
  const ElectricityScreen({super.key});

  @override
  State<ElectricityScreen> createState() => _ElectricityScreenState();
}

class _ElectricityScreenState extends State<ElectricityScreen> {
  static const List<_Disco> _discos = [
    _Disco('Ikeja Electric', 'ikeja-electric'),
    _Disco('Eko Electric', 'eko-electric'),
    _Disco('Abuja Electric', 'abuja-electric'),
    _Disco('Kano Electric', 'kano-electric'),
    _Disco('Port Harcourt Electric', 'portharcourt-electric'),
    _Disco('Ibadan Electric', 'ibadan-electric'),
  ];

  final TextEditingController _meterController = TextEditingController();
  final TextEditingController _amountController = TextEditingController(
    text: '1000',
  );
  final TextEditingController _phoneController = TextEditingController();

  _Disco _selectedDisco = _discos.first;
  String _meterType = 'prepaid';
  String? _customerName;
  bool _verifying = false;
  bool _purchasing = false;
  Timer? _verifyDebounce;

  @override
  void dispose() {
    _verifyDebounce?.cancel();
    _meterController.dispose();
    _amountController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _scheduleVerify(String value) {
    _verifyDebounce?.cancel();
    setState(() => _customerName = null);
    if (value.trim().length < 10) {
      return;
    }
    _verifyDebounce = Timer(const Duration(milliseconds: 650), _verifyMeter);
  }

  Future<void> _verifyMeter() async {
    setState(() => _verifying = true);
    try {
      final response = await BR9ApiClient.instance.verifyMeter(
        meterNumber: _meterController.text.trim(),
        serviceID: _selectedDisco.serviceId,
        type: _meterType,
      );
      final data = response['data'];
      if (!mounted) {
        return;
      }
      setState(() {
        _customerName = data is Map<String, dynamic>
            ? (data['customerName'] ?? '').toString()
            : '';
      });
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

  Future<void> _purchase() async {
    final authenticated = await SecurityGateway.authenticate(
      context: context,
      reason: 'Confirm electricity purchase',
    );
    if (!authenticated || !mounted) {
      return;
    }

    final transactionPin = await requestTransactionPin(
      context: context,
      title: 'Confirm Electricity Purchase',
    );
    if (transactionPin == null || !mounted) {
      return;
    }

    setState(() => _purchasing = true);
    try {
      final response = await BR9ApiClient.instance.payElectricity(
        meterNumber: _meterController.text.trim(),
        serviceID: _selectedDisco.serviceId,
        type: _meterType,
        amount: double.tryParse(_amountController.text.trim()) ?? 0,
        phone: _phoneController.text.trim(),
        transactionPin: transactionPin,
        customerName: _customerName,
      );
      final data = response['data'];
      if (data is! Map<String, dynamic>) {
        throw const BR9ApiException(
          message: 'Invalid electricity purchase response.',
        );
      }

      final points = data['br9GoldPoints'];
      if (points is num && mounted) {
        context.read<UserProvider>().setGoldPoints(points.toInt());
      }

      if (!mounted) {
        return;
      }
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => TokenDisplayPage(
            token: (data['token'] ?? '').toString(),
            receiptNumber: (data['receiptNumber'] ?? '').toString(),
            meterNumber: _meterController.text.trim(),
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
        setState(() => _purchasing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Electricity'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          DropdownButtonFormField<_Disco>(
            initialValue: _selectedDisco,
            dropdownColor: const Color(0xFF0A223D),
            decoration: const InputDecoration(
              labelText: 'Select Electricity Provider',
            ),
            items: _discos
                .map(
                  (disco) =>
                      DropdownMenuItem(value: disco, child: Text(disco.name)),
                )
                .toList(),
            onChanged: (value) {
              if (value != null) {
                setState(() => _selectedDisco = value);
                _scheduleVerify(_meterController.text);
              }
            },
          ),
          const SizedBox(height: 12),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'prepaid', label: Text('Prepaid')),
              ButtonSegment(value: 'postpaid', label: Text('Postpaid')),
            ],
            selected: {_meterType},
            onSelectionChanged: (value) {
              setState(() => _meterType = value.first);
              _scheduleVerify(_meterController.text);
            },
          ),
          const SizedBox(height: 12),
          _ValidatedTextField(
            controller: _meterController,
            label: 'Enter Meter Number',
            hint: '01234567890',
            helperText: 'We use this to auto-verify the meter owner.',
            keyboardType: TextInputType.number,
            onChanged: _scheduleVerify,
            validator: (value) => value.trim().length >= 10,
          ),
          const SizedBox(height: 12),
          if (_verifying)
            const LinearProgressIndicator(color: AppColors.neonGold)
          else if (_customerName != null && _customerName!.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E8E5A),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                'Meter owner: $_customerName',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          const SizedBox(height: 12),
          _ValidatedTextField(
            controller: _amountController,
            label: 'Enter Amount in Naira (₦)',
            hint: '₦5,000',
            helperText: 'Enter the exact token value you want to buy.',
            keyboardType: TextInputType.number,
            validator: (value) => double.tryParse(value.trim()) != null,
          ),
          const SizedBox(height: 12),
          _ValidatedTextField(
            controller: _phoneController,
            label: 'Enter Phone Number',
            hint: '+234 801 234 5678',
            helperText:
                'We use this to deliver your electricity purchase receipt.',
            keyboardType: TextInputType.phone,
            validator: (value) =>
                value.replaceAll(RegExp(r'\D'), '').length >= 10,
          ),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: _purchasing ? null : _purchase,
            icon: const Icon(Icons.bolt_rounded),
            label: Text(_purchasing ? 'Purchasing...' : 'Purchase'),
          ),
        ],
      ),
    );
  }
}

class _Disco {
  const _Disco(this.name, this.serviceId);

  final String name;
  final String serviceId;
}

class _ValidatedTextField extends StatelessWidget {
  const _ValidatedTextField({
    required this.controller,
    required this.label,
    required this.hint,
    required this.helperText,
    required this.keyboardType,
    required this.validator,
    this.onChanged,
  });

  final TextEditingController controller;
  final String label;
  final String hint;
  final String helperText;
  final TextInputType keyboardType;
  final bool Function(String) validator;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<TextEditingValue>(
      valueListenable: controller,
      builder: (context, value, _) {
        final valid = validator(value.text);

        return TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: const TextStyle(color: Colors.white),
          onChanged: onChanged,
          decoration: InputDecoration(
            labelText: label,
            hintText: hint,
            helperText: helperText,
            suffixIcon: valid
                ? const Icon(
                    Icons.check_circle_rounded,
                    color: AppColors.success,
                  )
                : null,
          ),
        );
      },
    );
  }
}
