import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import '../core/api/br9_api_client.dart';
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
  String _bundle = 'MTN SME 500MB';
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Mobile Data',
      subtitle:
          'Buy SME, corporate gifting, and gifting bundles across networks.',
      heroIcon: Icons.wifi_tethering_rounded,
      serviceHeroTag: 'service-data',
      totalAmount: _resolvedAmountLabel,
      child: Column(
        children: [
          ActionableSelectRow(
            label: 'Select Network',
            value: _network,
            icon: Icons.network_cell_rounded,
            onTap: () => _pick('Select Network', _networkOptions, (value) {
              _network = value;
              final nextBundles = _bundleOptionsForNetwork(value);
              if (nextBundles.isNotEmpty) {
                _bundle = nextBundles.first;
              }
            }),
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _planType,
            icon: Icons.tune_rounded,
            onTap: () => _pick('Select Plan Type', _planTypes, (value) => _planType = value),
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _bundle,
            icon: Icons.storage_rounded,
            onTap: () => _pick('Select Bundle', _bundleOptionsForNetwork(_network), (value) => _bundle = value),
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Details',
            hint: 'Recipient Phone Number',
            icon: Icons.phone_android_rounded,
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            invalid: _phoneInvalid,
            helperText: _catalogHelperText,
            onChanged: (_) {
              if (_phoneInvalid) {
                setState(() => _phoneInvalid = false);
              }
            },
          ),
          const SizedBox(height: 16),
          ServiceActionButton(
            onPressed: _continueToPin,
            label: _loadingCatalog ? 'Loading prices...' : 'Proceed',
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
        serviceKey: 'data',
      );
      final rows = List<Map<String, dynamic>>.from(
        (response['data']?['rows'] as List? ?? const <dynamic>[]),
      );

      setState(() {
        _catalogRows = rows;
        if (rows.isNotEmpty) {
          _network = _networkOptions.first;
          _bundle = _bundleOptionsForNetwork(_network).first;
          _planType = _planTypes.first;
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
    final row = _selectedBundleRow;
    return (row?['sellingPrice'] as num?)?.toDouble() ?? 0;
  }

  bool _isValidPhone(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');
    return digits.length >= 10 && digits.length <= 11;
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
    return options.isEmpty ? const ['MTN'] : options;
  }

  List<String> get _planTypes {
    final options = _catalogRows
        .map((row) => (row['metadata'] as Map?)?['planType']?.toString() ?? 'Data')
        .where((item) => item.isNotEmpty)
        .toSet()
        .toList();
    return options.isEmpty ? const ['SME'] : options;
  }

  List<String> _bundleOptionsForNetwork(String network) {
    final options = _catalogRows
        .where((row) {
          final rowNetwork =
              (row['metadata'] as Map?)?['network']?.toString() ??
              row['serviceId']?.toString() ??
              '';
          return rowNetwork.toUpperCase() == network.toUpperCase();
        })
        .map((row) => row['serviceName']?.toString() ?? row['label']?.toString() ?? '')
        .where((item) => item.isNotEmpty)
        .toList();

    return options.isEmpty ? const ['MTN SME 500MB'] : options;
  }

  Map<String, dynamic>? get _selectedBundleRow {
    for (final row in _catalogRows) {
      final serviceName =
          row['serviceName']?.toString() ?? row['label']?.toString() ?? '';
      if (serviceName == _bundle) {
        return row;
      }
    }
    return null;
  }

  String get _resolvedAmountLabel => '₦${_resolvedAmount.toStringAsFixed(2)}';

  String get _catalogHelperText {
    if (_loadingCatalog) {
      return 'Loading live data bundle pricing from your admin catalog.';
    }
    if (_catalogError != null) {
      return 'Live catalog unavailable. Check the backend connection and refresh.';
    }
    final row = _selectedBundleRow;
    if (row == null) {
      return 'Choose a bundle to see the current live selling price.';
    }
    final margin =
        (row['sellingPrice'] as num? ?? 0) - (row['costPrice'] as num? ?? 0);
    return 'This bundle carries $_resolvedAmountLabel live pricing with ${margin.toStringAsFixed(0)} naira margin.';
  }
}
