import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/auth_provider.dart';
import '../../providers/nav_provider.dart';
import '../../providers/user_provider.dart';
import '../../core/theme.dart';
import 'dart:async';
import '../../providers/notification_provider.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/animated_widgets.dart';

import '../notifications/notification_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> with AutomaticKeepAliveClientMixin {
  Timer? _refreshTimer;

  @override
  bool get wantKeepAlive => true; // Keep state alive when switching tabs

  @override
  void initState() {
    super.initState();
    // Only refresh every 60 seconds to reduce lag
    _refreshTimer = Timer.periodic(const Duration(seconds: 60), (_) {
      if (mounted) {
        ref.invalidate(userProfileProvider);
        ref.invalidate(userStatsProvider);
        ref.invalidate(globalLeaderboardProvider);
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppTheme.background,
              Color(0xFF0F1228),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(userProfileProvider);
              ref.invalidate(userStatsProvider);
              ref.invalidate(globalLeaderboardProvider);
            },
            color: AppTheme.primary,
            backgroundColor: AppTheme.surface,
            child: ListView(
              padding: const EdgeInsets.all(20),
              cacheExtent: 500, // Preload more content for smooth scroll
              physics: const BouncingScrollPhysics(), // Smooth iOS-like scrolling
              children: [
                _buildHeader(),
                const SizedBox(height: 24),
                Consumer(
                  builder: (context, ref, _) {
                    final userAsync = ref.watch(userProfileProvider);
                    final statsAsync = ref.watch(userStatsProvider);
                    return userAsync.when(
                      data: (user) => _buildUserCard(user, statsAsync),
                      loading: () => _buildLoadingCard(),
                      error: (e, s) => const SizedBox(),
                    );
                  },
                ),
                const SizedBox(height: 28),
                _buildSectionTitle('Quick Actions'),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: AnimatedActionButton(
                        text: 'Start Duel',
                        icon: Icons.flash_on_rounded,
                        color: AppTheme.primary,
                        onTap: () => Navigator.pushNamed(context, '/topics'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AnimatedActionButton(
                        text: 'Practice',
                        icon: Icons.school_rounded,
                        color: AppTheme.accent,
                        onTap: () => Navigator.pushNamed(context, '/practice'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: AnimatedActionButton(
                        text: 'Challenge',
                        icon: Icons.people_alt_rounded,
                        color: AppTheme.secondary,
                        onTap: () => Navigator.pushNamed(context, '/challenges'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AnimatedActionButton(
                        text: 'Contribute',
                        icon: Icons.add_circle_outline_rounded,
                        color: AppTheme.tertiary,
                        onTap: () => Navigator.pushNamed(context, '/create-question'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSectionTitle('Top Players'),
                    TextButton(
                      onPressed: () {
                        ref.read(bottomNavIndexProvider.notifier).state = 1;
                      },
                      child: Row(
                        children: [
                          Text(
                            'View All',
                            style: GoogleFonts.outfit(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 14,
                            color: AppTheme.primary,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Consumer(
                  builder: (context, ref, _) {
                    final topPlayers = ref.watch(globalLeaderboardProvider);
                    return topPlayers.when(
                      data: (players) => Column(
                        children: players
                            .take(5)
                            .map(
                              (p) => _buildPlayerItem(p, players.indexOf(p) + 1),
                            )
                            .toList(),
                      ),
                      loading: () => const ShimmerPlayerList(itemCount: 5),
                      error: (e, s) => const SizedBox(),
                    );
                  },
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: AppTheme.textPrimary,
        letterSpacing: -0.3,
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primary.withValues(alpha: 0.15),
            AppTheme.accent.withValues(alpha: 0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppTheme.primary.withValues(alpha: 0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.15),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Logo with gradient
              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [AppTheme.primary, AppTheme.accent],
                ).createShader(bounds),
                child: Text(
                  'LearnDuels',
                  style: GoogleFonts.outfit(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              Row(
                children: [
                  Consumer(
                    builder: (context, ref, _) {
                      final unreadCount = ref.watch(unreadNotificationCountProvider);
                      
                      return _buildIconButton(
                        Icons.notifications_outlined,
                        unreadCount > 0 ? unreadCount : null,
                        () {
                          ref.read(unreadNotificationCountProvider.notifier).state = 0;
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const NotificationScreen(),
                            ),
                          );
                        },
                      );
                    },
                  ),
                  const SizedBox(width: 8),
                  _buildIconButton(
                    Icons.logout_rounded,
                    null,
                    () {
                      ref.read(authStateProvider.notifier).logout();
                      Navigator.pushReplacementNamed(context, '/login');
                    },
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Personalized greeting
          Consumer(
            builder: (context, ref, _) {
              final userAsync = ref.watch(userProfileProvider);
              return userAsync.when(
                data: (user) {
                  final username = user?['username'] ?? 'Champion';
                  final streak = user?['streak'] ?? 0;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${getTimeBasedGreeting()}, $username! 👋',
                        style: GoogleFonts.outfit(
                          color: AppTheme.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Text(
                            'Ready to dominate?',
                            style: GoogleFonts.outfit(
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w500,
                              fontSize: 14,
                            ),
                          ),
                          if (streak > 0) ...[
                            const SizedBox(width: 12),
                            StreakBadge(streak: streak),
                          ],
                        ],
                      ),
                    ],
                  );
                },
                loading: () => Text(
                  '${getTimeBasedGreeting()}! 👋',
                  style: GoogleFonts.outfit(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 18,
                  ),
                ),
                error: (_, __) => Text(
                  '${getTimeBasedGreeting()}! 👋',
                  style: GoogleFonts.outfit(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 18,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          // Gradient button
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary, AppTheme.primaryDark],
              ),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primary.withValues(alpha: 0.4),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => Navigator.pushNamed(context, '/topics'),
                borderRadius: BorderRadius.circular(14),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  child: Text(
                    'Start New Duel',
                    style: GoogleFonts.outfit(
                      color: AppTheme.background,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconButton(IconData icon, int? badge, VoidCallback onTap) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.border.withValues(alpha: 0.3),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Badge(
              isLabelVisible: badge != null,
              label: badge != null ? Text('$badge') : null,
              backgroundColor: AppTheme.secondary,
              child: Icon(
                icon,
                color: AppTheme.textPrimary,
                size: 22,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUserCard(
    Map<String, dynamic>? user,
    AsyncValue<Map<String, dynamic>?> statsAsync,
  ) {
    if (user == null) return const SizedBox();

    final username = user['username'] ?? 'Player';
    final level = user['level'] ?? 1;
    final xp = user['xp'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: AppTheme.glassDecoration(borderRadius: 24),
      child: Column(
        children: [
          Row(
            children: [
              // Avatar with gradient border
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primary, AppTheme.accent],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceLight,
                    borderRadius: BorderRadius.circular(17),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(17),
                    child: user['avatarUrl'] != null && user['avatarUrl'].toString().isNotEmpty
                        ? Image.network(
                            user['avatarUrl'],
                            fit: BoxFit.cover,
                            width: 60,
                            height: 60,
                            errorBuilder: (_, __, ___) => Center(
                              child: ShaderMask(
                                shaderCallback: (bounds) => const LinearGradient(
                                  colors: [AppTheme.primary, AppTheme.accent],
                                ).createShader(bounds),
                                child: Text(
                                  username[0].toUpperCase(),
                                  style: GoogleFonts.outfit(
                                    fontSize: 26,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          )
                        : Center(
                            child: ShaderMask(
                              shaderCallback: (bounds) => const LinearGradient(
                                colors: [AppTheme.primary, AppTheme.accent],
                              ).createShader(bounds),
                              child: Text(
                                username[0].toUpperCase(),
                                style: GoogleFonts.outfit(
                                  fontSize: 26,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      username,
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Level badge with glow
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppTheme.primary.withValues(alpha: 0.2),
                            AppTheme.accent.withValues(alpha: 0.1),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: AppTheme.primary.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Text(
                        'Level $level • $xp XP',
                        style: GoogleFonts.outfit(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          // Stats row with dividers
          statsAsync.when(
            data: (stats) {
              final wins = stats?['wins'] ?? 0;
              final total = stats?['totalDuels'] ?? 0;
              final rate = total > 0 ? (wins / total * 100).toInt() : 0;
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceLight.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(child: _buildStatItem('Wins', wins.toString(), Icons.emoji_events_rounded, AppTheme.tertiary)),
                    Container(
                      width: 1,
                      height: 50,
                      color: AppTheme.border.withValues(alpha: 0.3),
                    ),
                    Expanded(child: _buildStatItem('Win Rate', '$rate%', Icons.pie_chart_rounded, AppTheme.primary)),
                    Container(
                      width: 1,
                      height: 50,
                      color: AppTheme.border.withValues(alpha: 0.3),
                    ),
                    Expanded(
                      child: _buildStatItem('Rep', user['reputation'].toString(), Icons.star_rounded, AppTheme.secondary),
                    ),
                  ],
                ),
              );
            },
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(
                  color: AppTheme.primary,
                  strokeWidth: 2,
                ),
              ),
            ),
            error: (e, s) => Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: AppTheme.surfaceLight.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(child: _buildStatItem('Wins', '0', Icons.emoji_events_rounded, AppTheme.tertiary)),
                  Expanded(child: _buildStatItem('Rate', '0%', Icons.pie_chart_rounded, AppTheme.primary)),
                  Expanded(child: _buildStatItem('Rep', '0', Icons.star_rounded, AppTheme.secondary)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(height: 10),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 12,
            color: AppTheme.textMuted,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildActionButton(String text, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 130,
        decoration: BoxDecoration(
          color: AppTheme.surfaceLight,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: color.withValues(alpha: 0.2),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.1),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                icon,
                color: color,
                size: 28,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              text,
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlayerItem(Map<String, dynamic> player, int rank) {
    final username = player['username'] ?? 'Player';
    final xp = player['xp'] ?? 0;

    // Rank colors
    Color rankColor;
    if (rank == 1) {
      rankColor = AppTheme.gold;
    } else if (rank == 2) {
      rankColor = AppTheme.silver;
    } else if (rank == 3) {
      rankColor = AppTheme.bronze;
    } else {
      rankColor = AppTheme.textMuted;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: rank <= 3 ? rankColor.withValues(alpha: 0.3) : AppTheme.border.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          // Animated rank badge with medals for top 3
          PulsingRankBadge(rank: rank, color: rankColor),
          const SizedBox(width: 14),
          // Avatar
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: rank <= 3
                    ? [rankColor.withValues(alpha: 0.3), rankColor.withValues(alpha: 0.1)]
                    : [AppTheme.primary.withValues(alpha: 0.2), AppTheme.accent.withValues(alpha: 0.1)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: player['avatarUrl'] != null && player['avatarUrl'].toString().isNotEmpty
                  ? Image.network(
                      player['avatarUrl'],
                      fit: BoxFit.cover,
                      width: 42,
                      height: 42,
                      errorBuilder: (_, __, ___) => Center(
                        child: Text(
                          username[0].toUpperCase(),
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: rank <= 3 ? rankColor : AppTheme.primary,
                          ),
                        ),
                      ),
                    )
                  : Center(
                      child: Text(
                        username[0].toUpperCase(),
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: rank <= 3 ? rankColor : AppTheme.primary,
                        ),
                      ),
                    ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              username,
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
          // XP badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$xp XP',
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppTheme.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingCard() {
    return const ShimmerUserCard();
  }
}
