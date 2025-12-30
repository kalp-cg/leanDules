import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 PREMIUM DARK THEME - "Midnight Neon"
  // A stunning dark theme with vibrant accent colors and modern aesthetics
  // ═══════════════════════════════════════════════════════════════════════════

  // 🌙 Base Dark Colors
  static const Color background = Color(0xFF0A0E21); // Deep Space Black
  static const Color surface = Color(0xFF1D1F33); // Elevated Surface
  static const Color surfaceLight = Color(0xFF262A45); // Card Surface
  static const Color surfaceGlass = Color(0xFF2D325A); // Glassmorphism Surface

  // 🔥 Vibrant Accent Colors - Neon Gradient Palette
  static const Color primary = Color(0xFF00F5D4); // Electric Cyan
  static const Color primaryDark = Color(0xFF00B4A0); // Deep Teal
  static const Color secondary = Color(0xFFFF6B6B); // Coral Red
  static const Color tertiary = Color(0xFFFFCC00); // Golden Yellow
  static const Color accent = Color(0xFF9B5DE5); // Electric Purple

  // 🌈 Gradient Colors
  static const Color gradientStart = Color(0xFF00F5D4); // Cyan
  static const Color gradientMiddle = Color(0xFF9B5DE5); // Purple
  static const Color gradientEnd = Color(0xFFFF6B6B); // Coral
  
  // ✨ Neon Glow Colors
  static const Color neonCyan = Color(0xFF00F5D4);
  static const Color neonPink = Color(0xFFFF006E);
  static const Color neonPurple = Color(0xFF9B5DE5);
  static const Color neonGold = Color(0xFFFFCC00);

  // 📝 Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF); // Pure White
  static const Color textSecondary = Color(0xFFB0B8D1); // Soft Lavender
  static const Color textMuted = Color(0xFF6B7294); // Muted Blue-Gray

  // 🎯 UI Elements
  static const Color border = Color(0xFF2D325A); // Subtle Border
  static const Color divider = Color(0xFF1D2240);
  static const Color cardGlow = Color(0x2000F5D4); // Subtle Cyan Glow

  // ✅ Functional Colors
  static const Color error = Color(0xFFFF5252);
  static const Color success = Color(0xFF00F5D4);
  static const Color warning = Color(0xFFFFCC00);
  static const Color info = Color(0xFF4DA1FF);

  // 📊 Level/Rank Colors
  static const Color bronze = Color(0xFFCD7F32);
  static const Color silver = Color(0xFFC0C0C0);
  static const Color gold = Color(0xFFFFD700);
  static const Color platinum = Color(0xFFE5E4E2);
  static const Color diamond = Color(0xFFB9F2FF);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎭 THEME DATA
  // ═══════════════════════════════════════════════════════════════════════════

  static ThemeData get academicTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      
      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        tertiary: accent,
        surface: surface,
        error: error,
        outline: border,
        onPrimary: Color(0xFF0A0E21), // Dark text on primary
        onSecondary: Colors.white,
        onSurface: textPrimary,
        onError: Colors.white,
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 📝 TYPOGRAPHY - Premium Outfit Font
      // ═══════════════════════════════════════════════════════════════════════
      textTheme: TextTheme(
        // Hero Headlines
        displayLarge: GoogleFonts.outfit(
          fontSize: 42,
          fontWeight: FontWeight.w900,
          color: textPrimary,
          letterSpacing: -1.5,
          height: 1.1,
        ),
        displayMedium: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: textPrimary,
          letterSpacing: -1.0,
          height: 1.2,
        ),
        displaySmall: GoogleFonts.outfit(
          fontSize: 26,
          fontWeight: FontWeight.w700,
          color: textPrimary,
          letterSpacing: -0.5,
        ),
        // Section Headers
        headlineLarge: GoogleFonts.outfit(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: textPrimary,
          letterSpacing: -0.3,
        ),
        headlineMedium: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: textPrimary,
          letterSpacing: -0.2,
        ),
        headlineSmall: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        // Body Text
        titleLarge: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: textPrimary,
          height: 1.4,
        ),
        titleMedium: GoogleFonts.outfit(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        bodyLarge: GoogleFonts.outfit(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: textPrimary,
          height: 1.6,
        ),
        bodyMedium: GoogleFonts.outfit(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: textSecondary,
          height: 1.5,
        ),
        bodySmall: GoogleFonts.outfit(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textMuted,
          height: 1.4,
          letterSpacing: 0.3,
        ),
        // Labels & Buttons
        labelLarge: GoogleFonts.outfit(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          color: Colors.white,
          letterSpacing: 0.8,
        ),
        labelMedium: GoogleFonts.outfit(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: textSecondary,
          letterSpacing: 0.5,
        ),
        labelSmall: GoogleFonts.outfit(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textMuted,
          letterSpacing: 0.8,
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 📱 APP BAR
      // ═══════════════════════════════════════════════════════════════════════
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        iconTheme: const IconThemeData(color: textPrimary, size: 24),
        titleTextStyle: GoogleFonts.outfit(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🔘 ELEVATED BUTTON - Gradient Style
      // ═══════════════════════════════════════════════════════════════════════
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: const Color(0xFF0A0E21),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
          elevation: 8,
          shadowColor: primary.withValues(alpha: 0.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // ⭕ OUTLINED BUTTON - Glass Style
      // ═══════════════════════════════════════════════════════════════════════
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primary,
          side: const BorderSide(color: primary, width: 2),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 💬 TEXT BUTTON
      // ═══════════════════════════════════════════════════════════════════════
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          textStyle: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🃏 CARD - Glassmorphism Style
      // ═══════════════════════════════════════════════════════════════════════
      cardTheme: CardThemeData(
        color: surfaceLight,
        elevation: 0,
        shadowColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: border.withValues(alpha: 0.5),
            width: 1,
          ),
        ),
        margin: const EdgeInsets.only(bottom: 16),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 📝 INPUT DECORATION - Modern Glass Style
      // ═══════════════════════════════════════════════════════════════════════
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: border.withValues(alpha: 0.5), width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: border.withValues(alpha: 0.5), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: error, width: 2),
        ),
        hintStyle: GoogleFonts.outfit(
          color: textMuted,
          fontSize: 15,
          fontWeight: FontWeight.w400,
        ),
        labelStyle: GoogleFonts.outfit(
          color: textSecondary,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        prefixIconColor: textMuted,
        suffixIconColor: textMuted,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 18,
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🔽 BOTTOM NAVIGATION - Floating Glass Style
      // ═══════════════════════════════════════════════════════════════════════
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: primary,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        selectedLabelStyle: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🎚️ SLIDER
      // ═══════════════════════════════════════════════════════════════════════
      sliderTheme: const SliderThemeData(
        activeTrackColor: primary,
        inactiveTrackColor: surfaceLight,
        thumbColor: primary,
        overlayColor: Color(0x2000F5D4),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // ✅ CHECKBOX
      // ═══════════════════════════════════════════════════════════════════════
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return primary;
          return Colors.transparent;
        }),
        checkColor: WidgetStateProperty.all(background),
        side: const BorderSide(color: textMuted, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🔘 RADIO
      // ═══════════════════════════════════════════════════════════════════════
      radioTheme: RadioThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return primary;
          return textMuted;
        }),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🔄 PROGRESS INDICATOR
      // ═══════════════════════════════════════════════════════════════════════
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: primary,
        linearTrackColor: surfaceLight,
        circularTrackColor: surfaceLight,
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 📍 FLOATING ACTION BUTTON
      // ═══════════════════════════════════════════════════════════════════════
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: background,
        elevation: 8,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 💬 SNACKBAR
      // ═══════════════════════════════════════════════════════════════════════
      snackBarTheme: SnackBarThemeData(
        backgroundColor: surfaceLight,
        contentTextStyle: GoogleFonts.outfit(
          color: textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 📄 DIALOG
      // ═══════════════════════════════════════════════════════════════════════
      dialogTheme: DialogThemeData(
        backgroundColor: surface,
        elevation: 24,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        titleTextStyle: GoogleFonts.outfit(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
        contentTextStyle: GoogleFonts.outfit(
          color: textSecondary,
          fontSize: 14,
          fontWeight: FontWeight.w400,
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 📋 BOTTOM SHEET
      // ═══════════════════════════════════════════════════════════════════════
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        dragHandleColor: textMuted,
        dragHandleSize: Size(40, 4),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🏷️ CHIP
      // ═══════════════════════════════════════════════════════════════════════
      chipTheme: ChipThemeData(
        backgroundColor: surfaceLight,
        selectedColor: primary,
        disabledColor: surfaceLight,
        labelStyle: GoogleFonts.outfit(
          color: textSecondary,
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
        secondaryLabelStyle: GoogleFonts.outfit(
          color: background,
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: border.withValues(alpha: 0.5)),
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🎯 ICON THEME
      // ═══════════════════════════════════════════════════════════════════════
      iconTheme: const IconThemeData(color: textPrimary, size: 24),
      
      // ═══════════════════════════════════════════════════════════════════════
      // 📐 DIVIDER
      // ═══════════════════════════════════════════════════════════════════════
      dividerTheme: const DividerThemeData(
        color: divider,
        thickness: 1,
        space: 24,
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 📑 TAB BAR
      // ═══════════════════════════════════════════════════════════════════════
      tabBarTheme: TabBarThemeData(
        labelColor: primary,
        unselectedLabelColor: textMuted,
        indicatorColor: primary,
        labelStyle: GoogleFonts.outfit(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.outfit(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🔄 SWITCH
      // ═══════════════════════════════════════════════════════════════════════
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return primary;
          return textMuted;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return primary.withValues(alpha: 0.3);
          return surfaceLight;
        }),
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),

      // ═══════════════════════════════════════════════════════════════════════
      // 🎨 LIST TILE
      // ═══════════════════════════════════════════════════════════════════════
      listTileTheme: ListTileThemeData(
        tileColor: Colors.transparent,
        iconColor: textSecondary,
        textColor: textPrimary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 HELPER METHODS FOR CUSTOM DECORATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /// Premium gradient for hero sections
  static LinearGradient get premiumGradient => const LinearGradient(
    colors: [gradientStart, gradientMiddle, gradientEnd],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Neon glow box decoration
  static BoxDecoration neonGlowDecoration({
    Color glowColor = primary,
    double borderRadius = 20,
  }) {
    return BoxDecoration(
      color: surfaceLight,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(color: glowColor.withValues(alpha: 0.3), width: 1),
      boxShadow: [
        BoxShadow(
          color: glowColor.withValues(alpha: 0.2),
          blurRadius: 20,
          spreadRadius: 0,
        ),
      ],
    );
  }

  /// Glass morphism decoration
  static BoxDecoration glassDecoration({
    double borderRadius = 20,
    Color? borderColor,
  }) {
    return BoxDecoration(
      color: surfaceGlass.withValues(alpha: 0.7),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: borderColor ?? border.withValues(alpha: 0.5),
        width: 1,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.2),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ],
    );
  }

  /// Gradient button decoration
  static BoxDecoration gradientButtonDecoration({
    double borderRadius = 16,
    List<Color>? colors,
  }) {
    return BoxDecoration(
      gradient: LinearGradient(
        colors: colors ?? [primary, primaryDark],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(borderRadius),
      boxShadow: [
        BoxShadow(
          color: primary.withValues(alpha: 0.4),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ],
    );
  }

  /// Card decoration with subtle border
  static BoxDecoration cardDecoration({
    double borderRadius = 20,
    Color? backgroundColor,
  }) {
    return BoxDecoration(
      color: backgroundColor ?? surfaceLight,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(color: border.withValues(alpha: 0.5), width: 1),
    );
  }

  /// Hero header decoration
  static BoxDecoration heroHeaderDecoration() {
    return BoxDecoration(
      gradient: const LinearGradient(
        colors: [Color(0xFF1A1F3C), Color(0xFF0F1228)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ),
      borderRadius: BorderRadius.circular(28),
      border: Border.all(color: primary.withValues(alpha: 0.2), width: 1),
      boxShadow: [
        BoxShadow(
          color: primary.withValues(alpha: 0.15),
          blurRadius: 30,
          offset: const Offset(0, 10),
        ),
      ],
    );
  }
}
