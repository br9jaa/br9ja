import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';

class SecurityBadge extends StatelessWidget {
  const SecurityBadge({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final verified = context.watch<UserProvider>().isLivenessVerified;
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 10 : 14,
        vertical: compact ? 6 : 9,
      ),
      decoration: BoxDecoration(
        color: verified
            ? AppColors.neonGold.withValues(alpha: 0.16)
            : Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: verified ? AppColors.neonGold : Colors.white24,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            verified ? Icons.verified_rounded : Icons.shield_outlined,
            size: compact ? 16 : 18,
            color: verified ? AppColors.neonGold : Colors.white70,
          ),
          const SizedBox(width: 6),
          Text(
            verified ? 'Verified' : 'Liveness needed',
            style: TextStyle(
              color: verified ? AppColors.neonGold : Colors.white70,
              fontWeight: FontWeight.w800,
              fontSize: compact ? 12 : 13,
            ),
          ),
        ],
      ),
    );
  }
}
