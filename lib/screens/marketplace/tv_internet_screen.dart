import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';
import '../../services/security_gateway.dart';
import '../../services/transaction_pin_prompt.dart';
import 'success_sub_page.dart';

class TvInternetScreen extends StatefulWidget {
  const TvInternetScreen({super.key});

  @override
  State<TvInternetScreen> createState() => _TvInternetScreenState();
}

class _TvInternetScreenState extends State<TvInternetScreen> {
  static const List<_ProviderOption> _tvProviders = [
    _ProviderOption('DSTV', 'dstv'),
    _ProviderOption('GOTV', 'gotv'),
    _ProviderOption('StarTimes', 'startimes'),
    _ProviderOption('Showmax', 'showmax'),
  ];

  static const List<_ProviderOption> _internetProviders = [
    _ProviderOption('Smile', 'smile-direct'),
    _ProviderOption('Spectranet', 'spectranet'),
  ];

  final TextEditingController _billersCodeController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  String _category = 'TV';
  _ProviderOption _selectedProvider = _tvProviders.first;
  List<Map<String, dynamic>> _plans = <Map<String, dynamic>>[];
  Map<String, dynamic>? _selectedPlan;
  String? _customerName;
  String? _currentPlan;
  bool _verifying = false;
  bool _purchasing = false;

  @override
  void dispose() {
    _billersCodeController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  List<_ProviderOption> get _providers =>
      _category == 'TV' ? _tvProviders : _internetProviders;

  void _switchCategory(String category) {
    setState(() {
      _category = category;
      _selectedProvider = _providers.first;
      _plans = <Map<String, dynamic>>[];
      _selectedPlan = null;
      _customerName = null;
      _currentPlan = null;
    });
  }

  Future<void> _verify() async {
    setState(() => _verifying = true);
    try {
      final response = await BR9ApiClient.instance.verifySmartCard(
        billersCode: _billersCodeController.text.trim(),
        serviceID: _selectedProvider.serviceId,
      );
      final data = response['data'];
      if (!mounted) {
        return;
      }
      setState(() {
        if (data is Map<String, dynamic>) {
          _customerName = (data['customerName'] ?? '').toString();
          _currentPlan = (data['currentBouquet'] ?? '').toString();
          final plans = data['plans'];
          _plans = plans is List
              ? plans.whereType<Map<String, dynamic>>().toList(growable: false)
              : <Map<String, dynamic>>[];
          _selectedPlan = _plans.isNotEmpty ? _plans.first : null;
        }
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
    final plan = _selectedPlan;
    if (plan == null) {
      return;
    }

    final authenticated = await SecurityGateway.authenticate(
      context: context,
      reason: 'Confirm subscription renewal',
    );
    if (!authenticated || !mounted) {
      return;
    }

    final transactionPin = await requestTransactionPin(
      context: context,
      title: 'Confirm Subscription Payment',
    );
    if (transactionPin == null || !mounted) {
      return;
    }

    setState(() => _purchasing = true);
    try {
      final response = await BR9ApiClient.instance.payTvInternet(
        category: _category,
        billersCode: _billersCodeController.text.trim(),
        serviceID: _selectedProvider.serviceId,
        variationCode: (plan['variationCode'] ?? '').toString(),
        amount: (plan['amount'] as num?)?.toDouble() ?? 0,
        phone: _phoneController.text.trim(),
        transactionPin: transactionPin,
        customerName: _customerName,
      );
      final data = response['data'];
      if (data is! Map<String, dynamic>) {
        throw const BR9ApiException(message: 'Invalid subscription response.');
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
          builder: (_) => SuccessSubPage(
            title: 'Subscription Successful',
            receiptNumber: (data['receiptNumber'] ?? '').toString(),
            nextRenewalDate: DateTime.tryParse(
              (data['nextRenewalDate'] ?? '').toString(),
            ),
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
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.deepNavy,
        appBar: AppBar(
          title: const Text('TV & Internet'),
          backgroundColor: AppColors.deepNavy,
          bottom: TabBar(
            indicatorColor: AppColors.neonGold,
            labelColor: AppColors.neonGold,
            unselectedLabelColor: Colors.white70,
            onTap: (index) => _switchCategory(index == 0 ? 'TV' : 'Internet'),
            tabs: const [
              Tab(text: 'Cable TV'),
              Tab(text: 'Internet Bundles'),
            ],
          ),
        ),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            DropdownButtonFormField<_ProviderOption>(
              initialValue: _selectedProvider,
              dropdownColor: const Color(0xFF0A223D),
              decoration: const InputDecoration(
                labelText: 'Select Cable or Internet Provider',
              ),
              items: _providers
                  .map(
                    (provider) => DropdownMenuItem(
                      value: provider,
                      child: Text(provider.name),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedProvider = value);
                }
              },
            ),
            const SizedBox(height: 12),
            _ValidatedTextField(
              controller: _billersCodeController,
              label: _category == 'TV'
                  ? 'Enter Decoder Number'
                  : 'Enter Account ID',
              hint: _category == 'TV'
                  ? 'SmartCard / IUC Number'
                  : 'Smile / Spectranet Account ID',
              helperText: _category == 'TV'
                  ? 'We verify the decoder before showing available bouquets.'
                  : 'We verify this account before fetching available plans.',
              validator: (value) => value.trim().length >= 6,
            ),
            const SizedBox(height: 12),
            _ValidatedTextField(
              controller: _phoneController,
              label: 'Enter Phone Number',
              hint: '+234 801 234 5678',
              helperText:
                  'We use this to issue your renewal receipt and support updates.',
              keyboardType: TextInputType.phone,
              validator: (value) =>
                  value.replaceAll(RegExp(r'\D'), '').length >= 10,
            ),
            const SizedBox(height: 14),
            OutlinedButton.icon(
              onPressed: _verifying ? null : _verify,
              icon: const Icon(Icons.verified_user_rounded),
              label: Text(_verifying ? 'Verifying...' : 'Verify & Fetch Plans'),
            ),
            if (_customerName != null) ...[
              const SizedBox(height: 16),
              _VerifiedCard(
                customerName: _customerName!,
                currentPlan: _currentPlan ?? '',
              ),
            ],
            const SizedBox(height: 16),
            if (_plans.isNotEmpty)
              RadioGroup<Map<String, dynamic>>(
                groupValue: _selectedPlan,
                onChanged: (value) => setState(() => _selectedPlan = value),
                child: Column(
                  children: _plans
                      .map(
                        (plan) => RadioListTile<Map<String, dynamic>>(
                          value: plan,
                          activeColor: AppColors.neonGold,
                          title: Text(
                            (plan['name'] ?? '').toString(),
                            style: const TextStyle(color: Colors.white),
                          ),
                          subtitle: Text(
                            '₦${((plan['amount'] as num?)?.toDouble() ?? 0).toStringAsFixed(0)}',
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ),
                      )
                      .toList(growable: false),
                ),
              )
            else
              const Text(
                'Verify the account to fetch available plans.',
                style: TextStyle(color: Colors.white70),
              ),
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: _purchasing || _selectedPlan == null
                  ? null
                  : _purchase,
              icon: const Icon(Icons.tv_rounded),
              label: Text(_purchasing ? 'Renewing...' : 'Renew Subscription'),
            ),
          ],
        ),
      ),
    );
  }
}

class _VerifiedCard extends StatelessWidget {
  const _VerifiedCard({required this.customerName, required this.currentPlan});

  final String customerName;
  final String currentPlan;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E8E5A),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        currentPlan.isEmpty
            ? 'Verified: $customerName'
            : 'Verified: $customerName\nCurrent plan: $currentPlan',
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _ValidatedTextField extends StatelessWidget {
  const _ValidatedTextField({
    required this.controller,
    required this.label,
    required this.hint,
    required this.helperText,
    required this.validator,
    this.keyboardType = TextInputType.text,
  });

  final TextEditingController controller;
  final String label;
  final String hint;
  final String helperText;
  final bool Function(String) validator;
  final TextInputType keyboardType;

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

class _ProviderOption {
  const _ProviderOption(this.name, this.serviceId);

  final String name;
  final String serviceId;
}
