import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

class GlobalErrorBoundary extends StatefulWidget {
  final Widget child;

  const GlobalErrorBoundary({super.key, required this.child});

  @override
  State<GlobalErrorBoundary> createState() => _GlobalErrorBoundaryState();
}

class _GlobalErrorBoundaryState extends State<GlobalErrorBoundary> {
  @override
  void initState() {
    super.initState();
    ErrorWidget.builder = (details) => _CrashView(
      onRestart: () {
        if (mounted) {
          setState(() {});
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}

class _CrashView extends StatelessWidget {
  final VoidCallback onRestart;

  const _CrashView({required this.onRestart});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.deepNavy,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 360),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.shield_rounded,
                  color: AppColors.neonGold,
                  size: 56,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Something went wrong, but your money is safe.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: onRestart,
                    child: const Text('Restart App'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
