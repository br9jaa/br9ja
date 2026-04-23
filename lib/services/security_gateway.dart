import 'dart:ui';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';

import '../logic/secure_storage_service.dart';

class SecurityGateway {
  static final LocalAuthentication _localAuth = LocalAuthentication();
  static final SecureStorageService _storageService = SecureStorageService();
  static const int _pinLength = 6;

  static Future<bool> authenticate({
    required BuildContext context,
    required String reason,
    String fallbackTitle = 'Enter 6-digit PIN',
  }) async {
    try {
      final canCheck = await _localAuth.canCheckBiometrics;
      final isSupported = await _localAuth.isDeviceSupported();
      final availableBiometrics = canCheck
          ? await _localAuth.getAvailableBiometrics()
          : <BiometricType>[];

      final hasBiometrics = isSupported && availableBiometrics.isNotEmpty;

      if (hasBiometrics) {
        final authenticated = await _localAuth.authenticate(
          localizedReason: reason,
          options: const AuthenticationOptions(
            biometricOnly: false,
            stickyAuth: true,
          ),
        );
        if (authenticated) {
          return true;
        }
      }
    } catch (_) {
      // Fall back to PIN overlay below.
    }

    final hasPin = await _storageService.hasPin();
    if (!context.mounted) {
      return false;
    }
    final mode = hasPin ? _PinMode.verify : _PinMode.create;
    return await _showPinOverlay(context, title: fallbackTitle, mode: mode) ??
        false;
  }

  static Future<bool?> _showPinOverlay(
    BuildContext context, {
    required String title,
    required _PinMode mode,
  }) {
    return showGeneralDialog<bool>(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'PIN Entry',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 220),
      pageBuilder: (_, _, _) => _PinOverlay(title: title, mode: mode),
      transitionBuilder: (_, animation, _, child) {
        final fade = CurvedAnimation(parent: animation, curve: Curves.easeOut);
        final scale = Tween<double>(begin: 0.96, end: 1).animate(fade);
        return FadeTransition(
          opacity: fade,
          child: ScaleTransition(scale: scale, child: child),
        );
      },
    );
  }
}

enum _PinMode { create, verify }

class _PinOverlay extends StatefulWidget {
  final String title;
  final _PinMode mode;

  const _PinOverlay({required this.title, required this.mode});

  @override
  State<_PinOverlay> createState() => _PinOverlayState();
}

class _PinOverlayState extends State<_PinOverlay> {
  final SecureStorageService _storageService = SecureStorageService();
  String _pin = '';
  String? _firstPin;
  String? _errorMessage;
  bool _submitting = false;

  void _addDigit(String digit) {
    if (_pin.length >= SecurityGateway._pinLength) {
      return;
    }

    setState(() => _pin += digit);
    HapticFeedback.selectionClick();

    if (_pin.length == SecurityGateway._pinLength) {
      _submitPin();
    }
  }

  void _removeDigit() {
    if (_pin.isEmpty) {
      return;
    }
    setState(() => _pin = _pin.substring(0, _pin.length - 1));
  }

  Future<void> _submitPin() async {
    if (_submitting || _pin.length != SecurityGateway._pinLength) {
      return;
    }

    setState(() => _submitting = true);

    if (widget.mode == _PinMode.verify) {
      final verified = await _storageService.verifyPin(_pin);
      if (!mounted) {
        return;
      }
      if (verified) {
        Navigator.pop(context, true);
        return;
      }
      await HapticFeedback.heavyImpact();
      setState(() {
        _errorMessage = 'Incorrect PIN. Please try again.';
        _pin = '';
        _submitting = false;
      });
      return;
    }

    if (_firstPin == null) {
      setState(() {
        _firstPin = _pin;
        _pin = '';
        _errorMessage = null;
        _submitting = false;
      });
      return;
    }

    if (_firstPin != _pin) {
      await HapticFeedback.heavyImpact();
      setState(() {
        _firstPin = null;
        _pin = '';
        _errorMessage = 'PINs do not match. Start again.';
        _submitting = false;
      });
      return;
    }

    await _storageService.savePin(_pin);
    if (!mounted) {
      return;
    }
    Navigator.pop(context, true);
  }

  String get _helperText {
    if (widget.mode == _PinMode.verify) {
      return 'Face ID or biometrics are unavailable. Enter your saved 6-digit BR9 PIN, or keep using your phone PIN or pattern when supported.';
    }
    if (_firstPin == null) {
      return 'Create a 6-digit BR9 PIN for secure approvals and faster returning-user sign in.';
    }
    return 'Confirm the same 6-digit PIN to finish setup.';
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
              child: Container(
                width: double.infinity,
                constraints: const BoxConstraints(maxWidth: 360),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.deepNavy.withValues(alpha: 0.96),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.neonGold),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      widget.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _helperText,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white70),
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        _errorMessage!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Color(0xFFFF8080),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        SecurityGateway._pinLength,
                        (index) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 8),
                          width: 16,
                          height: 16,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _pin.length > index
                                ? AppColors.neonGold
                                : Colors.transparent,
                            border: Border.all(color: AppColors.neonGold),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    ...[
                      ['1', '2', '3'],
                      ['4', '5', '6'],
                      ['7', '8', '9'],
                      ['', '0', '⌫'],
                    ].map(
                      (row) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: row.map((key) {
                            if (key.isEmpty) {
                              return const SizedBox(width: 68, height: 68);
                            }
                            return _PinKey(
                              label: key,
                              onTap: key == '⌫'
                                  ? _removeDigit
                                  : () => _addDigit(key),
                            );
                          }).toList(),
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
}

class _PinKey extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _PinKey({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(34),
      onTap: onTap,
      child: Container(
        width: 68,
        height: 68,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.neonGold,
          boxShadow: const [
            BoxShadow(
              color: Color(0x33FFD700),
              blurRadius: 12,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Center(
          child: Text(
            label,
            style: const TextStyle(
              color: AppColors.deepNavy,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}
