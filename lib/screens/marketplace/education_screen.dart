import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';
import '../../services/security_gateway.dart';
import '../../services/transaction_pin_prompt.dart';
import 'pin_history_card.dart';
import 'pin_receipt_screen.dart';

class EducationScreen extends StatefulWidget {
  const EducationScreen({super.key});

  @override
  State<EducationScreen> createState() => _EducationScreenState();
}

class _EducationScreenState extends State<EducationScreen> {
  static const List<_EducationProduct> _products = [
    _EducationProduct('WAEC_RESULT', 'WAEC Result', Icons.fact_check_rounded),
    _EducationProduct('WAEC_GCE', 'WAEC GCE', Icons.school_rounded),
    _EducationProduct('JAMB', 'JAMB e-PIN', Icons.edit_document),
    _EducationProduct('NECO', 'NECO Token', Icons.badge_rounded),
    _EducationProduct('NABTEB', 'NABTEB', Icons.engineering_rounded),
  ];

  final TextEditingController _profileCodeController = TextEditingController();
  final TextEditingController _quantityController = TextEditingController(
    text: '1',
  );

  Map<String, double> _prices = <String, double>{};
  List<Map<String, dynamic>> _history = <Map<String, dynamic>>[];
  _EducationProduct _selected = _products.first;
  bool _loading = true;
  bool _purchasing = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadEducationData();
  }

  @override
  void dispose() {
    _profileCodeController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  Future<void> _loadEducationData() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final responses = await Future.wait([
        BR9ApiClient.instance.fetchEducationPrices(),
        BR9ApiClient.instance.fetchEducationPinHistory(),
      ]);
      final priceData = responses[0]['data'];
      final historyData = responses[1]['data'];

      if (!mounted) {
        return;
      }
      setState(() {
        _prices = priceData is List
            ? {
                for (final item in priceData.whereType<Map<String, dynamic>>())
                  (item['serviceType'] ?? '').toString():
                      (item['amount'] as num?)?.toDouble() ?? 0,
              }
            : <String, double>{};
        _history = historyData is List
            ? historyData.whereType<Map<String, dynamic>>().toList(
                growable: false,
              )
            : <Map<String, dynamic>>[];
      });
    } on BR9ApiException catch (error) {
      if (mounted) {
        setState(() => _errorMessage = error.message);
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  int get _quantity {
    if (_selected.code == 'JAMB') {
      return 1;
    }
    return int.tryParse(_quantityController.text.trim())?.clamp(1, 10) ?? 1;
  }

  double get _currentPrice => _prices[_selected.code] ?? 0;

  Future<void> _purchase() async {
    final authenticated = await SecurityGateway.authenticate(
      context: context,
      reason: 'Confirm education PIN purchase',
    );
    if (!authenticated || !mounted) {
      return;
    }

    final transactionPin = await requestTransactionPin(
      context: context,
      title: 'Confirm Education Purchase',
    );
    if (transactionPin == null || !mounted) {
      return;
    }

    setState(() => _purchasing = true);
    try {
      final response = await BR9ApiClient.instance.purchasePin(
        serviceType: _selected.code,
        transactionPin: transactionPin,
        profileCode: _profileCodeController.text.trim(),
        quantity: _quantity,
      );
      final data = response['data'];
      if (data is! Map<String, dynamic>) {
        throw const BR9ApiException(message: 'Invalid education PIN response.');
      }

      final points = data['br9GoldPoints'];
      if (points is num && mounted) {
        context.read<UserProvider>().setGoldPoints(points.toInt());
      }

      final pins = data['pins'];
      final firstPin = pins is List && pins.isNotEmpty
          ? pins.first as Map<String, dynamic>
          : <String, dynamic>{};
      await _loadEducationData();

      if (!mounted) {
        return;
      }
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => PinReceiptScreen(
            serviceType: _selected.code,
            pin: (firstPin['pin'] ?? '').toString(),
            serial: (firstPin['serial'] ?? '').toString(),
            createdAt:
                DateTime.tryParse((firstPin['createdAt'] ?? '').toString()) ??
                DateTime.now(),
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
    final total = _currentPrice * _quantity;

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Education PINs'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _loadEducationData,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                if (_loading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(
                        color: AppColors.neonGold,
                      ),
                    ),
                  )
                else if (_errorMessage != null)
                  _InfoCard(text: _errorMessage!)
                else ...[
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _products.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 1.05,
                        ),
                    itemBuilder: (context, index) {
                      final product = _products[index];
                      return _EducationProductCard(
                        product: product,
                        price: _prices[product.code] ?? 0,
                        selected: product.code == _selected.code,
                        onTap: () => setState(() => _selected = product),
                      );
                    },
                  ),
                  const SizedBox(height: 18),
                  if (_selected.code == 'JAMB')
                    TextField(
                      controller: _profileCodeController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'JAMB Profile Code',
                        labelStyle: TextStyle(color: Colors.white70),
                      ),
                    )
                  else
                    TextField(
                      controller: _quantityController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Quantity',
                        labelStyle: TextStyle(color: Colors.white70),
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                  const SizedBox(height: 14),
                  _InfoCard(
                    text:
                        'Selected: ${_selected.label}\nPrice: ₦${_currentPrice.toStringAsFixed(2)}\nTotal before convenience fee: ₦${total.toStringAsFixed(2)}',
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: _purchasing ? null : _purchase,
                      icon: const Icon(Icons.lock_rounded),
                      label: const Text('Buy Now'),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Recent PINs',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (_history.isEmpty)
                    const _InfoCard(text: 'No education PIN purchases yet.')
                  else
                    ..._history.map((pin) => PinHistoryCard(pin: pin)),
                ],
              ],
            ),
          ),
          if (_purchasing)
            const ColoredBox(
              color: Color(0x99000000),
              child: Center(
                child: CircularProgressIndicator(color: AppColors.neonGold),
              ),
            ),
        ],
      ),
    );
  }
}

class _EducationProductCard extends StatelessWidget {
  const _EducationProductCard({
    required this.product,
    required this.price,
    required this.selected,
    required this.onTap,
  });

  final _EducationProduct product;
  final double price;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0A223D),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: selected ? AppColors.neonGold : Colors.white10,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(product.icon, color: AppColors.neonGold),
            const Spacer(),
            Text(
              product.label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              price == 0 ? 'Loading price' : '₦${price.toStringAsFixed(0)}',
              style: const TextStyle(color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white10),
      ),
      child: Text(text, style: const TextStyle(color: Colors.white70)),
    );
  }
}

class _EducationProduct {
  const _EducationProduct(this.code, this.label, this.icon);

  final String code;
  final String label;
  final IconData icon;
}
