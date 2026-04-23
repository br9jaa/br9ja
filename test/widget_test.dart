import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:bayright9ja_mobile/logic/auth_provider.dart';
import 'package:bayright9ja_mobile/main.dart';
import 'package:bayright9ja_mobile/providers/user_provider.dart';

void main() {
  testWidgets('app boots into Bayright shell', (tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => UserProvider()),
        ],
        child: const BayrightApp(),
      ),
    );
    expect(find.byType(BayrightApp), findsOneWidget);
  });
}
