import 'dart:convert';
import 'dart:math';

import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/user_provider.dart';

class LivenessVerificationScreen extends StatefulWidget {
  const LivenessVerificationScreen({super.key});

  @override
  State<LivenessVerificationScreen> createState() =>
      _LivenessVerificationScreenState();
}

class _LivenessVerificationScreenState
    extends State<LivenessVerificationScreen> {
  CameraController? _controller;
  String _prompt = 'Blink';
  bool _loading = true;
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _prompt = Random.secure().nextBool() ? 'Blink' : 'Smile';
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() {
          _loading = false;
          _error = 'No camera found on this device.';
        });
        return;
      }
      final frontCamera = cameras.firstWhere(
        (camera) => camera.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );
      final controller = CameraController(frontCamera, ResolutionPreset.medium);
      await controller.initialize();
      if (!mounted) {
        await controller.dispose();
        return;
      }
      setState(() {
        _controller = controller;
        _loading = false;
      });
    } catch (error) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Camera unavailable. Please check permissions.';
        });
      }
    }
  }

  Future<void> _captureAndSubmit() async {
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized) {
      return;
    }

    setState(() => _submitting = true);
    try {
      final image = await controller.takePicture();
      final bytes = await image.readAsBytes();
      final response = await BR9ApiClient.instance.post(
        '/api/kyc/liveness',
        data: {
          'prompt': _prompt.toLowerCase(),
          'imageBase64': base64Encode(bytes),
        },
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      final verified = data['isLivenessVerified'] == true;
      if (mounted) {
        context.read<UserProvider>().setLivenessVerified(verified);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              verified ? 'Liveness verified.' : 'Liveness submitted.',
            ),
          ),
        );
        Navigator.of(context).pop();
      }
    } on BR9ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Liveness Check'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              'Please $_prompt',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 30,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'Center your face in the guide. This prepares the account for SmileID validation.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(28),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (_loading)
                      const Center(
                        child: CircularProgressIndicator(
                          color: AppColors.neonGold,
                        ),
                      )
                    else if (_error != null)
                      Center(
                        child: Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white70),
                        ),
                      )
                    else if (controller != null &&
                        controller.value.isInitialized)
                      CameraPreview(controller),
                    Center(
                      child: Container(
                        width: 240,
                        height: 320,
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: AppColors.neonGold,
                            width: 3,
                          ),
                          borderRadius: BorderRadius.circular(140),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _submitting || _error != null
                    ? null
                    : _captureAndSubmit,
                icon: const Icon(Icons.camera_alt_rounded),
                label: Text(_submitting ? 'Submitting...' : 'Capture & Verify'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
