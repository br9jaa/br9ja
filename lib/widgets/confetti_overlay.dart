import 'dart:math' as math;

import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';

class ConfettiOverlay extends StatefulWidget {
  const ConfettiOverlay({
    super.key,
    required this.child,
    required this.play,
    this.goldRain = false,
  });

  final Widget child;
  final bool play;
  final bool goldRain;

  @override
  State<ConfettiOverlay> createState() => _ConfettiOverlayState();
}

class _ConfettiOverlayState extends State<ConfettiOverlay> {
  late final ConfettiController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ConfettiController(duration: const Duration(seconds: 2));
  }

  @override
  void didUpdateWidget(covariant ConfettiOverlay oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.play && !oldWidget.play) {
      _controller.play();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.goldRain) {
      return Stack(
        children: [
          widget.child,
          Positioned(
            top: -16,
            left: 0,
            right: 0,
            child: IgnorePointer(
              child: ConfettiWidget(
                confettiController: _controller,
                blastDirection: math.pi / 2,
                blastDirectionality: BlastDirectionality.directional,
                gravity: 0.18,
                emissionFrequency: 0.14,
                numberOfParticles: 14,
                maxBlastForce: 7,
                minBlastForce: 3,
                shouldLoop: false,
                colors: const [
                  Color(0xFFFFD700),
                  Color(0xFFD4AF37),
                  Color(0xFFFFE28A),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return Stack(
      alignment: Alignment.topCenter,
      children: [
        widget.child,
        ConfettiWidget(
          confettiController: _controller,
          blastDirectionality: BlastDirectionality.explosive,
          emissionFrequency: 0.08,
          numberOfParticles: 18,
          colors: const [
            Color(0xFFFFD700),
            Color(0xFFD4AF37),
            Color(0xFFFFFFFF),
          ],
        ),
      ],
    );
  }
}
