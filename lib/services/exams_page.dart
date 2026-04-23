import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import 'service_ui.dart';

class ExamsPage extends StatefulWidget {
  const ExamsPage({super.key});

  @override
  State<ExamsPage> createState() => _ExamsPageState();
}

class _ExamsPageState extends State<ExamsPage> {
  String _selectedBody = 'WAEC';
  String _selectedPlan = 'Result Checker';

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Exam PINs',
      subtitle:
          'Purchase WAEC, NECO, and NABTEB registration or result checker PINs.',
      heroIcon: Icons.school_rounded,
      totalAmount: '₦0.00',
      child: Column(
        children: [
          ActionableSelectRow(
            label: 'Select Body',
            value: _selectedBody,
            icon: Icons.menu_book_rounded,
            onTap: () => _showOptions(
              'Select Exam Body',
              ['WAEC', 'NECO', 'NABTEB'],
              (value) {
                _selectedBody = value;
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
              ['Result Checker', 'Registration PIN', 'Scratch Card'],
              (value) {
                _selectedPlan = value;
              },
            ),
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Phone Number',
            icon: Icons.phone_android_rounded,
          ),
          const SizedBox(height: 16),
          ServiceActionButton(onPressed: () async {}, label: 'Proceed'),
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
}
