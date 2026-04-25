import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import '../core/api/br9_api_client.dart';
import 'service_ui.dart';

class ExamsPage extends StatefulWidget {
  const ExamsPage({super.key});

  @override
  State<ExamsPage> createState() => _ExamsPageState();
}

class _ExamsPageState extends State<ExamsPage> {
  String _selectedBody = 'WAEC';
  String _selectedPlan = 'WAEC Result Checker';
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
      title: 'Exam PINs',
      subtitle:
          'Purchase WAEC, NECO, and NABTEB registration or result checker PINs.',
      heroIcon: Icons.school_rounded,
      totalAmount: _resolvedAmountLabel,
      child: Column(
        children: [
          ActionableSelectRow(
            label: 'Select Body',
            value: _selectedBody,
            icon: Icons.menu_book_rounded,
            onTap: () => _showOptions(
              'Select Exam Body',
              _bodies,
              (value) {
                _selectedBody = value;
                final plans = _plansForBody(value);
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
              _plansForBody(_selectedBody),
              (value) {
                _selectedPlan = value;
              },
            ),
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Details',
            hint: 'Phone Number',
            icon: Icons.phone_android_rounded,
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
      );
      final rows = List<Map<String, dynamic>>.from(
        (response['data']?['rows'] as List? ?? const <dynamic>[]),
      );
      setState(() {
        _catalogRows = rows;
        if (rows.isNotEmpty) {
          _selectedBody = _bodies.first;
          _selectedPlan = _plansForBody(_selectedBody).first;
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

  List<String> get _bodies {
    final options = _catalogRows
        .map((row) {
          final serviceName =
              row['serviceName']?.toString() ?? row['label']?.toString() ?? '';
          if (serviceName.toUpperCase().contains('WAEC')) {
            return 'WAEC';
          }
          if (serviceName.toUpperCase().contains('NECO')) {
            return 'NECO';
          }
          if (serviceName.toUpperCase().contains('NABTEB')) {
            return 'NABTEB';
          }
          return '';
        })
        .where((item) => item.isNotEmpty)
        .toSet()
        .toList();

    return options.isEmpty ? const ['WAEC', 'NECO', 'NABTEB'] : options;
  }

  List<String> _plansForBody(String body) {
    final options = _catalogRows
        .where((row) {
          final serviceName =
              row['serviceName']?.toString() ?? row['label']?.toString() ?? '';
          return serviceName.toUpperCase().contains(body.toUpperCase());
        })
        .map((row) => row['serviceName']?.toString() ?? row['label']?.toString() ?? '')
        .where((item) => item.isNotEmpty)
        .toList();

    return options.isEmpty ? const ['WAEC Result Checker'] : options;
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
      return 'Loading live exam pricing from your admin catalog.';
    }
    if (_catalogError != null) {
      return 'Live catalog unavailable. Check the backend connection and refresh.';
    }
    final row = _selectedPlanRow;
    if (row == null) {
      return 'Select an exam product to see the live selling price.';
    }
    final margin =
        (row['sellingPrice'] as num? ?? 0) - (row['costPrice'] as num? ?? 0);
    return '${row['serviceName']} is live at $_resolvedAmountLabel with ${margin.toStringAsFixed(0)} naira margin.';
  }
}
