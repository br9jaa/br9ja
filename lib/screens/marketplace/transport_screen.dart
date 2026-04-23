import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';
import '../../services/notification_service.dart';
import '../../services/security_gateway.dart';
import '../../services/transaction_pin_prompt.dart';
import 'transport_success_page.dart';

class TransportScreen extends StatefulWidget {
  const TransportScreen({super.key});

  @override
  State<TransportScreen> createState() => _TransportScreenState();
}

class _TransportScreenState extends State<TransportScreen> {
  final _etagController = TextEditingController();
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();

  final _cities = const ['Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Kano'];
  final _operators = const ['GIGM', 'ABC Transport', 'PMT'];

  String _departure = 'Lagos';
  String _destination = 'Abuja';
  String _operator = 'GIGM';
  DateTime _travelDate = DateTime.now().add(const Duration(days: 1));
  String? _lccName;
  double? _lccBalance;
  bool _verifying = false;
  bool _submitting = false;

  @override
  void dispose() {
    _etagController.dispose();
    _amountController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _verifyLcc() async {
    setState(() => _verifying = true);
    try {
      final response = await BR9ApiClient.instance.verifyLccAccount(
        accountID: _etagController.text.trim(),
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      if (!mounted) {
        return;
      }
      setState(() {
        _lccName = (data['customerName'] ?? '').toString();
        _lccBalance = (data['currentBalance'] as num?)?.toDouble();
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

  Future<void> _payLcc() async {
    final amount = double.tryParse(_amountController.text.trim()) ?? 0;
    final authenticated = await SecurityGateway.authenticate(
      context: context,
      reason: 'Confirm LCC toll top-up',
    );
    if (!authenticated || !mounted) {
      return;
    }

    final transactionPin = await requestTransactionPin(
      context: context,
      title: 'Confirm LCC Top-up',
    );
    if (transactionPin == null || !mounted) {
      return;
    }

    setState(() => _submitting = true);
    try {
      final response = await BR9ApiClient.instance.payLcc(
        accountID: _etagController.text.trim(),
        amount: amount,
        phone: _phoneController.text.trim(),
        transactionPin: transactionPin,
        customerName: _lccName,
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      final points = data['br9GoldPoints'];
      if (points is num && mounted) {
        context.read<UserProvider>().setGoldPoints(points.toInt());
      }

      if (!mounted) {
        return;
      }
      await NotificationService.transactionSuccess();
      if (!mounted) {
        return;
      }
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => TransportSuccessPage(
            title: 'Successful Top-up',
            reference: (data['reference'] ?? data['receiptNumber'] ?? '')
                .toString(),
            message: 'Your LCC eTag top-up has been submitted successfully.',
            amount: amount,
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
        setState(() => _submitting = false);
      }
    }
  }

  Future<void> _requestBusTicket() async {
    setState(() => _submitting = true);
    try {
      final response = await BR9ApiClient.instance.requestBusTicket(
        departure: _departure,
        destination: _destination,
        travelDate: _travelDate,
        operator: _operator,
        phone: _phoneController.text.trim(),
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      if (!mounted) {
        return;
      }
      await NotificationService.transactionSuccess();
      if (!mounted) {
        return;
      }
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => TransportSuccessPage(
            title: 'Booking Request Received',
            reference: (data['reference'] ?? '').toString(),
            message:
                'The admin fulfillment team will confirm seat availability and complete the transport booking.',
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
        setState(() => _submitting = false);
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
          title: const Text('Transport'),
          backgroundColor: AppColors.deepNavy,
          bottom: const TabBar(
            indicatorColor: AppColors.neonGold,
            tabs: [
              Tab(text: 'LCC Tolls'),
              Tab(text: 'Inter-state Bus'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _TollsCard(
              etagController: _etagController,
              amountController: _amountController,
              phoneController: _phoneController,
              lccName: _lccName,
              lccBalance: _lccBalance,
              verifying: _verifying,
              submitting: _submitting,
              onVerify: _verifyLcc,
              onPay: _payLcc,
            ),
            _BusCard(
              cities: _cities,
              operators: _operators,
              departure: _departure,
              destination: _destination,
              operator: _operator,
              travelDate: _travelDate,
              submitting: _submitting,
              onDepartureChanged: (value) => setState(() => _departure = value),
              onDestinationChanged: (value) =>
                  setState(() => _destination = value),
              onOperatorChanged: (value) => setState(() => _operator = value),
              onTravelDateChanged: (value) =>
                  setState(() => _travelDate = value),
              onSubmit: _requestBusTicket,
            ),
          ],
        ),
      ),
    );
  }
}

class _TollsCard extends StatelessWidget {
  const _TollsCard({
    required this.etagController,
    required this.amountController,
    required this.phoneController,
    required this.lccName,
    required this.lccBalance,
    required this.verifying,
    required this.submitting,
    required this.onVerify,
    required this.onPay,
  });

  final TextEditingController etagController;
  final TextEditingController amountController;
  final TextEditingController phoneController;
  final String? lccName;
  final double? lccBalance;
  final bool verifying;
  final bool submitting;
  final VoidCallback onVerify;
  final VoidCallback onPay;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        TextField(
          controller: etagController,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(labelText: 'eTag Number'),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: verifying ? null : onVerify,
          icon: const Icon(Icons.verified_rounded),
          label: Text(verifying ? 'Verifying...' : 'Verify eTag'),
        ),
        if (lccName != null) ...[
          const SizedBox(height: 14),
          _InfoBadge(
            title: lccName!,
            subtitle:
                'Current LCC balance: ₦${(lccBalance ?? 0).toStringAsFixed(2)}',
          ),
        ],
        const SizedBox(height: 18),
        TextField(
          controller: amountController,
          keyboardType: TextInputType.number,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(labelText: 'Top-up Amount'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: phoneController,
          keyboardType: TextInputType.phone,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(labelText: 'Phone Number'),
        ),
        const SizedBox(height: 18),
        FilledButton.icon(
          onPressed: submitting ? null : onPay,
          icon: const Icon(Icons.toll_rounded),
          label: Text(submitting ? 'Processing...' : 'Top Up LCC'),
        ),
      ],
    );
  }
}

class _BusCard extends StatelessWidget {
  const _BusCard({
    required this.cities,
    required this.operators,
    required this.departure,
    required this.destination,
    required this.operator,
    required this.travelDate,
    required this.submitting,
    required this.onDepartureChanged,
    required this.onDestinationChanged,
    required this.onOperatorChanged,
    required this.onTravelDateChanged,
    required this.onSubmit,
  });

  final List<String> cities;
  final List<String> operators;
  final String departure;
  final String destination;
  final String operator;
  final DateTime travelDate;
  final bool submitting;
  final ValueChanged<String> onDepartureChanged;
  final ValueChanged<String> onDestinationChanged;
  final ValueChanged<String> onOperatorChanged;
  final ValueChanged<DateTime> onTravelDateChanged;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _Dropdown(
          label: 'Departure',
          value: departure,
          items: cities,
          onChanged: onDepartureChanged,
        ),
        _Dropdown(
          label: 'Destination',
          value: destination,
          items: cities,
          onChanged: onDestinationChanged,
        ),
        _Dropdown(
          label: 'Operator',
          value: operator,
          items: operators,
          onChanged: onOperatorChanged,
        ),
        const SizedBox(height: 8),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text(
            'Travel Date',
            style: TextStyle(color: Colors.white70),
          ),
          subtitle: Text(
            '${travelDate.year}-${travelDate.month.toString().padLeft(2, '0')}-${travelDate.day.toString().padLeft(2, '0')}',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
          trailing: const Icon(
            Icons.calendar_month_rounded,
            color: AppColors.neonGold,
          ),
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: travelDate,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 90)),
            );
            if (picked != null) {
              onTravelDateChanged(picked);
            }
          },
        ),
        const SizedBox(height: 18),
        FilledButton.icon(
          onPressed: submitting ? null : onSubmit,
          icon: const Icon(Icons.directions_bus_rounded),
          label: Text(submitting ? 'Submitting...' : 'Request Bus Ticket'),
        ),
      ],
    );
  }
}

class _Dropdown extends StatelessWidget {
  const _Dropdown({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final String value;
  final List<String> items;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: DropdownButtonFormField<String>(
        initialValue: value,
        dropdownColor: const Color(0xFF0A223D),
        decoration: InputDecoration(labelText: label),
        items: items
            .map((item) => DropdownMenuItem(value: item, child: Text(item)))
            .toList(growable: false),
        onChanged: (value) {
          if (value != null) {
            onChanged(value);
          }
        },
      ),
    );
  }
}

class _InfoBadge extends StatelessWidget {
  const _InfoBadge({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF063B2E),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.greenAccent.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }
}
