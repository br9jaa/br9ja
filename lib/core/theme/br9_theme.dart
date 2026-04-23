import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFFFD700);
  static const Color neonGold = primary;
  static const Color secondaryBlack = Color(0xFF000000);
  static const Color deepNavy = secondaryBlack;
  static const Color glassEffect = Color(0x1FFFFFFF);
  static const Color digitalBlue = Color(0xFF0056D2);
  static const Color prosperityGreen = Color(0xFF28C76F);
  static const Color success = prosperityGreen;
  static const Color royalGold = Color(0xFFD4AF37);
  static const Color persimmonAction = Color(0xFFEC5800);
  static const Color ghostWhite = Color(0xFFF8FAFC);
  static const Color inkyBlack = Color(0xFF0F172A);
  static const Color slateGrey = Color(0xFF64748B);
  static const Color slateBg = Color(0xFFF1F5F9);
  static const Color cardGrey = Color(0xFF1E293B);
  static const Color electricCyan = Color(0xFF00F2FF);
  static const Color neonAccent = electricCyan;
  static const Color brandDeep = Color(0xFF0F172A);
  static const Color brandCard = Color(0xFF1E293B);
  static const Color danger = Color(0xFFFF6B6B);
  static const double radius = 16;

  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF000000), Color(0xFF101010)],
  );

  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFFE082), Color(0xFFFFD700)],
  );

  static const LinearGradient afroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF130B02), Color(0xFF2A1B09), Color(0xFF000000)],
  );

  static const LinearGradient neonGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFFE082), Color(0xFFFFD700)],
  );
}

class BR9Theme {
  static ThemeData get darkTheme {
    final base = ThemeData.dark(useMaterial3: true);

    return base.copyWith(
      scaffoldBackgroundColor: AppColors.deepNavy,
      colorScheme: base.colorScheme.copyWith(
        primary: AppColors.primary,
        secondary: AppColors.success,
        surface: const Color(0xFF111111),
      ),
      textTheme: base.textTheme.apply(
        fontFamily: 'Montserrat',
        bodyColor: Colors.white,
        displayColor: Colors.white,
      ),
      primaryTextTheme: base.primaryTextTheme.apply(
        fontFamily: 'Montserrat',
        bodyColor: Colors.white,
        displayColor: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.deepNavy,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF121212),
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppColors.radius),
        ),
      ),
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: AppColors.deepNavy,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.deepNavy,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppColors.radius),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppColors.radius),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.glassEffect,
        labelStyle: const TextStyle(color: Colors.white70),
        hintStyle: const TextStyle(color: Colors.white38),
        helperStyle: const TextStyle(color: Colors.white54),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radius),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radius),
          borderSide: const BorderSide(color: Colors.white10),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radius),
          borderSide: const BorderSide(color: AppColors.primary),
        ),
      ),
    );
  }
}
