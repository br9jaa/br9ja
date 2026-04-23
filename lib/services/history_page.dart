import 'dart:io';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import '../widgets/br9ja_snackbar.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppColors.deepNavy,
        centerTitle: true,
        titleTextStyle: const TextStyle(
          color: AppColors.neonGold,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
        title: const Text('History'),
        actions: [
          TextButton.icon(
            onPressed: () => _exportStatement(context),
            icon: const Icon(Icons.download_rounded, color: AppColors.neonGold),
            label: const Text(
              'Statement',
              style: TextStyle(color: AppColors.neonGold),
            ),
          ),
        ],
      ),
      body: const Center(
        child: Text(
          'Transaction History Ready',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  Future<void> _exportStatement(BuildContext context) async {
    final tempDir = await getTemporaryDirectory();
    final file = File('${tempDir.path}/bayright_statement.csv');
    await file.writeAsString(
      'Date,Type,Amount,Status\n'
      '2026-04-08,Internal Transfer,25000,Success\n'
      '2026-04-07,MTN Airtime,2000,Success\n'
      '2026-04-06,DSTV Subscription,12500,Success\n',
    );
    await Share.shareXFiles([
      XFile(file.path),
    ], text: 'Bayright9ja Statement Export');
    if (context.mounted) {
      Br9jaSnackBar.show(
        context,
        message: 'Statement exported as CSV',
        icon: Icons.table_chart_rounded,
      );
    }
  }
}
