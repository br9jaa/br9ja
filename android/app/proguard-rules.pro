# Keep the Flutter plugin registrant reachable when shrinking release builds.
-keep class io.flutter.plugins.GeneratedPluginRegistrant { *; }

# Preserve app classes referenced by the Android entrypoint.
-keep class com.bayright9ja.bayright9ja_mobile.** { *; }
