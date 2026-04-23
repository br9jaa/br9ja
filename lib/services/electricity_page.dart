import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import 'service_ui.dart';

class ElectricityPage extends StatefulWidget {
  const ElectricityPage({super.key});

  @override
  State<ElectricityPage> createState() => _ElectricityPageState();
}

class _ElectricityPageState extends State<ElectricityPage> {
  String _selectedDisco = 'IKEDC';
  String _selectedPlan = 'Prepaid Meter';
  final TextEditingController _meterController = TextEditingController();
  bool _meterInvalid = false;

  @override
  void dispose() {
    _meterController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Electricity',
      subtitle: 'Pay prepaid and postpaid bills for all major DisCos.',
      heroIcon: Icons.bolt_rounded,
      serviceHeroTag: 'service-electricity',
      totalAmount: '₦0.00',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Select Provider',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: [
              _ProviderChip(
                label: 'IKEDC',
                icon: Icons.bolt_rounded,
                isSelected: _selectedDisco == 'IKEDC',
                onTap: () => setState(() => _selectedDisco = 'IKEDC'),
              ),
              _ProviderChip(
                label: 'EKEDC',
                icon: Icons.flash_on_rounded,
                isSelected: _selectedDisco == 'EKEDC',
                onTap: () => setState(() => _selectedDisco = 'EKEDC'),
              ),
              _ProviderChip(
                label: 'AEDC',
                icon: Icons.electrical_services_rounded,
                isSelected: _selectedDisco == 'AEDC',
                onTap: () => setState(() => _selectedDisco = 'AEDC'),
              ),
              _ProviderChip(
                label: 'PHED',
                icon: Icons.power_rounded,
                isSelected: _selectedDisco == 'PHED',
                onTap: () => setState(() => _selectedDisco = 'PHED'),
              ),
              _ProviderChip(
                label: 'IBEDC',
                icon: Icons.offline_bolt_rounded,
                isSelected: _selectedDisco == 'IBEDC',
                onTap: () => setState(() => _selectedDisco = 'IBEDC'),
              ),
              _ProviderChip(
                label: 'KAEDCO',
                icon: Icons.energy_savings_leaf_rounded,
                isSelected: _selectedDisco == 'KAEDCO',
                onTap: () => setState(() => _selectedDisco = 'KAEDCO'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ActionableSelectRow(
            label: 'Select Plan',
            value: _selectedPlan,
            icon: Icons.tune_rounded,
            onTap: _showPlanSheet,
          ),
          const SizedBox(height: 12),
          ActionableInputRow(
            label: 'Enter Details',
            hint: 'Meter Number',
            icon: Icons.numbers_rounded,
            controller: _meterController,
            invalid: _meterInvalid,
            onChanged: (_) {
              if (_meterInvalid) {
                setState(() => _meterInvalid = false);
              }
            },
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: _verifyMeter, label: 'Verify Meter'),
        ],
      ),
    );
  }

  Future<void> _showPlanSheet() async {
    const plans = ['Prepaid Meter', 'Postpaid Meter'];
    final picked = await _showOptions('Select Plan', plans);
    if (picked != null) setState(() => _selectedPlan = picked);
  }

  Future<String?> _showOptions(String title, List<String> options) {
    return showModalBottomSheet<String>(
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
          ...options.map(
            (item) => ListTile(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              tileColor: const Color(0xFF0A223D),
              title: Text(item, style: const TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(context, item),
            ),
          ),
        ],
      ),
    );
  }

  void _verifyMeter() {
    final meter = _meterController.text.trim();
    final invalidMeter = meter.length < 11;
    setState(() => _meterInvalid = invalidMeter);
  }
}

class _ProviderChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _ProviderChip({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: SizedBox(
        width: 72,
        child: Column(
          children: [
            Container(
              height: 60,
              width: 60,
              decoration: BoxDecoration(
                color: const Color(0xFF0A223D),
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.neonGold : Colors.white12,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Icon(icon, color: AppColors.neonGold),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
