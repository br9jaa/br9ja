import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

import 'service_ui.dart';

class JambPage extends StatefulWidget {
  const JambPage({super.key});

  @override
  State<JambPage> createState() => _JambPageState();
}

class _JambPageState extends State<JambPage> {
  String _selectedEntry = 'UTME';
  String _selectedPlan = 'e-PIN';

  @override
  Widget build(BuildContext context) {
    return ServiceScaffold(
      title: 'Tertiary Entry',
      subtitle:
          'Get JAMB UTME and Direct Entry e-PINs with a cleaner payment flow.',
      heroIcon: Icons.menu_book_rounded,
      totalAmount: '₦0.00',
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
              ['e-PIN', 'Profile Code', 'Admission Processing'],
              (value) {
                _selectedPlan = value;
              },
            ),
          ),
          const SizedBox(height: 12),
          const ActionableInputRow(
            label: 'Enter Details',
            hint: 'Profile Code / Registered Phone',
            icon: Icons.badge_rounded,
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
