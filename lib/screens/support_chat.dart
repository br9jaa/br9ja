import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

class SupportChatPage extends StatefulWidget {
  const SupportChatPage({super.key});

  @override
  State<SupportChatPage> createState() => _SupportChatPageState();
}

class _SupportChatPageState extends State<SupportChatPage> {
  final TextEditingController _controller = TextEditingController();
  final List<_ChatMessage> _messages = [
    const _ChatMessage(
      sender: 'Bayright Bot',
      text: 'Hi, I can help with Solar token questions and Transfer delays.',
      isBot: true,
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) {
      return;
    }

    setState(() {
      _messages.add(_ChatMessage(sender: 'You', text: text, isBot: false));
      _messages.add(
        _ChatMessage(
          sender: 'Bayright Bot',
          text: _replyFor(text),
          isBot: true,
        ),
      );
      _controller.clear();
    });
  }

  String _replyFor(String input) {
    final lowered = input.toLowerCase();
    if (lowered.contains('solar')) {
      return 'Solar tokens usually reflect within 2-5 minutes. If your meter is still not updated, confirm the provider and meter number before retrying.';
    }
    if (lowered.contains('delay') || lowered.contains('transfer')) {
      return 'Internal transfers are instant most of the time. If delayed, we recommend checking the recipient phone/tag and waiting a few minutes for settlement refresh.';
    }
    return 'I can help with Solar tokens and Transfer delays right now. Try asking: "Why is my transfer delayed?"';
  }

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
        title: const Text('Bayright Bot'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return Align(
                  alignment: message.isBot
                      ? Alignment.centerLeft
                      : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    constraints: const BoxConstraints(maxWidth: 300),
                    decoration: BoxDecoration(
                      color: message.isBot
                          ? const Color(0xFF0A223D)
                          : AppColors.neonGold.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: message.isBot
                            ? Colors.white10
                            : AppColors.neonGold,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          message.sender,
                          style: TextStyle(
                            color: message.isBot
                                ? AppColors.neonGold
                                : Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          message.text,
                          style: const TextStyle(
                            color: Colors.white,
                            height: 1.45,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          SafeArea(
            minimum: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Ask Bayright Bot...',
                      hintStyle: const TextStyle(color: Colors.white54),
                      filled: true,
                      fillColor: const Color(0xFF0A223D),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(18),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  height: 54,
                  child: ElevatedButton(
                    onPressed: _sendMessage,
                    child: const Text('Send'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  final String sender;
  final String text;
  final bool isBot;

  const _ChatMessage({
    required this.sender,
    required this.text,
    required this.isBot,
  });
}
