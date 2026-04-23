import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/api/br9_api_client.dart';
import 'core/services/firebase_service.dart';
import 'core/theme/br9_theme.dart';
import 'dashboard.dart';
import 'logic/auth_provider.dart';
import 'providers/user_provider.dart';
import 'screens/auth_gate.dart';
import 'screens/login_page.dart';
import 'screens/qr_scanner_page.dart';
import 'screens/signup_page.dart';
import 'screens/support_chat.dart';
import 'services/kyc_verification_page.dart';
import 'services/profile_page.dart';
import 'widgets/global_error_boundary.dart';
import 'widgets/responsive_layout.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  unawaited(FirebaseService.initializeIfConfigured());
  runApp(const BayrightRoot());
}

class BayrightRoot extends StatelessWidget {
  const BayrightRoot({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..tryAutoLogin()),
        ChangeNotifierProxyProvider<AuthProvider, UserProvider>(
          create: (_) => UserProvider(),
          update: (_, authProvider, userProvider) {
            final nextProvider = userProvider ?? UserProvider();
            nextProvider.syncSession(authProvider);
            return nextProvider;
          },
        ),
      ],
      child: const GlobalErrorBoundary(child: BayrightApp()),
    );
  }
}

class BayrightApp extends StatefulWidget {
  const BayrightApp({super.key});

  @override
  State<BayrightApp> createState() => _BayrightAppState();
}

class _BayrightAppState extends State<BayrightApp> with WidgetsBindingObserver {
  DateTime? _pausedAt;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused) {
      _pausedAt = DateTime.now();
    }

    if (state == AppLifecycleState.resumed && _pausedAt != null) {
      final elapsed = DateTime.now().difference(_pausedAt!);
      if (elapsed > const Duration(minutes: 3)) {
        unawaited(context.read<AuthProvider>().logout());
        context.read<UserProvider>().logout();
        BR9ApiClient.navigatorKey.currentState?.pushNamedAndRemoveUntil(
          '/login',
          (_) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Bayright9ja',
      navigatorKey: BR9ApiClient.navigatorKey,
      theme: BR9Theme.darkTheme,
      builder: (context, child) {
        final content = child ?? const SizedBox.shrink();
        if (!kIsWeb) {
          return content;
        }
        return ResponsiveLayout(child: content);
      },
      routes: {
        '/login': (context) => const LoginPage(),
        '/signup': (context) => const SignupPage(),
        '/dashboard': (context) => const DashboardScreen(),
        '/kyc': (context) => const KycVerificationPage(),
        '/profile': (context) => const ProfilePage(),
        '/support': (context) => const SupportChatPage(),
        '/qr-login': (context) => const QrScannerPage(),
      },
      home: const AuthGate(),
    );
  }
}
