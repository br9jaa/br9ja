import 'dart:convert';
import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../logic/auth_provider.dart';
import '../providers/user_provider.dart';
import '../screens/auth/liveness_verification_screen.dart';
import '../widgets/br9ja_snackbar.dart';
import '../widgets/security_badge.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final ImagePicker _imagePicker = ImagePicker();
  bool _uploadingPassportPhoto = false;

  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppColors.deepNavy,
        title: const Text(
          'Profile',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF000000),
                  Color(0xFF191300),
                  Color(0xFF000000),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ProfileAvatar(
                      imageDataUrl: userProvider.passportPhotoDataUrl,
                      uploading: _uploadingPassportPhoto,
                      onTap: _pickPassportPhoto,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            userProvider.userName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            userProvider.accountNumber,
                            style: const TextStyle(color: Colors.white70),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            userProvider.email.isEmpty
                                ? userProvider.phoneNumber
                                : userProvider.email,
                            style: const TextStyle(color: Colors.white54),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        userProvider.bankStatus,
                        style: const TextStyle(
                          color: AppColors.success,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                const Text(
                  'Fintech-gaming control center',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    height: 1.08,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Track your bank readiness, gold growth, and streak strength in one place before you move money or play.',
                  style: TextStyle(color: Colors.white70, height: 1.5),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    _MiniChip(
                      icon: Icons.phone_android_rounded,
                      label: userProvider.phoneVerified
                          ? 'Phone Verified'
                          : 'Phone Unverified',
                      tone: userProvider.phoneVerified
                          ? AppColors.success
                          : const Color(0xFFFF8A00),
                    ),
                    _MiniChip(
                      icon: Icons.badge_outlined,
                      label: userProvider.passportPhotoDataUrl.isEmpty
                          ? 'Passport Photo Needed'
                          : 'Passport Photo Uploaded',
                      tone: userProvider.passportPhotoDataUrl.isEmpty
                          ? AppColors.primary
                          : AppColors.success,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _ProfileMetricCard(
                label: 'Bank Status',
                value: userProvider.bankStatus,
                icon: Icons.account_balance_rounded,
                tone: AppColors.success,
              ),
              _ProfileMetricCard(
                label: 'Total BR9 Gold',
                value: '${userProvider.br9GoldPoints}',
                icon: Icons.workspace_premium_rounded,
                tone: AppColors.primary,
              ),
              _ProfileMetricCard(
                label: 'Daily Streak',
                value: '${userProvider.dailyStreak} days',
                icon: Icons.local_fire_department_rounded,
                tone: const Color(0xFFFF8A00),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _SecurityPanel(userProvider: userProvider),
          const SizedBox(height: 18),
          _ProfileActionTile(
            icon: Icons.photo_camera_back_outlined,
            title: 'Upload Passport Photo',
            subtitle: userProvider.passportPhotoDataUrl.isEmpty
                ? 'Add a clear, high-quality headshot to your profile.'
                : 'Replace your current passport photo with a clearer upload.',
            onTap: _pickPassportPhoto,
          ),
          _ProfileActionTile(
            icon: Icons.verified_user_outlined,
            title: 'Complete Liveness Verification',
            subtitle: 'Boost security and unlock your verified bonus.',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) => const LivenessVerificationScreen(),
              ),
            ),
          ),
          _ProfileActionTile(
            icon: Icons.ios_share_rounded,
            title: 'Share My Referral Code',
            subtitle: 'Invite friends into BR9ja with your personal code.',
            onTap: () => _shareReferralCode(context),
          ),
          _ProfileActionTile(
            icon: Icons.help_center_outlined,
            title: 'Support Hub',
            subtitle: 'Talk to support or review your latest help options.',
            onTap: () => Navigator.of(context).pushNamed('/support'),
          ),
          _ProfileActionTile(
            icon: Icons.logout_rounded,
            title: 'Logout',
            subtitle: 'Sign out from this device.',
            destructive: true,
            onTap: () async {
              await context.read<AuthProvider>().logout();
              if (context.mounted) {
                context.read<UserProvider>().logout();
                Navigator.of(
                  context,
                ).pushNamedAndRemoveUntil('/login', (_) => false);
              }
            },
          ),
        ],
      ),
    );
  }

  Future<void> _pickPassportPhoto() async {
    final authProvider = context.read<AuthProvider>();
    final source = await _chooseImageSource();
    if (source == null) {
      return;
    }

    final pickedFile = await _imagePicker.pickImage(
      source: source,
      imageQuality: 95,
      maxWidth: 1600,
      maxHeight: 1600,
      preferredCameraDevice: CameraDevice.front,
    );

    if (pickedFile == null) {
      return;
    }

    final bytes = await pickedFile.readAsBytes();
    final imageDataUrl =
        'data:${_mimeTypeForFile(pickedFile.name)};base64,${base64Encode(bytes)}';

    setState(() => _uploadingPassportPhoto = true);
    try {
      await BR9ApiClient.instance.uploadPassportPhoto(
        imageDataUrl: imageDataUrl,
      );
      await authProvider.refreshProfile();
      if (!mounted) {
        return;
      }
      Br9jaSnackBar.show(
        context,
        message: 'Passport photo uploaded clearly to your profile.',
        icon: Icons.check_circle_rounded,
      );
    } on BR9ApiException catch (error) {
      if (!mounted) {
        return;
      }
      Br9jaSnackBar.show(
        context,
        message: error.message,
        icon: Icons.error_outline_rounded,
      );
    } finally {
      if (mounted) {
        setState(() => _uploadingPassportPhoto = false);
      }
    }
  }

  Future<ImageSource?> _chooseImageSource() async {
    if (kIsWeb) {
      return ImageSource.gallery;
    }

    return showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: const Color(0xFF101010),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Upload Passport Photo',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 14),
                ListTile(
                  leading: const Icon(
                    Icons.photo_library_outlined,
                    color: AppColors.primary,
                  ),
                  title: const Text(
                    'Choose from Gallery',
                    style: TextStyle(color: Colors.white),
                  ),
                  onTap: () => Navigator.of(context).pop(ImageSource.gallery),
                ),
                ListTile(
                  leading: const Icon(
                    Icons.photo_camera_front_outlined,
                    color: AppColors.primary,
                  ),
                  title: const Text(
                    'Take a New Photo',
                    style: TextStyle(color: Colors.white),
                  ),
                  onTap: () => Navigator.of(context).pop(ImageSource.camera),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _mimeTypeForFile(String fileName) {
    final lower = fileName.toLowerCase();
    if (lower.endsWith('.png')) {
      return 'image/png';
    }
    if (lower.endsWith('.webp')) {
      return 'image/webp';
    }
    return 'image/jpeg';
  }

  void _shareReferralCode(BuildContext context) {
    final userProvider = context.read<UserProvider>();
    final code = userProvider.referralCode.isEmpty
        ? 'BR9JA'
        : userProvider.referralCode;
    Share.share(
      'Join me on BR9ja! Play games, pay bills, get paid, and earn BR9 Gold. Use my code: $code',
      subject: 'Join me on BR9ja',
    );
  }
}

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({
    required this.imageDataUrl,
    required this.uploading,
    required this.onTap,
  });

  final String imageDataUrl;
  final bool uploading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final imageBytes = _decodeDataUrl(imageDataUrl);

    return GestureDetector(
      onTap: uploading ? null : onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            height: 76,
            width: 76,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFFE082), AppColors.primary],
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            padding: const EdgeInsets.all(3),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF090909),
                borderRadius: BorderRadius.circular(21),
              ),
              clipBehavior: Clip.antiAlias,
              child: imageBytes == null
                  ? const Icon(
                      Icons.person_rounded,
                      color: Colors.white70,
                      size: 34,
                    )
                  : Image.memory(
                      imageBytes,
                      fit: BoxFit.cover,
                      filterQuality: FilterQuality.high,
                      gaplessPlayback: true,
                    ),
            ),
          ),
          Positioned(
            right: -4,
            bottom: -4,
            child: Container(
              height: 30,
              width: 30,
              decoration: BoxDecoration(
                color: uploading ? Colors.white12 : AppColors.deepNavy,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white10),
              ),
              child: uploading
                  ? const Padding(
                      padding: EdgeInsets.all(7),
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(
                      Icons.camera_alt_rounded,
                      size: 16,
                      color: AppColors.primary,
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Uint8List? _decodeDataUrl(String value) {
    if (value.isEmpty || !value.contains(',')) {
      return null;
    }

    try {
      return base64Decode(value.split(',').last);
    } catch (_) {
      return null;
    }
  }
}

class _MiniChip extends StatelessWidget {
  const _MiniChip({
    required this.icon,
    required this.label,
    required this.tone,
  });

  final IconData icon;
  final String label;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: tone.withValues(alpha: 0.22)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: tone),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(color: tone, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}

class _SecurityPanel extends StatelessWidget {
  const _SecurityPanel({required this.userProvider});

  final UserProvider userProvider;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF101010),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Security Center',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          const SecurityBadge(),
          const SizedBox(height: 14),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Freeze All Transactions',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Switch.adaptive(
                value: userProvider.transactionsFrozen,
                activeThumbColor: AppColors.primary,
                activeTrackColor: AppColors.primary.withValues(alpha: 0.25),
                onChanged: userProvider.setTransactionFreeze,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Daily limit: ₦${userProvider.dailySpendingCap.toStringAsFixed(0)}',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          Slider(
            value: userProvider.dailySpendingCap.clamp(1000, 20000),
            min: 1000,
            max: 20000,
            divisions: 19,
            activeColor: AppColors.primary,
            onChanged: userProvider.setDailySpendingCap,
          ),
          const Text(
            'Use a lower personal cap if you want tighter daily control after a new-device login.',
            style: TextStyle(color: Colors.white70, height: 1.45),
          ),
        ],
      ),
    );
  }
}

class _ProfileMetricCard extends StatelessWidget {
  const _ProfileMetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.tone,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF101010),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: tone.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: tone),
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileActionTile extends StatelessWidget {
  const _ProfileActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.destructive = false,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final tone = destructive ? AppColors.danger : Colors.white;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF101010),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Container(
          height: 42,
          width: 42,
          decoration: BoxDecoration(
            color: tone.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: tone),
        ),
        title: Text(
          title,
          style: TextStyle(color: tone, fontWeight: FontWeight.w800),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(color: Colors.white70, height: 1.35),
        ),
        trailing: const Icon(
          Icons.chevron_right_rounded,
          color: Colors.white70,
        ),
        onTap: onTap,
      ),
    );
  }
}
