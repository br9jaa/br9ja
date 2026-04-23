import 'dart:io';

Future<bool> hasFirebasePlatformConfig() async {
  if (const bool.fromEnvironment('FIREBASE_CONFIGURED')) {
    return true;
  }

  if (Platform.isAndroid) {
    return File('android/app/google-services.json').existsSync();
  }

  if (Platform.isIOS || Platform.isMacOS) {
    return File('ios/Runner/GoogleService-Info.plist').existsSync() ||
        File('macos/Runner/GoogleService-Info.plist').existsSync();
  }

  return false;
}
