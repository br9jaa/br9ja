import 'package:flutter/material.dart';

import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';

class NotificationPage extends StatelessWidget {
  const NotificationPage({super.key});

  @override
  Widget build(BuildContext context) {
    final mockNotifs = [
      {
        'title': 'System Upgrade',
        'body': 'IKEDC payments are now 2x faster.',
        'time': '2 mins ago',
      },
      {
        'title': 'Data Promo',
        'body': 'Get 10% extra on SME data tonight!',
        'time': '1 hour ago',
      },
      {
        'title': 'Welcome to BR9',
        'body': 'Your account is active. Start paying bills seamlessly.',
        'time': 'Yesterday',
      },
    ];

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
        title: const Text('Notifications'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: mockNotifs.length,
        itemBuilder: (context, index) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0A223D),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  backgroundColor: Color(0xFF12345A),
                  child: Icon(
                    Icons.notifications_active,
                    color: AppColors.neonGold,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        mockNotifs[index]['title']!,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        mockNotifs[index]['body']!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  mockNotifs[index]['time']!,
                  style: const TextStyle(fontSize: 10, color: Colors.white60),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
