import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/services/friend_service.dart';
import '../../core/theme.dart';
import '../duel/topic_selection_screen.dart';

// Keep alive provider to persist friends list
final friendsProvider = FutureProvider<List<dynamic>>((ref) async {
  final service = ref.watch(friendServiceProvider);
  return service.getFollowing();
});

final usersProvider = FutureProvider.family<List<dynamic>, String>((
  ref,
  sortBy,
) async {
  final service = ref.watch(friendServiceProvider);
  return service.getUsers(sortBy: sortBy);
});

// Track which users are being followed (for loading state)
final followingInProgressProvider = StateProvider<Set<int>>((ref) => {});

// Provider for follow suggestions/recommendations
final suggestionsProvider = FutureProvider<List<dynamic>>((ref) async {
  final service = ref.watch(friendServiceProvider);
  try {
    return await service.getRecommendations();
  } catch (e) {
    // Fallback to users if recommendations endpoint fails
    return await service.getUsers(sortBy: 'popular');
  }
});

class FriendsScreen extends ConsumerStatefulWidget {
  const FriendsScreen({super.key});

  @override
  ConsumerState<FriendsScreen> createState() => _FriendsScreenState();
}

class _FriendsScreenState extends ConsumerState<FriendsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_handleTabChange);
  }

  void _handleTabChange() {
    if (!_tabController.indexIsChanging && mounted) {
      // Refresh data when switching tabs
      if (_tabController.index == 0) {
        ref.invalidate(friendsProvider);
      } else {
        ref.invalidate(usersProvider('newest'));
      }
    }
  }

  @override
  void dispose() {
    _tabController.removeListener(_handleTabChange);
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _followUser(int userId) async {
    // Add to in-progress set
    ref.read(followingInProgressProvider.notifier).update((state) => {...state, userId});
    
    try {
      await ref.read(friendServiceProvider).followUser(userId);
      
      // Refresh both lists
      ref.invalidate(usersProvider('newest'));
      ref.invalidate(friendsProvider);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'User followed successfully!',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w500),
            ),
            backgroundColor: AppTheme.success,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to follow: $e',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w500),
            ),
            backgroundColor: AppTheme.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      // Remove from in-progress set
      ref.read(followingInProgressProvider.notifier).update((state) {
        final newState = {...state};
        newState.remove(userId);
        return newState;
      });
    }
  }

  Future<void> _unfollowUser(int userId) async {
    try {
      await ref.read(friendServiceProvider).unfollowUser(userId);
      
      // Refresh both lists
      ref.invalidate(friendsProvider);
      ref.invalidate(usersProvider('newest'));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'User unfollowed',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w500),
            ),
            backgroundColor: AppTheme.surfaceLight,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to unfollow: $e',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w500),
            ),
            backgroundColor: AppTheme.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        elevation: 0,
        title: Text(
          'Friends',
          style: GoogleFonts.outfit(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          indicatorWeight: 3,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'My Friends'),
            Tab(text: 'Find Friends'),
          ],
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.background, Color(0xFF0F1228)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: TabBarView(
          controller: _tabController,
          children: [_buildFriendsList(), _buildFindFriendsList()],
        ),
      ),
    );
  }

  Widget _buildFriendsList() {
    final friendsAsync = ref.watch(friendsProvider);

    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(friendsProvider),
      color: AppTheme.primary,
      child: friendsAsync.when(
        data: (friends) {
          if (friends.isEmpty) {
            return _buildEmptyFriendsState();
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: friends.length,
            itemBuilder: (context, index) {
              final friend = friends[index];
              return _buildFriendCard(friend);
            },
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.primary),
        ),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: AppTheme.error.withValues(alpha: 0.7)),
              const SizedBox(height: 16),
              Text(
                'Error loading friends',
                style: GoogleFonts.outfit(color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(friendsProvider),
                child: Text('Retry', style: GoogleFonts.outfit(color: AppTheme.primary)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyFriendsState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.surfaceLight,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.people_outline_rounded,
                size: 48,
                color: AppTheme.textMuted.withValues(alpha: 0.5),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'No Friends Yet',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Find and follow other players to add them to your friends list!',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => _tabController.animateTo(1),
              icon: const Icon(Icons.search_rounded),
              label: Text('Find Friends', style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.primary,
                side: const BorderSide(color: AppTheme.primary),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFriendCard(Map<String, dynamic> friend) {
    final displayName = friend['fullName'] ?? friend['username'] ?? 'User';
    final initial = displayName.isNotEmpty ? displayName[0].toUpperCase() : '?';
    final friendId = friend['id'];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primary, AppTheme.primaryDark],
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: friend['avatarUrl'] != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.network(friend['avatarUrl'], fit: BoxFit.cover),
                  )
                : Center(
                    child: Text(
                      initial,
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 20,
                      ),
                    ),
                  ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  displayName,
                  style: GoogleFonts.outfit(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '@${friend['username'] ?? 'user'}',
                  style: GoogleFonts.outfit(
                    color: AppTheme.textMuted,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primary, AppTheme.primaryDark],
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => TopicSelectionScreen(
                            opponentId: friendId,
                            opponentName: displayName,
                          ),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.flash_on_rounded, size: 16, color: Colors.white),
                          const SizedBox(width: 4),
                          Text(
                            'Duel',
                            style: GoogleFonts.outfit(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              PopupMenuButton(
                icon: Icon(Icons.more_vert_rounded, color: AppTheme.textMuted),
                color: AppTheme.surface,
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'unfollow',
                    child: Row(
                      children: [
                        Icon(Icons.person_remove_rounded, color: AppTheme.error, size: 20),
                        const SizedBox(width: 8),
                        Text('Unfollow', style: GoogleFonts.outfit(color: AppTheme.textPrimary)),
                      ],
                    ),
                  ),
                ],
                onSelected: (value) async {
                  if (value == 'unfollow') {
                    await _unfollowUser(friendId);
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFindFriendsList() {
    final usersAsync = ref.watch(usersProvider('newest'));
    final followingInProgress = ref.watch(followingInProgressProvider);

    return RefreshIndicator(
      onRefresh: () async => ref.invalidate(usersProvider('newest')),
      color: AppTheme.primary,
      child: usersAsync.when(
        data: (users) {
          if (users.isEmpty) {
            return Center(
              child: Text(
                'No users found.',
                style: GoogleFonts.outfit(color: AppTheme.textSecondary),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: users.length,
            itemBuilder: (context, index) {
              final user = users[index];
              return _buildUserCard(user, followingInProgress);
            },
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.primary),
        ),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: AppTheme.error.withValues(alpha: 0.7)),
              const SizedBox(height: 16),
              Text(
                'Error loading users',
                style: GoogleFonts.outfit(color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(usersProvider('newest')),
                child: Text('Retry', style: GoogleFonts.outfit(color: AppTheme.primary)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user, Set<int> followingInProgress) {
    final isFollowing = user['isFollowing'] ?? false;
    final userId = user['id'] as int;
    final isLoading = followingInProgress.contains(userId);
    final displayName = user['fullName'] ?? user['username'] ?? 'User';
    final initial = displayName.isNotEmpty ? displayName[0].toUpperCase() : '?';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppTheme.accent.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: user['avatarUrl'] != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.network(user['avatarUrl'], fit: BoxFit.cover),
                  )
                : Center(
                    child: Text(
                      initial,
                      style: GoogleFonts.outfit(
                        color: AppTheme.accent,
                        fontWeight: FontWeight.w700,
                        fontSize: 20,
                      ),
                    ),
                  ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  displayName,
                  style: GoogleFonts.outfit(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Joined ${user['createdAt'].toString().split('T')[0]}',
                  style: GoogleFonts.outfit(
                    color: AppTheme.textMuted,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          isLoading
              ? const SizedBox(
                  width: 80,
                  child: Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppTheme.primary,
                      ),
                    ),
                  ),
                )
              : isFollowing
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.success.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.success.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_rounded, size: 16, color: AppTheme.success),
                          const SizedBox(width: 4),
                          Text(
                            'Following',
                            style: GoogleFonts.outfit(
                              color: AppTheme.success,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    )
                  : Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.accent, Color(0xFF00C7B1)],
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () => _followUser(userId),
                          borderRadius: BorderRadius.circular(10),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.person_add_rounded, size: 16, color: Colors.black87),
                                const SizedBox(width: 4),
                                Text(
                                  'Follow',
                                  style: GoogleFonts.outfit(
                                    color: Colors.black87,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
        ],
      ),
    );
  }
}
