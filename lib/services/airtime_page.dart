import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api/br9_api_client.dart';
import '../models/transaction_model.dart';
import '../providers/user_provider.dart';
import 'kyc_helper.dart';
import 'receipt_page.dart';
import 'security_overlay.dart';
import 'service_ui.dart';

class AirtimePage extends StatefulWidget {
  const AirtimePage({super.key});

  @override
  State<AirtimePage> createState() => _AirtimePageState();
}

class _AirtimePageState extends State<AirtimePage> {
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  String _network = 'MTN';
  String _plan = 'VTU Airtime';
  bool _phoneInvalid = false;
  bool _loadingCatalog = true;
  String? _catalogError;
  List<Map<String, dynamic>> _catalogRows = const [];

  @override
  void initState() {
    super.initState();
    _loadCatalog();
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Mobile Airtime',
      subtitle: 'Buy VTU or Share n Sell airtime with a richer Bayright flow.',
      heroIcon: Icons.phone_iphone_rounded,
      serviceHeroTag: 'service-airtime',
      totalAmount: formatCurrencyValue(_resolvedAmount),
      child: Column(
        children: [
          ActionableSelectRow(
            label: 'Select Network',
            value: _network,
            icon: Icons.network_cell_rounded,
            onTap: () => _pick('Select Network', _networkOptions, (value) => _network = value),
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _plan,
            icon: Icons.tune_rounded,
            onTap: () => _pick('Select Plan', const [
              'VTU Airtime',
              'Share n Sell',
            ], (value) => _plan = value),
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Details',
            hint: 'Phone Number',
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
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Details',
            hint: 'Amount (₦)',
            icon: Icons.payments_outlined,
            controller: _amountController,
            keyboardType: TextInputType.number,
            helperText: _catalogHelperText,
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 16),
          ServiceActionButton(
            onPressed: _confirmAirtimePurchase,
            label: _loadingCatalog ? 'Loading prices...' : 'Confirm Airtime',
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

  Future<void> _loadCatalog() async {
    setState(() {
      _loadingCatalog = true;
      _catalogError = null;
    });

    try {
      final response = await BR9ApiClient.instance.fetchServiceCatalog(
        serviceKey: 'airtime',
      );
      final rows = List<Map<String, dynamic>>.from(
        (response['data']?['rows'] as List? ?? const <dynamic>[]),
      );

      setState(() {
        _catalogRows = rows;
        if (rows.isNotEmpty) {
          _network = _networkOptions.first;
        }
        _loadingCatalog = false;
      });
    } catch (error) {
      setState(() {
        _catalogError = error.toString();
        _loadingCatalog = false;
      });
    }
  }

  Future<void> _confirmAirtimePurchase() async {
    final phone = _phoneController.text.trim();
    final amount = _amountController.text.trim();
    final invalidPhone = !_isValidPhone(phone);
    if (invalidPhone || amount.isEmpty) {
      setState(() => _phoneInvalid = invalidPhone);
      return;
    }
    final parsedAmount = double.tryParse(amount.replaceAll(',', '')) ?? 0;
    if (checkKycRequirement(_resolvedAmount)) {
      await showKycRequiredSheet(context);
      return;
    }

    final authenticated = await SecurityOverlay.authenticate(
      context: context,
      reason: 'Authenticate to buy airtime',
      fallbackTitle: 'Enter 6-digit PIN',
    );

    if (!authenticated || !mounted) {
      return;
    }

    final userProvider = context.read<UserProvider>();
    final transaction = TransactionRecord.draft(
      service: '$_network Airtime',
      amount: parsedAmount,
      createdAt: DateTime.now(),
      balanceAfter: userProvider.walletBalance - parsedAmount,
      note: _phoneController.text.trim(),
    );
    userProvider.applyTransaction(transaction);

    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ReceiptPage(transaction: transaction)),
    );
  }

  List<String> get _networkOptions {
    final options = _catalogRows
        .map(
          (row) =>
              (row['metadata'] as Map?)?['network']?.toString() ??
              row['serviceId']?.toString() ??
              '',
        )
        .where((item) => item.isNotEmpty)
        .toSet()
        .toList();

    return options.isEmpty ? const ['MTN', 'Airtel', 'Glo', '9mobile'] : options;
  }

  Map<String, dynamic>? get _selectedCatalogRow {
    for (final row in _catalogRows) {
      final network =
          (row['metadata'] as Map?)?['network']?.toString() ??
          row['serviceId']?.toString() ??
          '';
      if (network.toUpperCase() == _network.toUpperCase()) {
        return row;
      }
    }
    return null;
  }

  double get _resolvedAmount {
    final enteredAmount =
        double.tryParse(_amountController.text.replaceAll(',', '')) ?? 0;
    final row = _selectedCatalogRow;
    final margin =
        row == null
            ? 0
            : (row['sellingPrice'] as num? ?? 0) - (row['costPrice'] as num? ?? 0);
    if (enteredAmount <= 0) {
      return 0;
    }
    return enteredAmount + margin.toDouble();
  }

  String get _catalogHelperText {
    if (_loadingCatalog) {
      return 'Loading live airtime pricing from your control center.';
    }
    if (_catalogError != null) {
      return 'Live catalog unavailable. Check the backend connection and refresh.';
    }
    final row = _selectedCatalogRow;
    if (row == null) {
      return 'Enter an amount to preview the live selling price.';
    }
    final margin =
        (row['sellingPrice'] as num? ?? 0) - (row['costPrice'] as num? ?? 0);
    return 'Current live margin on $_network is ${formatCurrencyValue(margin.toDouble())}.';
  }

  bool _isValidPhone(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    return digits.length >= 10 && digits.length <= 11;
  }

  String formatCurrencyValue(double amount) {
    return '₦${amount.toStringAsFixed(2)}';
  }
}
