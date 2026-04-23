import 'dart:ui';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../logic/auth_provider.dart';
import '../logic/haptics_service.dart';
import '../logic/secure_storage_service.dart';
import '../widgets/br9ja_snackbar.dart';
import 'reset_password_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _identifierController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _quickPinController = TextEditingController();
  final FocusNode _identifierFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();
  final FocusNode _quickPinFocusNode = FocusNode();
  final LocalAuthentication _localAuth = LocalAuthentication();
  final SecureStorageService _storageService = SecureStorageService();

  bool _rememberMe = true;
  bool _loadingLoginState = true;
  bool _quickUnlockMode = false;
  bool _obscurePassword = true;
  bool _obscureQuickPin = true;
  RememberedLogin? _rememberedLogin;

  bool get _supportsQuickUnlock => !kIsWeb;

  @override
  void initState() {
    super.initState();
    _loadLoginState();
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _quickPinController.dispose();
    _identifierFocusNode.dispose();
    _passwordFocusNode.dispose();
    _quickPinFocusNode.dispose();
    super.dispose();
  }

  Future<void> _loadLoginState() async {
    final rememberedLogin = await _storageService.readRememberedLogin();
    final hasQuickPin = await _storageService.hasQuickUnlockPin();
    final hasSession = await _storageService.hasStoredSession();

    if (!mounted) {
      return;
    }

    setState(() {
      _rememberedLogin = rememberedLogin;
      _identifierController.text = rememberedLogin?.identifier ?? '';
      _quickUnlockMode =
          _supportsQuickUnlock &&
          rememberedLogin != null &&
          hasQuickPin &&
          hasSession;
      _loadingLoginState = false;
    });
  }

  Future<void> _authenticateWithDeviceSecurity() async {
    if (!_supportsQuickUnlock) {
      return;
    }

    try {
      final supported = await _localAuth.isDeviceSupported();
      final hasDeviceSecurity = supported;

      if (!mounted) {
        return;
      }

      if (!hasDeviceSecurity) {
        Br9jaSnackBar.show(
          context,
          message:
              'Face ID, fingerprint, or device security is not configured on this device yet.',
          icon: Icons.info_outline_rounded,
        );
        return;
      }

      await HapticsService.softTick();
      final authenticated = await _localAuth.authenticate(
        localizedReason:
            'Use Face ID, fingerprint, or your device lock to unlock BR9ja',
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
        ),
      );

      if (!authenticated || !mounted) {
        return;
      }

      await _resumeRememberedSession();
    } catch (_) {
      if (!mounted) {
        return;
      }
      Br9jaSnackBar.show(
        context,
        message: 'Device authentication is unavailable right now.',
        icon: Icons.error_outline_rounded,
      );
    }
  }

  Future<void> _resumeRememberedSession() async {
    final authProvider = context.read<AuthProvider>();
    final restored = await authProvider.restoreSessionAfterQuickUnlock();

    if (!mounted) {
      return;
    }

    if (restored) {
      Navigator.of(context).pushReplacementNamed('/dashboard');
      return;
    }

    setState(() {
      _quickUnlockMode = false;
      _quickPinController.clear();
    });
    Br9jaSnackBar.show(
      context,
      message:
          authProvider.errorMessage ??
          'Your secure session expired. Please sign in with your password again.',
      icon: Icons.info_outline_rounded,
    );
  }

  Future<void> _unlockReturningUser() async {
    if (_quickPinController.text.trim().length != 6) {
      Br9jaSnackBar.show(
        context,
        message: 'Enter your 6-digit quick unlock PIN.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    final isValid = await _storageService.verifyQuickUnlockPin(
      _quickPinController.text.trim(),
    );

    if (!mounted) {
      return;
    }

    if (!isValid) {
      await HapticsService.longBuzz();
      if (!mounted) {
        return;
      }
      _quickPinController.clear();
      Br9jaSnackBar.show(
        context,
        message: 'That quick PIN is incorrect. Try again.',
        icon: Icons.error_outline_rounded,
      );
      return;
    }

    await HapticsService.softTick();
    await _resumeRememberedSession();
  }

  Future<void> _login() async {
    final authProvider = context.read<AuthProvider>();
    await HapticsService.softTick();
    if (!mounted) {
      return;
    }

    final completed = await authProvider.login(
      identifier: _identifierController.text.trim(),
      password: _passwordController.text.trim(),
      rememberMe: _rememberMe,
    );

    if (!mounted) {
      return;
    }

    if (completed) {
      if (_supportsQuickUnlock && _rememberedLogin == null && _rememberMe) {
        await _promptQuickUnlockSetup();
      } else if (_supportsQuickUnlock &&
          _rememberMe &&
          !(await _storageService.hasQuickUnlockPin())) {
        await _promptQuickUnlockSetup();
      }
      await _loadLoginState();
      if (!mounted) {
        return;
      }
      if (authProvider.requiresSecureDeviceTransfer &&
          (authProvider.sessionTransferMessage?.isNotEmpty ?? false)) {
        await showDialog<void>(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: AppColors.deepNavy,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(22),
            ),
            title: const Text(
              'Secure Device Transfer',
              style: TextStyle(color: Colors.white),
            ),
            content: Text(
              authProvider.sessionTransferMessage!,
              style: const TextStyle(color: Colors.white70, height: 1.5),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Continue'),
              ),
            ],
          ),
        );
        if (!mounted) {
          return;
        }
      }
      Navigator.of(context).pushReplacementNamed('/dashboard');
      return;
    }

    Br9jaSnackBar.show(
      context,
      message: authProvider.errorMessage ?? 'Login failed. Please try again.',
      icon: Icons.error_outline_rounded,
    );
  }

  Future<void> _promptQuickUnlockSetup() async {
    final configured = await showDialog<bool>(
      context: context,
      barrierDismissible: true,
      builder: (context) => _QuickUnlockSetupDialog(
        storageService: _storageService,
        rememberedLogin: _rememberedLogin,
      ),
    );

    if (configured == true && mounted) {
      Br9jaSnackBar.show(
        context,
        message:
            'Quick unlock is ready. Next time you can use your 6-digit PIN or device security.',
        icon: Icons.verified_user_rounded,
      );
    }
  }

  Future<void> _switchToPasswordLogin() async {
    setState(() {
      _quickUnlockMode = false;
      _quickPinController.clear();
      _identifierController.text = _rememberedLogin?.identifier ?? '';
    });
    _identifierFocusNode.requestFocus();
  }

  Future<void> _useAnotherAccount() async {
    await context.read<AuthProvider>().forgetRememberedLogin();
    if (!mounted) {
      return;
    }
    setState(() {
      _rememberedLogin = null;
      _quickUnlockMode = false;
      _identifierController.clear();
      _passwordController.clear();
      _quickPinController.clear();
    });
  }

  Future<void> _openStoreLink(String url) async {
    await launchUrl(Uri.parse(url));
  }

  @override
  Widget build(BuildContext context) {
    if (_loadingLoginState) {
      return const Scaffold(
        backgroundColor: AppColors.deepNavy,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 1120;
            final authPanel = _buildAuthPanel(context, isWide: isWide);

            if (!isWide) {
              return SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 440),
                    child: authPanel,
                  ),
                ),
              );
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1380),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: _buildWebHeroPanel()),
                      const SizedBox(width: 28),
                      SizedBox(width: 460, child: authPanel),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildWebHeroPanel() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF102B49), Color(0xFF0A223D), Color(0xFF04121F)],
        ),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _StatChip(
            label: 'Market Runner',
            value: 'Games • Bills • BR9 Gold',
          ),
          const SizedBox(height: 22),
          const Text(
            'Play games, pay bills, and get paid from one premium BR9 hub.',
            style: TextStyle(
              color: Colors.white,
              fontSize: 42,
              height: 1.08,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Bayright9ja now leads with Games, BR9 Gold, and Profile clarity while keeping the first login simple and every returning login fast.',
            style: TextStyle(color: Colors.white70, fontSize: 17, height: 1.55),
          ),
          const SizedBox(height: 28),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              OutlinedButton.icon(
                onPressed: () => _openStoreLink(
                  'https://play.google.com/store/apps/details?id=com.bayright9ja.bayright9ja_mobile',
                ),
                icon: const Icon(Icons.android_rounded),
                label: const Text('Download on Play Store'),
              ),
              OutlinedButton.icon(
                onPressed: () =>
                    _openStoreLink('https://apps.apple.com/app/id0000000000'),
                icon: const Icon(Icons.apple_rounded),
                label: const Text('Download on App Store'),
              ),
            ],
          ),
          const SizedBox(height: 28),
          _buildProofCard(
            title: 'Built for confident first-time users',
            body:
                'Moniepoint-style trust cues, verified wallet balances, and explicit bill-pay forms reduce uncertainty before a user taps continue.',
            accent: 'Clear profile and bank status at a glance',
          ),
          const SizedBox(height: 18),
          _buildProofCard(
            title: 'Why mobile feels faster',
            body:
                'After your first password login, BR9 remembers your account on-device and uses a 6-digit quick PIN plus Face ID, fingerprint, or device pattern.',
            accent: 'App-first security without friction',
          ),
        ],
      ),
    );
  }

  Widget _buildProofCard({
    required String title,
    required String body,
    required String accent,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 19,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: const TextStyle(color: Colors.white70, height: 1.5),
          ),
          const SizedBox(height: 12),
          Text(
            accent,
            style: const TextStyle(
              color: AppColors.neonGold,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuthPanel(BuildContext context, {required bool isWide}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(30),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: AppColors.glassEffect,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: Colors.white12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _quickUnlockMode
                    ? 'Welcome back, ${_rememberedLogin?.displayName.split(' ').first ?? 'friend'}'
                    : 'Welcome Back',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _quickUnlockMode
                    ? 'Unlock BR9 with your 6-digit quick PIN or device security.'
                    : kIsWeb
                    ? 'Sign in with your Bayright username or email plus password.'
                    : 'Use your email or Bayright username plus password for your first secure sign in on this device.',
                style: const TextStyle(color: Colors.white70, height: 1.5),
              ),
              if (_quickUnlockMode && _rememberedLogin != null) ...[
                const SizedBox(height: 24),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: AppColors.neonGold,
                        child: Text(
                          _rememberedLogin!.displayName
                              .trim()
                              .substring(0, 1)
                              .toUpperCase(),
                          style: const TextStyle(
                            color: AppColors.deepNavy,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _rememberedLogin!.displayName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _rememberedLogin!.email,
                              style: const TextStyle(color: Colors.white60),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 28),
              if (_quickUnlockMode) ...[
                _GlassField(
                  controller: _quickPinController,
                  focusNode: _quickPinFocusNode,
                  label: '6-Digit Quick PIN',
                  hint: 'Enter your quick PIN',
                  icon: Icons.dialpad_rounded,
                  obscureText: _obscureQuickPin,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => _unlockReturningUser(),
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() => _obscureQuickPin = !_obscureQuickPin);
                    },
                    icon: Icon(
                      _obscureQuickPin
                          ? Icons.visibility_off_rounded
                          : Icons.visibility_rounded,
                      color: Colors.white54,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 56,
                        child: Consumer<AuthProvider>(
                          builder: (context, authProvider, _) {
                            return ElevatedButton(
                              onPressed: authProvider.isLoading
                                  ? null
                                  : _unlockReturningUser,
                              child: authProvider.isLoading
                                  ? const SizedBox(
                                      height: 22,
                                      width: 22,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.6,
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                              AppColors.deepNavy,
                                            ),
                                      ),
                                    )
                                  : const Text(
                                      'Unlock',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 16,
                                      ),
                                    ),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    SizedBox(
                      height: 56,
                      width: 56,
                      child: OutlinedButton(
                        onPressed: _authenticateWithDeviceSecurity,
                        style: OutlinedButton.styleFrom(
                          padding: EdgeInsets.zero,
                          side: const BorderSide(color: AppColors.neonGold),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18),
                          ),
                        ),
                        child: const Icon(
                          Icons.fingerprint_rounded,
                          color: AppColors.neonGold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 12,
                  children: [
                    TextButton(
                      onPressed: _switchToPasswordLogin,
                      child: const Text('Use password instead'),
                    ),
                    TextButton(
                      onPressed: _useAnotherAccount,
                      child: const Text('Use another account'),
                    ),
                  ],
                ),
              ] else ...[
                _GlassField(
                  controller: _identifierController,
                  focusNode: _identifierFocusNode,
                  label: 'Email or Username',
                  hint: 'Enter email or Bayright tag',
                  icon: Icons.alternate_email_rounded,
                  textInputAction: TextInputAction.next,
                  onSubmitted: (_) => _passwordFocusNode.requestFocus(),
                ),
                const SizedBox(height: 16),
                _GlassField(
                  controller: _passwordController,
                  focusNode: _passwordFocusNode,
                  label: 'Password',
                  hint: 'Enter your password',
                  icon: Icons.lock_outline_rounded,
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => _login(),
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off_rounded
                          : Icons.visibility_rounded,
                      color: Colors.white54,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Switch.adaptive(
                      value: _rememberMe,
                      activeThumbColor: AppColors.neonGold,
                      activeTrackColor: AppColors.neonGold.withValues(
                        alpha: 0.35,
                      ),
                      onChanged: (value) {
                        setState(() => _rememberMe = value);
                      },
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Remember this device for faster next-time login',
                        style: TextStyle(
                          color: Colors.white70,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const ResetPasswordPage(),
                        ),
                      );
                    },
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(
                        color: AppColors.neonGold,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Consumer<AuthProvider>(
                  builder: (context, authProvider, _) {
                    return SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: authProvider.isLoading ? null : _login,
                        child: authProvider.isLoading
                            ? const SizedBox(
                                height: 22,
                                width: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.6,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    AppColors.deepNavy,
                                  ),
                                ),
                              )
                            : const Text(
                                'Login',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                    );
                  },
                ),
                if (_supportsQuickUnlock) ...[
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton.icon(
                      onPressed: _authenticateWithDeviceSecurity,
                      icon: const Icon(Icons.fingerprint_rounded),
                      label: const Text('Use Face ID, fingerprint, or pattern'),
                    ),
                  ),
                ],
              ],
              const SizedBox(height: 24),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.of(context).pushNamed('/signup'),
                  child: const Text.rich(
                    TextSpan(
                      text: 'New to Bayright9ja? ',
                      style: TextStyle(color: Colors.white70),
                      children: [
                        TextSpan(
                          text: 'Create Account',
                          style: TextStyle(
                            color: AppColors.neonGold,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickUnlockSetupDialog extends StatefulWidget {
  const _QuickUnlockSetupDialog({
    required this.storageService,
    required this.rememberedLogin,
  });

  final SecureStorageService storageService;
  final RememberedLogin? rememberedLogin;

  @override
  State<_QuickUnlockSetupDialog> createState() =>
      _QuickUnlockSetupDialogState();
}

class _QuickUnlockSetupDialogState extends State<_QuickUnlockSetupDialog> {
  final TextEditingController _firstPinController = TextEditingController();
  final TextEditingController _confirmPinController = TextEditingController();
  String? _errorMessage;
  bool _submitting = false;

  @override
  void dispose() {
    _firstPinController.dispose();
    _confirmPinController.dispose();
    super.dispose();
  }

  Future<void> _savePin() async {
    final firstPin = _firstPinController.text.trim();
    final confirmPin = _confirmPinController.text.trim();

    if (firstPin.length != 6 || confirmPin.length != 6) {
      setState(() => _errorMessage = 'Use exactly 6 digits for quick unlock.');
      return;
    }
    if (firstPin != confirmPin) {
      setState(() => _errorMessage = 'Those PINs do not match.');
      return;
    }

    setState(() {
      _submitting = true;
      _errorMessage = null;
    });

    await widget.storageService.saveQuickUnlockPin(firstPin);
    if (!mounted) {
      return;
    }
    Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.deepNavy,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Set up quick unlock',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 22,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              widget.rememberedLogin == null
                  ? 'Create a 6-digit quick PIN so this device can show your returning-user login card next time.'
                  : 'Create a 6-digit quick PIN for ${widget.rememberedLogin!.displayName}. Next time you can unlock with your PIN, Face ID, fingerprint, or device pattern.',
              style: const TextStyle(color: Colors.white70, height: 1.5),
            ),
            const SizedBox(height: 20),
            _GlassField(
              controller: _firstPinController,
              label: '6-Digit PIN',
              hint: 'Create quick PIN',
              icon: Icons.pin_outlined,
              keyboardType: TextInputType.number,
              obscureText: true,
            ),
            const SizedBox(height: 14),
            _GlassField(
              controller: _confirmPinController,
              label: 'Confirm PIN',
              hint: 'Enter PIN again',
              icon: Icons.verified_user_outlined,
              keyboardType: TextInputType.number,
              obscureText: true,
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 14),
              Text(
                _errorMessage!,
                style: const TextStyle(
                  color: Color(0xFFFF8E8E),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            const SizedBox(height: 22),
            Row(
              children: [
                TextButton(
                  onPressed: _submitting
                      ? null
                      : () => Navigator.of(context).pop(false),
                  child: const Text('Later'),
                ),
                const Spacer(),
                ElevatedButton(
                  onPressed: _submitting ? null : _savePin,
                  child: _submitting
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Save Quick PIN'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt_rounded, color: AppColors.neonGold, size: 18),
          const SizedBox(width: 8),
          Text(
            '$label: $value',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _GlassField extends StatelessWidget {
  const _GlassField({
    required this.controller,
    required this.label,
    required this.hint,
    required this.icon,
    this.focusNode,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.textInputAction,
    this.onSubmitted,
    this.suffixIcon,
  });

  final TextEditingController controller;
  final FocusNode? focusNode;
  final String label;
  final String hint;
  final IconData icon;
  final TextInputType keyboardType;
  final bool obscureText;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;
  final Widget? suffixIcon;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.glassEffect,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white12),
          ),
          child: TextField(
            controller: controller,
            focusNode: focusNode,
            keyboardType: keyboardType,
            obscureText: obscureText,
            textInputAction: textInputAction,
            onSubmitted: onSubmitted,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              labelText: label,
              hintText: hint,
              labelStyle: const TextStyle(color: Colors.white70),
              hintStyle: const TextStyle(color: Colors.white38),
              prefixIcon: Icon(icon, color: AppColors.neonGold),
              suffixIcon: suffixIcon,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 18,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
