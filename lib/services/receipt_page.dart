import 'dart:typed_data';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:screenshot/screenshot.dart';
import 'package:share_plus/share_plus.dart';

import '../models/transaction_model.dart';
import '../providers/user_provider.dart';
import '../services/notification_service.dart';
import '../widgets/confetti_overlay.dart';

class ReceiptPage extends StatefulWidget {
  const ReceiptPage({super.key, required this.transaction});

  final TransactionRecord transaction;

  @override
  State<ReceiptPage> createState() => _ReceiptPageState();
}

class _ReceiptPageState extends State<ReceiptPage> {
  final ScreenshotController _screenshotController = ScreenshotController();

  bool get _isGoldConversion {
    final service = widget.transaction.service.toLowerCase();
    return service.contains('gold') && service.contains('conversion');
  }

  @override
  void initState() {
    super.initState();
    if (_isGoldConversion) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        NotificationService.celebrateGoldConversion();
      });
    }
  }

  Future<void> _shareReceipt({required bool statusMode}) async {
    final image = await _captureReceipt();
    final text = statusMode ? _buildStatusCaption() : _buildShareText();
    if (image != null) {
      await Share.shareXFiles(
        [
          XFile.fromData(
            image,
            mimeType: 'image/png',
            name: 'br9-receipt-${widget.transaction.reference}.png',
          ),
        ],
        text: text,
        subject: 'BR9ja Receipt',
      );
      return;
    }

    await Share.share(text, subject: 'BR9ja Receipt');
  }

  Future<Uint8List?> _captureReceipt() {
    return _screenshotController.capture(
      pixelRatio: 2,
      delay: const Duration(milliseconds: 30),
    );
  }

  @override
  Widget build(BuildContext context) {
    const Color deepNavy = Color(0xFF001B3D);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(title: const Text('Transaction Receipt'), elevation: 0),
      body: ConfettiOverlay(
        play: _isGoldConversion,
        goldRain: _isGoldConversion,
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Screenshot(
              controller: _screenshotController,
              child: Container(
                width: MediaQuery.of(context).size.width * 0.88,
                padding: const EdgeInsets.all(30),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(25),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.check_circle,
                      color: Colors.green,
                      size: 60,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _isSuccessful
                          ? 'Transaction Successful'
                          : 'Transaction Update',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 30),
                    _row('Service', widget.transaction.service),
                    if ((widget.transaction.recipientName ?? '')
                        .trim()
                        .isNotEmpty)
                      _row('Recipient', widget.transaction.recipientName!),
                    _row(
                      'Amount',
                      '₦${widget.transaction.amount.toStringAsFixed(2)}',
                    ),
                    _row('Date', _formatDate(widget.transaction.createdAt)),
                    _row(
                      'Transaction ID',
                      widget.transaction.id.isEmpty
                          ? 'Pending Sync'
                          : widget.transaction.id,
                    ),
                    _row('Reference', widget.transaction.reference),
                    if (widget.transaction.balanceAfter != null)
                      _row(
                        'Final Balance',
                        '₦${widget.transaction.balanceAfter!.toStringAsFixed(2)}',
                      ),
                    _row('Status', widget.transaction.status),
                    const Divider(height: 40),
                    const Text(
                      'BR9 HUB',
                      style: TextStyle(
                        color: deepNavy,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 22),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => _shareReceipt(statusMode: false),
                        icon: const Icon(Icons.share, size: 18),
                        label: const Text('Share Receipt'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: deepNavy,
                          side: const BorderSide(color: deepNavy),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: () => _shareReceipt(statusMode: true),
                        icon: const Icon(Icons.ios_share_rounded, size: 18),
                        label: const Text('Share to WhatsApp Status'),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.neonGold,
                          foregroundColor: AppColors.deepNavy,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  bool get _isSuccessful {
    final status = widget.transaction.status.toLowerCase();
    return status == 'successful' ||
        status == 'completed' ||
        status == 'success';
  }

  String _formatDate(DateTime value) {
    final local = value.toLocal();
    final minutes = local.minute.toString().padLeft(2, '0');
    return '${local.year}-${local.month.toString().padLeft(2, '0')}-'
        '${local.day.toString().padLeft(2, '0')} '
        '${local.hour.toString().padLeft(2, '0')}:$minutes';
  }

  String _buildShareText() {
    final lines = <String>[
      'Bayright9ja Receipt',
      'Service: ${widget.transaction.service}',
      'Reference: ${widget.transaction.reference}',
      'Transaction ID: ${widget.transaction.id}',
      'Amount: ₦${widget.transaction.amount.toStringAsFixed(2)}',
      'Status: ${widget.transaction.status}',
      'Date: ${_formatDate(widget.transaction.createdAt)}',
    ];

    if (widget.transaction.recipientName != null &&
        widget.transaction.recipientName!.trim().isNotEmpty) {
      lines.add('Recipient: ${widget.transaction.recipientName}');
    }

    if (widget.transaction.balanceAfter != null) {
      lines.add(
        'Final Balance: ₦${widget.transaction.balanceAfter!.toStringAsFixed(2)}',
      );
    }

    return lines.join('\n');
  }

  String _buildStatusCaption() {
    final code = context.read<UserProvider>().referralCode;
    final referralLink = code.isEmpty
        ? 'https://br9ja.app'
        : 'https://br9ja.app/r/$code';
    return 'Just paid my bills on BR9ja and earned GOLD! Download here: '
        '$referralLink';
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}
