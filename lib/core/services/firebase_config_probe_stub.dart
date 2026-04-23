Future<bool> hasFirebasePlatformConfig() async {
  return const bool.fromEnvironment('FIREBASE_CONFIGURED') ||
      const bool.fromEnvironment('FIREBASE_WEB_CONFIGURED');
}
