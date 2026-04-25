import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import '../core/api/br9_api_client.dart';
import 'service_ui.dart';

class JambPage extends StatefulWidget {
  const JambPage({super.key});

  @override
  State<JambPage> createState() => _JambPageState();
}

class _JambPageState extends State<JambPage> {
  String _selectedEntry = 'UTME';
  String _selectedPlan = 'JAMB UTME';
  bool _loadingCatalog = true;
  String? _catalogError;
  List<Map<String, dynamic>> _catalogRows = const [];

  @override
  void initState() {
    super.initState();
    _loadCatalog();
  }

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Tertiary Entry',
      subtitle:
          'Get JAMB UTME and Direct Entry e-PINs with a cleaner payment flow.',
      heroIcon: Icons.menu_book_rounded,
      totalAmount: _resolvedAmountLabel,
      child: Column(
        children: [
          ActionableSelectRow(
            label: 'Select Entry',
            value: _selectedEntry,
            icon: Icons.school_rounded,
            onTap: () => _showOptions(
              'Select Entry Type',
              ['UTME', 'Direct Entry'],
              (value) {
                _selectedEntry = value;
                final plans = _plansForEntry(value);
                if (plans.isNotEmpty) {
                  _selectedPlan = plans.first;
                }
              },
            ),
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _selectedPlan,
            icon: Icons.tune_rounded,
            onTap: () => _showOptions(
              'Select Plan',
              _plansForEntry(_selectedEntry),
              (value) {
                _selectedPlan = value;
              },
            ),
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Details',
            hint: 'Profile Code / Registered Phone',
            icon: Icons.badge_rounded,
            helperText: _catalogHelperText,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(
            onPressed: () async {},
            label: _loadingCatalog ? 'Loading prices...' : 'Proceed',
            amount: _resolvedAmount,
          ),
        ],
      ),
    );
  }

  Future<void> _showOptions(
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
        serviceKey: 'education',
        search: 'jamb',
      );
      final rows = List<Map<String, dynamic>>.from(
        (response['data']?['rows'] as List? ?? const <dynamic>[]),
      );

      setState(() {
        _catalogRows = rows;
        if (rows.isNotEmpty) {
          _selectedPlan = _plansForEntry(_selectedEntry).first;
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

  List<String> _plansForEntry(String entry) {
    final pattern = entry == 'Direct Entry' ? 'DIRECT ENTRY' : 'UTME';
    final options = _catalogRows
        .where((row) {
          final serviceName =
              row['serviceName']?.toString() ?? row['label']?.toString() ?? '';
          return serviceName.toUpperCase().contains(pattern);
        })
        .map((row) => row['serviceName']?.toString() ?? row['label']?.toString() ?? '')
        .where((item) => item.isNotEmpty)
        .toList();
    return options.isEmpty
        ? <String>[entry == 'Direct Entry' ? 'JAMB Direct Entry' : 'JAMB UTME']
        : options;
  }

  Map<String, dynamic>? get _selectedPlanRow {
    for (final row in _catalogRows) {
      final serviceName =
          row['serviceName']?.toString() ?? row['label']?.toString() ?? '';
      if (serviceName == _selectedPlan) {
        return row;
      }
    }
    return null;
  }

  double get _resolvedAmount =>
      (_selectedPlanRow?['sellingPrice'] as num?)?.toDouble() ?? 0;

  String get _resolvedAmountLabel => '₦${_resolvedAmount.toStringAsFixed(2)}';

  String get _catalogHelperText {
    if (_loadingCatalog) {
      return 'Loading JAMB pricing from your admin catalog.';
    }
    if (_catalogError != null) {
      return 'Live catalog unavailable. Check the backend connection and refresh.';
    }
    final row = _selectedPlanRow;
    if (row == null) {
      return 'Select a JAMB product to see the current live selling price.';
    }
    final margin =
        (row['sellingPrice'] as num? ?? 0) - (row['costPrice'] as num? ?? 0);
    return '${row['serviceName']} is live at $_resolvedAmountLabel with ${margin.toStringAsFixed(0)} naira margin.';
  }
}
