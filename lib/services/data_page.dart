import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import 'security_overlay.dart';
import 'service_ui.dart';

class DataPage extends StatefulWidget {
  const DataPage({super.key});

  @override
  State<DataPage> createState() => _DataPageState();
}

class _DataPageState extends State<DataPage> {
  final TextEditingController _phoneController = TextEditingController();
  String _network = 'MTN';
  String _planType = 'SME';
  String _bundle = '1.5GB - ₦1,200';
  bool _phoneInvalid = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final amount = _bundle.split(' - ').last;

    return ServiceScaffold(
      title: 'Mobile Data',
      subtitle:
          'Buy SME, corporate gifting, and gifting bundles across networks.',
      heroIcon: Icons.wifi_tethering_rounded,
      serviceHeroTag: 'service-data',
      totalAmount: amount,
      child: Column(
        children: [
          ActionableSelectRow(
            label: 'Select Network',
            value: _network,
            icon: Icons.network_cell_rounded,
            onTap: () => _pick('Select Network', [
              'MTN',
              'Airtel',
              'Glo',
              '9mobile',
            ], (value) => _network = value),
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _planType,
            icon: Icons.tune_rounded,
            onTap: () => _pick('Select Plan Type', [
              'SME',
              'Corporate Gifting',
              'Gifting',
            ], (value) => _planType = value),
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _bundle,
            icon: Icons.storage_rounded,
            onTap: () => _pick('Select Bundle', [
              '500MB - ₦500',
              '1.5GB - ₦1,200',
              '5GB - ₦3,500',
              '10GB - ₦6,500',
            ], (value) => _bundle = value),
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Details',
            hint: 'Recipient Phone Number',
            icon: Icons.phone_android_rounded,
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            invalid: _phoneInvalid,
            onChanged: (_) {
              if (_phoneInvalid) {
                setState(() => _phoneInvalid = false);
              }
            },
          ),
          const SizedBox(height: 16),
          ServiceActionButton(
            onPressed: _continueToPin,
            label: 'Proceed',
            amount: _resolvedAmount,
          ),
        ],
      ),
    );
  }

  Future<void> _pick(
    String title,
    List<String> items,
    ValueChanged<String> setter,
  ) async {
    final picked = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.deepNavy,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => ListView(
        shrinkWrap: true,
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          ...items.map(
            (item) => ListTile(
              tileColor: const Color(0xFF0A223D),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              title: Text(item, style: const TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(context, item),
            ),
          ),
        ],
      ),
    );
    if (picked != null) setState(() => setter(picked));
  }

  Future<void> _continueToPin() async {
    final phone = _phoneController.text.trim();
    final invalidPhone = !_isValidPhone(phone);
    if (invalidPhone) {
      setState(() => _phoneInvalid = true);
      return;
    }
    await SecurityOverlay.authenticate(
      context: context,
      reason: 'Authenticate to buy data',
    );
  }

  double get _resolvedAmount {
    final normalized = _bundle
        .split(' - ')
        .last
        .replaceAll('₦', '')
        .replaceAll(',', '');
    return double.tryParse(normalized) ?? 0;
  }

  bool _isValidPhone(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    return digits.length >= 10 && digits.length <= 11;
  }
}
