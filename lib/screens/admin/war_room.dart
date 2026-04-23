import 'dart:math';

import 'package:bayright9ja_mobile/core/api/br9_api_client.dart';
import 'package:bayright9ja_mobile/core/theme/br9_theme.dart';
import 'package:flutter/material.dart';

class WarRoomScreen extends StatefulWidget {
  const WarRoomScreen({super.key});

  @override
  State<WarRoomScreen> createState() => _WarRoomScreenState();
}

class _WarRoomScreenState extends State<WarRoomScreen> {
  final _freezeUserController = TextEditingController();
  final _bookingController = TextEditingController();
  final _goldRateController = TextEditingController();

  List<Map<String, dynamic>> _activeUsers = [];
  String _liveCode = '';
  int _winnerCount = 0;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final response = await BR9ApiClient.instance.get('/api/admin/live-stats');
      final rateResponse = await BR9ApiClient.instance.get(
        '/api/admin/gold-rate',
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      final rateData = rateResponse['data'] as Map<String, dynamic>? ?? {};
      if (mounted) {
        setState(() {
          _liveCode = (data['liveCode'] ?? '').toString();
          _winnerCount = (data['winnerCount'] as num?)?.toInt() ?? 0;
          _goldRateController.text =
              ((rateData['goldToNairaRatio'] as num?)?.toDouble() ?? 0.1)
                  .toString();
          final users = data['activeUsers'];
          _activeUsers = users is List
              ? users.whereType<Map<String, dynamic>>().toList(growable: false)
              : <Map<String, dynamic>>[];
        });
      }
    } catch (_) {
      // Admin-only surface: errors are shown by protected API flows elsewhere.
    }
  }

  @override
  void dispose() {
    _freezeUserController.dispose();
    _bookingController.dispose();
    _goldRateController.dispose();
    super.dispose();
  }

  Future<void> _pushLiveCode() async {
    setState(() => _loading = true);
    try {
      final code = (1000 + Random.secure().nextInt(9000)).toString();
      final response = await BR9ApiClient.instance.post(
        '/api/admin/trigger-live-event',
        data: {
          'liveCode': code,
          'currentQuestion': 'Fastest finger: enter code $code now!',
          'rewardPool': 25000,
        },
      );
      final data = response['data'] as Map<String, dynamic>? ?? {};
      if (mounted) {
        setState(() {
          _liveCode = (data['liveCode'] ?? code).toString();
          _winnerCount = 0;
        });
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _endSession() async {
    await BR9ApiClient.instance.post('/api/admin/end-live-session');
    if (mounted) {
      setState(() {
        _liveCode = '';
        _winnerCount = 0;
      });
    }
  }

  Future<void> _freezeUser({required bool freeze}) async {
    final userId = _freezeUserController.text.trim();
    if (userId.isEmpty) {
      return;
    }

    await BR9ApiClient.instance.request(
      'PATCH',
      '/api/admin/users/$userId/freeze',
      data: {'freeze': freeze, 'reason': freeze ? 'Admin fraud review' : ''},
    );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(freeze ? 'Account frozen.' : 'Account unfrozen.'),
        ),
      );
    }
  }

  Future<void> _verifyTransportBooking() async {
    final bookingId = _bookingController.text.trim();
    if (bookingId.isEmpty) {
      return;
    }

    await BR9ApiClient.instance.request(
      'PATCH',
      '/api/admin/transport-bookings/$bookingId/fulfill',
      data: {'status': 'fulfilled'},
    );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Transport booking marked fulfilled.')),
      );
    }
  }

  Future<void> _updateGoldRate() async {
    final ratio = double.tryParse(_goldRateController.text.trim());
    if (ratio == null || ratio <= 0) {
      return;
    }

    await BR9ApiClient.instance.request(
      'PATCH',
      '/api/admin/gold-rate',
      data: {'goldToNairaRatio': ratio},
    );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('BR9 Gold-to-Naira rate updated.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.deepNavy,
      appBar: AppBar(
        title: const Text('Admin War Room'),
        backgroundColor: AppColors.deepNavy,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchStats,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            FilledButton(
              onPressed: _loading ? null : _pushLiveCode,
              style: FilledButton.styleFrom(
                backgroundColor: Colors.redAccent,
                padding: const EdgeInsets.symmetric(vertical: 22),
              ),
              child: Text(_loading ? 'PUSHING...' : 'PUSH LIVE CODE'),
            ),
            const SizedBox(height: 18),
            _StatCard(
              label: 'Current Code',
              value: _liveCode.isEmpty ? 'OFF' : _liveCode,
            ),
            _StatCard(
              label: 'Successful Entries',
              value: _winnerCount.toString(),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _endSession,
              icon: const Icon(Icons.lock_clock_rounded),
              label: const Text('End Live Session & Freeze Week'),
            ),
            const SizedBox(height: 24),
            const Text(
              'God-Mode Controls',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _freezeUserController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'User ID to Freeze / Unfreeze',
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _freezeUser(freeze: true),
                    child: const Text('Freeze Account'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _freezeUser(freeze: false),
                    child: const Text('Unfreeze Account'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _bookingController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Transport Booking ID',
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _verifyTransportBooking,
              icon: const Icon(Icons.verified_rounded),
              label: const Text('Manually Verify Transport Booking'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _goldRateController,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'BR9 Gold-to-Naira Ratio',
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _updateGoldRate,
              icon: const Icon(Icons.tune_rounded),
              label: const Text('Update BR9 Gold Rate'),
            ),
            const SizedBox(height: 24),
            const Text(
              'Top Active Users',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 12),
            for (final user in _activeUsers.take(10))
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(
                  (user['fullName'] ?? '').toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                subtitle: Text(
                  (user['bayrightTag'] ?? '').toString(),
                  style: const TextStyle(color: Colors.white70),
                ),
                trailing: Text(
                  '${user['br9GoldPoints'] ?? 0} GOLD',
                  style: const TextStyle(color: AppColors.neonGold),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF0A223D),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: [
          Text(label, style: const TextStyle(color: Colors.white70)),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.neonGold,
              fontSize: 24,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
