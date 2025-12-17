import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/friend_service.dart';
import '../duel/topic_selection_screen.dart';

final friendsProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final service = ref.watch(friendServiceProvider);
  return service.getFollowing();
});

final usersProvider = FutureProvider.autoDispose.family<List<dynamic>, String>((
  ref,
  sortBy,
) async {
  final service = ref.watch(friendServiceProvider);
  return service.getUsers(sortBy: sortBy);
});

class FriendsScreen extends ConsumerStatefulWidget {
  const FriendsScreen({super.key});

  @override
  ConsumerState<FriendsScreen> createState() => _FriendsScreenState();
}

class _FriendsScreenState extends ConsumerState<FriendsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _lastIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _lastIndex = _tabController.index;
    _tabController.addListener(_handleTabChange);
  }

  void _handleTabChange() {
    if (_tabController.indexIsChanging) return;

    if (_tabController.index != _lastIndex) {
      _lastIndex = _tabController.index;
      if (_lastIndex == 0) {
        ref.invalidate(friendsProvider);
      }
    }
  }

  @override
  void dispose() {
    _tabController.removeListener(_handleTabChange);
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Friends'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'My Friends'),
            Tab(text: 'Find Friends'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [_buildFriendsList(), _buildFindFriendsList()],
      ),
    );
  }

  Widget _buildFriendsList() {
    final friendsAsync = ref.watch(friendsProvider);

    return friendsAsync.when(
      data: (friends) {
        if (friends.isEmpty) {
          return const Center(child: Text('You haven\'t followed anyone yet.'));
        }
        return ListView.builder(
          itemCount: friends.length,
          itemBuilder: (context, index) {
            final friend = friends[index];
            final displayName =
                friend['fullName'] ?? friend['username'] ?? 'User';
            final initial = displayName.isNotEmpty
                ? displayName[0].toUpperCase()
                : '?';

            return ListTile(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => TopicSelectionScreen(
                      opponentId: friend['id'],
                      opponentName: displayName,
                    ),
                  ),
                );
              },
              leading: CircleAvatar(
                backgroundImage: friend['avatarUrl'] != null
                    ? NetworkImage(friend['avatarUrl'])
                    : null,
                child: friend['avatarUrl'] == null ? Text(initial) : null,
              ),
              title: Text(displayName),
              subtitle: Text('@${friend['username']}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  FilledButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => TopicSelectionScreen(
                            opponentId: friend['id'],
                            opponentName: friend['fullName'],
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.flash_on_rounded, size: 16),
                    label: const Text('Duel'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      visualDensity: VisualDensity.compact,
                    ),
                  ),
                  PopupMenuButton(
                    icon: const Icon(Icons.more_vert_rounded),
                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: 'unfollow',
                        child: Row(
                          children: [
                            Icon(
                              Icons.person_remove_rounded,
                              color: Colors.grey,
                              size: 20,
                            ),
                            SizedBox(width: 8),
                            Text('Unfollow'),
                          ],
                        ),
                      ),
                    ],
                    onSelected: (value) async {
                      if (value == 'unfollow') {
                        await ref
                            .read(friendServiceProvider)
                            .unfollowUser(friend['id']);
                        ref.invalidate(friendsProvider);
                      }
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Error: $err')),
    );
  }

  Widget _buildFindFriendsList() {
    final usersAsync = ref.watch(usersProvider('newest'));

    return usersAsync.when(
      data: (users) {
        if (users.isEmpty) {
          return const Center(child: Text('No users found.'));
        }
        return ListView.builder(
          itemCount: users.length,
          itemBuilder: (context, index) {
            final user = users[index];
            final isFollowing = user['isFollowing'] ?? false;
            final displayName = user['fullName'] ?? user['username'] ?? 'User';
            final initial = displayName.isNotEmpty
                ? displayName[0].toUpperCase()
                : '?';

            return ListTile(
              leading: CircleAvatar(
                backgroundImage: user['avatarUrl'] != null
                    ? NetworkImage(user['avatarUrl'])
                    : null,
                child: user['avatarUrl'] == null ? Text(initial) : null,
              ),
              title: Text(displayName),
              subtitle: Text(
                'Joined ${user['createdAt'].toString().split('T')[0]}',
              ),
              trailing: ElevatedButton(
                onPressed: isFollowing
                    ? null
                    : () async {
                        await ref
                            .read(friendServiceProvider)
                            .followUser(user['id']);
                        ref.invalidate(usersProvider('newest'));
                        ref.invalidate(friendsProvider);
                      },
                child: Text(isFollowing ? 'Following' : 'Follow'),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Error: $err')),
    );
  }
}
