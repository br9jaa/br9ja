import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

class PinHistoryCard extends StatelessWidget {
  const PinHistoryCard({super.key, required this.pin});

  final Map<String, dynamic> pin;

  @override
  Widget build(BuildContext context) {
    final serviceType = (pin['serviceType'] ?? pin['service'] ?? '').toString();
    final createdAt = DateTime.tryParse((pin['createdAt'] ?? '').toString());

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          const Icon(Icons.school_rounded, color: AppColors.neonGold),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  serviceType.replaceAll('_', ' '),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  createdAt == null
                      ? 'Recently purchased'
                      : '${createdAt.day}/${createdAt.month}/${createdAt.year}',
                  style: const TextStyle(color: Colors.white60, fontSize: 12),
                ),
              ],
            ),
          ),
          Text(
            (pin['pin'] ?? '').toString(),
            style: const TextStyle(
              color: AppColors.neonGold,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
