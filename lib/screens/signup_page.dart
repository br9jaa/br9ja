import 'dart:ui';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../logic/auth_provider.dart';
import '../widgets/br9ja_snackbar.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _smsCodeController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _pinController = TextEditingController();
  final FocusNode _fullNameFocusNode = FocusNode();
  final FocusNode _usernameFocusNode = FocusNode();
  final FocusNode _phoneFocusNode = FocusNode();
  final FocusNode _smsCodeFocusNode = FocusNode();
  final FocusNode _emailFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();
  final FocusNode _pinFocusNode = FocusNode();

  bool _agreedToTerms = false;
  bool _smsRequested = false;
  bool _sendingCode = false;
  bool _verifyingCode = false;
  bool _phoneVerified = false;
  String? _phoneVerificationToken;
  String _verifiedPhoneNumber = '';
  String? _devVerificationCode;

  bool get _isBusy => _sendingCode || _verifyingCode;

  @override
  void initState() {
    super.initState();
    _phoneController.addListener(_resetVerificationIfPhoneChanges);
  }

  @override
  void dispose() {
    _phoneController.removeListener(_resetVerificationIfPhoneChanges);
    _fullNameController.dispose();
    _usernameController.dispose();
    _phoneController.dispose();
    _smsCodeController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _pinController.dispose();
    _fullNameFocusNode.dispose();
    _usernameFocusNode.dispose();
    _phoneFocusNode.dispose();
    _smsCodeFocusNode.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    _pinFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final readyToCreate =
        _agreedToTerms && _phoneVerified && !authProvider.isLoading;

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        backgroundColor: AppColors.deepNavy,
        title: const Text(
          'Create Account',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Join Bayright9ja',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Verify your phone by SMS, choose a BR9 username, set a password for first login, and create a 6-digit quick PIN for secure returns.',
                    style: TextStyle(color: Colors.white70, height: 1.45),
                  ),
                  const SizedBox(height: 28),
                  _GlassField(
                    controller: _fullNameController,
                    focusNode: _fullNameFocusNode,
                    label: 'Full Name',
                    hint: 'Enter your full name',
                    icon: Icons.person_outline_rounded,
                    textInputAction: TextInputAction.next,
                    onSubmitted: (_) => _usernameFocusNode.requestFocus(),
                    successWhen: (value) => value.trim().length >= 3,
                  ),
                  const SizedBox(height: 16),
                  _GlassField(
                    controller: _usernameController,
                    focusNode: _usernameFocusNode,
                    label: 'Username',
                    hint: 'Choose your BR9 handle',
                    helperText:
                        'We highlight this username or your email automatically on future quick logins.',
                    icon: Icons.alternate_email_rounded,
                    textInputAction: TextInputAction.next,
                    onSubmitted: (_) => _phoneFocusNode.requestFocus(),
                    successWhen: (value) => value.trim().length >= 4,
                  ),
                  const SizedBox(height: 16),
                  _GlassField(
                    controller: _phoneController,
                    focusNode: _phoneFocusNode,
                    label: 'Enter Phone Number',
                    hint: '+234 801 234 5678',
                    helperText:
                        'We send a one-time SMS code here before signup completes.',
                    icon: Icons.phone_android_rounded,
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.next,
                    onSubmitted: (_) {
                      if (_smsRequested && !_phoneVerified) {
                        _smsCodeFocusNode.requestFocus();
                      } else {
                        _emailFocusNode.requestFocus();
                      }
                    },
                    successWhen: (value) => _normalisePhone(value).length >= 10,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _StatusPill(
                          label: _phoneVerified
                              ? 'SMS Verified'
                              : _smsRequested
                              ? 'Verification Pending'
                              : 'SMS Required',
                          tone: _phoneVerified
                              ? AppColors.success
                              : AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: _isBusy ? null : _sendSmsCode,
                          icon: Icon(
                            _phoneVerified
                                ? Icons.restart_alt_rounded
                                : Icons.sms_rounded,
                          ),
                          label: Text(
                            _phoneVerified ? 'Resend Code' : 'Send SMS Code',
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (_smsRequested) ...[
                    const SizedBox(height: 16),
                    _GlassField(
                      controller: _smsCodeController,
                      focusNode: _smsCodeFocusNode,
                      label: 'SMS Verification Code',
                      hint: 'Enter the 6-digit code',
                      helperText: _devVerificationCode == null
                          ? 'We text this code to your phone number.'
                          : 'Local dev code: $_devVerificationCode',
                      icon: Icons.mark_chat_read_outlined,
                      keyboardType: TextInputType.number,
                      textInputAction: TextInputAction.next,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(6),
                      ],
                      onSubmitted: (_) => _verifySmsCode(),
                      successWhen: (value) => value.trim().length == 6,
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _verifyingCode ? null : _verifySmsCode,
                        icon: _verifyingCode
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.verified_rounded),
                        label: Text(
                          _verifyingCode
                              ? 'Verifying...'
                              : 'Verify Phone Number',
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  _GlassField(
                    controller: _emailController,
                    focusNode: _emailFocusNode,
                    label: 'Email',
                    hint: 'Enter your email address',
                    helperText:
                        'We use this for secure login, receipts, and recovery.',
                    icon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    onSubmitted: (_) => _passwordFocusNode.requestFocus(),
                    successWhen: (value) => value.contains('@'),
                  ),
                  const SizedBox(height: 16),
                  _GlassField(
                    controller: _passwordController,
                    focusNode: _passwordFocusNode,
                    label: 'Password',
                    hint: 'Create your password',
                    helperText:
                        'Use this for your first login before quick unlock takes over.',
                    icon: Icons.password_rounded,
                    keyboardType: TextInputType.visiblePassword,
                    obscureText: true,
                    textInputAction: TextInputAction.next,
                    onSubmitted: (_) => _pinFocusNode.requestFocus(),
                    successWhen: (value) => value.trim().length >= 8,
                  ),
                  const SizedBox(height: 16),
                  _GlassField(
                    controller: _pinController,
                    focusNode: _pinFocusNode,
                    label: '6-Digit BR9 PIN',
                    hint: 'Create your 6-digit PIN',
                    helperText:
                        'You can use this quick PIN with your highlighted username or email on returning logins.',
                    icon: Icons.lock_outline_rounded,
                    keyboardType: TextInputType.number,
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(6),
                    ],
                    successWhen: (value) => value.trim().length == 6,
                  ),
                  const SizedBox(height: 18),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0A223D),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Checkbox(
                          value: _agreedToTerms,
                          fillColor: WidgetStateProperty.resolveWith((states) {
                            if (states.contains(WidgetState.selected)) {
                              return AppColors.neonGold;
                            }
                            return Colors.transparent;
                          }),
                          checkColor: AppColors.deepNavy,
                          side: const BorderSide(color: Colors.white38),
                          onChanged: (value) {
                            setState(() => _agreedToTerms = value ?? false);
                          },
                        ),
                        const Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(top: 12),
                            child: Text(
                              'I agree to the Terms, KYC Policy, and SMS verification flow.',
                              style: TextStyle(
                                color: Colors.white70,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!_phoneVerified) ...[
                    const SizedBox(height: 14),
                    const Text(
                      'Phone verification must be completed before account creation.',
                      style: TextStyle(color: Colors.white60),
                    ),
                  ],
                  if ((authProvider.errorMessage ?? '').isNotEmpty) ...[
                    const SizedBox(height: 14),
                    Text(
                      authProvider.errorMessage!,
                      style: const TextStyle(
                        color: Colors.redAccent,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: readyToCreate ? _createAccount : null,
                      child: authProvider.isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text(
                              'Create Account',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _resetVerificationIfPhoneChanges() {
    final currentPhone = _normalisePhone(_phoneController.text);
    if (currentPhone == _verifiedPhoneNumber) {
      return;
    }

    if (_phoneVerified ||
        _phoneVerificationToken != null ||
        _devVerificationCode != null) {
      setState(() {
        _phoneVerified = false;
        _phoneVerificationToken = null;
        _verifiedPhoneNumber = '';
        _devVerificationCode = null;
      });
    }
  }

  String _normalisePhone(String value) {
    return value.replaceAll(RegExp(r'\D'), '');
  }

  Future<void> _sendSmsCode() async {
    final phoneNumber = _normalisePhone(_phoneController.text);
    if (phoneNumber.length < 10) {
      Br9jaSnackBar.show(
        context,
        message:
            'Enter a valid phone number before requesting SMS verification.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    setState(() {
      _sendingCode = true;
      _smsRequested = true;
      _phoneVerified = false;
      _phoneVerificationToken = null;
      _verifiedPhoneNumber = '';
    });

    final authProvider = context.read<AuthProvider>();
    final data = await authProvider.sendPhoneVerificationCode(phoneNumber);

    if (!mounted) {
      return;
    }

    setState(() {
      _sendingCode = false;
      _devVerificationCode = data?['devCode']?.toString();
    });

    if (data == null) {
      Br9jaSnackBar.show(
        context,
        message:
            authProvider.errorMessage ??
            'We could not send your SMS code right now.',
        icon: Icons.error_outline_rounded,
      );
      return;
    }

    _smsCodeFocusNode.requestFocus();
    Br9jaSnackBar.show(
      context,
      message:
          'Verification code sent to ${data['maskedPhoneNumber'] ?? 'your phone'}.',
      icon: Icons.sms_rounded,
    );
  }

  Future<void> _verifySmsCode() async {
    final phoneNumber = _normalisePhone(_phoneController.text);
    final code = _smsCodeController.text.trim();

    if (code.length != 6) {
      Br9jaSnackBar.show(
        context,
        message: 'Enter the 6-digit SMS verification code.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    setState(() => _verifyingCode = true);
    final authProvider = context.read<AuthProvider>();
    final token = await authProvider.verifyPhoneCode(
      phoneNumber: phoneNumber,
      code: code,
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _verifyingCode = false;
      _phoneVerificationToken = token;
      _phoneVerified = token != null;
      _verifiedPhoneNumber = token == null ? '' : phoneNumber;
    });

    if (token == null) {
      Br9jaSnackBar.show(
        context,
        message:
            authProvider.errorMessage ?? 'That verification code did not work.',
        icon: Icons.error_outline_rounded,
      );
      return;
    }

    _emailFocusNode.requestFocus();
    Br9jaSnackBar.show(
      context,
      message: 'Phone number verified successfully.',
      icon: Icons.verified_rounded,
    );
  }

  Future<void> _createAccount() async {
    if (_fullNameController.text.trim().length < 3) {
      Br9jaSnackBar.show(
        context,
        message: 'Enter your full name to continue.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    if (_usernameController.text.trim().length < 4) {
      Br9jaSnackBar.show(
        context,
        message: 'Choose a BR9 username with at least 4 characters.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    if (!_phoneVerified || _phoneVerificationToken == null) {
      Br9jaSnackBar.show(
        context,
        message:
            'Verify your phone number by SMS before creating your account.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    if (!_emailController.text.contains('@')) {
      Br9jaSnackBar.show(
        context,
        message: 'Enter a valid email address.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    if (_passwordController.text.trim().length < 8) {
      Br9jaSnackBar.show(
        context,
        message: 'Create a password with at least 8 characters.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    if (_pinController.text.trim().length != 6) {
      Br9jaSnackBar.show(
        context,
        message: 'Your BR9 PIN must be exactly 6 digits.',
        icon: Icons.info_outline_rounded,
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final created = await authProvider.register(
      fullName: _fullNameController.text,
      username: _usernameController.text,
      email: _emailController.text,
      phoneNumber: _phoneController.text,
      password: _passwordController.text,
      pin: _pinController.text,
      phoneVerificationToken: _phoneVerificationToken!,
    );

    if (!mounted) {
      return;
    }

    if (!created) {
      Br9jaSnackBar.show(
        context,
        message:
            authProvider.errorMessage ??
            'We could not create your account right now.',
        icon: Icons.error_outline_rounded,
      );
      return;
    }

    Br9jaSnackBar.show(
      context,
      message: 'Your account is ready. Welcome to BR9ja.',
      icon: Icons.check_circle_rounded,
    );
    Navigator.of(context).pushReplacementNamed('/dashboard');
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.tone});

  final String label;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: tone.withValues(alpha: 0.3)),
      ),
      alignment: Alignment.center,
      child: Text(
        label,
        style: TextStyle(color: tone, fontWeight: FontWeight.w700),
      ),
    );
  }
}

class _GlassField extends StatelessWidget {
  const _GlassField({
    required this.controller,
    this.focusNode,
    required this.label,
    required this.hint,
    this.helperText,
    required this.icon,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.textInputAction,
    this.onSubmitted,
    this.inputFormatters,
    this.successWhen,
  });

  final TextEditingController controller;
  final FocusNode? focusNode;
  final String label;
  final String hint;
  final String? helperText;
  final IconData icon;
  final TextInputType keyboardType;
  final bool obscureText;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;
  final List<TextInputFormatter>? inputFormatters;
  final bool Function(String)? successWhen;

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
          child: ValueListenableBuilder<TextEditingValue>(
            valueListenable: controller,
            builder: (context, value, _) {
              final showSuccess = successWhen?.call(value.text) ?? false;

              return TextField(
                controller: controller,
                focusNode: focusNode,
                keyboardType: keyboardType,
                obscureText: obscureText,
                textInputAction: textInputAction,
                onSubmitted: onSubmitted,
                inputFormatters: inputFormatters,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: label,
                  hintText: hint,
                  helperText: helperText,
                  labelStyle: const TextStyle(color: Colors.white70),
                  hintStyle: const TextStyle(color: Colors.white38),
                  helperStyle: const TextStyle(color: Colors.white54),
                  prefixIcon: Icon(icon, color: AppColors.neonGold),
                  suffixIcon: showSuccess
                      ? const Icon(
                          Icons.check_circle_rounded,
                          color: AppColors.success,
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 18,
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
