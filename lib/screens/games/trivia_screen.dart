import 'dart:async';

import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../providers/user_provider.dart';
import '../../services/notification_service.dart';

class TriviaScreen extends StatefulWidget {
  const TriviaScreen({super.key});

  @override
  State<TriviaScreen> createState() => _TriviaScreenState();
}

class _TriviaScreenState extends State<TriviaScreen> {
  List<Map<String, dynamic>> _questions = [];
  int _index = 0;
  int _secondsLeft = 10;
  bool _loading = true;
  bool _roundTwoUnlocked = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadQuestions() async {
    try {
      final response = await BR9ApiClient.instance.fetchTriviaQuestions();
      final data = response['data'];
      if (mounted) {
        setState(() {
          _questions = data is List
              ? data.whereType<Map<String, dynamic>>().toList(growable: false)
              : <Map<String, dynamic>>[];
          _loading = false;
        });
        _startTimer();
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _secondsLeft = 10);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft <= 1) {
        timer.cancel();
        _nextQuestion();
      } else if (mounted) {
        setState(() => _secondsLeft -= 1);
      }
    });
  }

  void _nextQuestion() {
    if (!mounted || _questions.isEmpty) {
      return;
    }
    if (_index >= _questions.length - 1) {
      setState(() => _index = 0);
    } else {
      setState(() => _index += 1);
    }
    _startTimer();
  }

  Future<void> _answer(int optionIndex) async {
    _timer?.cancel();
    final question = _questions[_index];
    try {
      final response = await BR9ApiClient.instance.submitTriviaAnswer(
        questionId: (question['id'] ?? '').toString(),
        selectedOptionIndex: optionIndex,
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      final points = data['br9GoldPoints'];
      if (points is num && mounted) {
        context.read<UserProvider>().setGoldPoints(points.toInt());
      }
      if (data['correct'] == true) {
        await NotificationService.celebrateWin();
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              data['correct'] == true
                  ? 'Correct! BR9 Gold awarded.'
                  : 'Not this one.',
            ),
          ),
        );
      }
    } finally {
      _nextQuestion();
    }
  }

  Future<void> _unlockRoundTwo() async {
    await Share.share(
      'I am playing Trivia Rush on BR9ja. Come win BR9 Gold with me!',
    );
    if (mounted) {
      setState(() => _roundTwoUnlocked = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions.isEmpty ? null : _questions[_index];
    final options = (question?['options'] ?? []) as List<dynamic>;

    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Trivia Rush'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.neonGold),
            )
          : question == null
          ? const Center(
              child: Text(
                'No trivia questions yet.',
                style: TextStyle(color: Colors.white70),
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                LinearProgressIndicator(
                  value: _secondsLeft / 10,
                  color: AppColors.neonGold,
                  backgroundColor: Colors.white12,
                ),
                const SizedBox(height: 16),
                Text(
                  '$_secondsLeft seconds',
                  style: const TextStyle(
                    color: AppColors.neonGold,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  (question['question'] ?? '').toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 18),
                for (var i = 0; i < options.length; i += 1)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: OutlinedButton(
                      onPressed: () => _answer(i),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text(options[i].toString()),
                      ),
                    ),
                  ),
                const SizedBox(height: 22),
                if (!_roundTwoUnlocked)
                  FilledButton.icon(
                    onPressed: _unlockRoundTwo,
                    icon: const Icon(Icons.share_rounded),
                    label: const Text(
                      'Share to WhatsApp Status to Unlock Round 2',
                    ),
                  )
                else
                  const Text(
                    'Round 2 unlocked.',
                    style: TextStyle(
                      color: AppColors.neonGold,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
              ],
            ),
    );
  }
}
