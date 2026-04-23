import 'dart:ui';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

class KycVerificationPage extends StatelessWidget {
  const KycVerificationPage({super.key});

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
        title: const Text('KYC Verification'),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(20, 0, 20, 20),
        child: SizedBox(
          height: 56,
          child: ElevatedButton(
            onPressed: () {},
            child: const Text('Submit for Review'),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _ProgressTracker(),
            const SizedBox(height: 24),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0A223D),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.glassEffect),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Upgrade to Tier 2',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Provide a valid ID, selfie, and BVN/NIN so larger transactions can be processed smoothly.',
                    style: TextStyle(color: Colors.white70, height: 1.45),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const _UploadGlassBox(
              title: 'Upload Front of ID',
              subtitle: 'Driver\'s License, NIN Slip, Voter Card, or Passport',
              icon: Icons.badge_rounded,
            ),
            const SizedBox(height: 16),
            const _UploadGlassBox(
              title: 'Take a Selfie',
              subtitle: 'Make sure your face is clear and well lit',
              icon: Icons.camera_alt_rounded,
            ),
            const SizedBox(height: 16),
            const _SecureInputCard(),
            const SizedBox(height: 96),
          ],
        ),
      ),
    );
  }
}

class _ProgressTracker extends StatelessWidget {
  const _ProgressTracker();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        Expanded(
          child: _StepItem(
            number: '1',
            title: 'Personal Info',
            isCompleted: true,
          ),
        ),
        SizedBox(width: 10),
        Expanded(
          child: _StepItem(number: '2', title: 'ID Upload', isActive: true),
        ),
        SizedBox(width: 10),
        Expanded(
          child: _StepItem(number: '3', title: 'Final Review'),
        ),
      ],
    );
  }
}

class _StepItem extends StatelessWidget {
  final String number;
  final String title;
  final bool isActive;
  final bool isCompleted;

  const _StepItem({
    required this.number,
    required this.title,
    this.isActive = false,
    this.isCompleted = false,
  });

  @override
  Widget build(BuildContext context) {
    final highlight = isActive || isCompleted;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: highlight ? AppColors.neonGold : Colors.white10,
        ),
      ),
      child: Column(
        children: [
          Container(
            height: 30,
            width: 30,
            decoration: BoxDecoration(
              color: highlight ? AppColors.neonGold : AppColors.glassEffect,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: TextStyle(
                  color: highlight ? AppColors.deepNavy : Colors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _UploadGlassBox extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;

  const _UploadGlassBox({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.glassEffect,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.neonGold),
          ),
          child: Row(
            children: [
              Container(
                height: 50,
                width: 50,
                decoration: BoxDecoration(
                  color: const Color(0xFF0A223D),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: AppColors.neonGold),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: Colors.white70,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.upload_file_rounded, color: AppColors.neonGold),
            ],
          ),
        ),
      ),
    );
  }
}

class _SecureInputCard extends StatelessWidget {
  const _SecureInputCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: const TextField(
        obscureText: true,
        style: TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: 'BVN / NIN',
          hintText: 'Enter your BVN or NIN securely',
          labelStyle: TextStyle(color: Colors.white70),
          hintStyle: TextStyle(color: Colors.white38),
          prefixIcon: Icon(
            Icons.lock_outline_rounded,
            color: AppColors.neonGold,
          ),
          border: InputBorder.none,
        ),
      ),
    );
  }
}
