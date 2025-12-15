import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/nav_provider.dart';
import '../providers/duel_provider.dart';
import '../core/services/socket_service.dart';
import '../core/services/duel_service.dart';
import 'home/home_screen.dart';
import 'leaderboard/leaderboard_screen.dart';
import 'profile/profile_screen.dart';
import 'friends/friends_screen.dart';
import 'duel/duel_screen.dart';

class MainScreen extends ConsumerStatefulWidget {
  final int initialIndex;
  const MainScreen({super.key, this.initialIndex = 0});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  @override
  void initState() {
    super.initState();
    // Initialize the provider with the passed index
    Future.microtask(() {
      ref.read(bottomNavIndexProvider.notifier).state = widget.initialIndex;
      _initSocket();
    });
  }

  void _initSocket() async {
    final socketService = ref.read(socketServiceProvider);
    await socketService.connect();

    // Listen for invitations
    socketService.on('duel:invitation_received', (data) {
      if (!mounted) return;
      _showInvitationDialog(data);
    });

    // Listen for generic notifications
    socketService.on('notification', (data) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(data['message'] ?? 'New notification'),
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(
            label: 'View',
            onPressed: () {
              ref.read(bottomNavIndexProvider.notifier).state =
                  2; // Navigate to notifications tab
            },
          ),
        ),
      );
      // Refresh notification count/list if needed
      // ref.refresh(notificationsProvider);
    });

    // Listen for duel start (after acceptance)
    socketService.on('duel:accepted', (data) {
      if (!mounted) return;
      // Both players receive this.
      // The challenger already has data set in ProfileScreen.
      // The opponent sets data in the accept callback.
      // So we just need to navigate if not already there.

      // Check if we are already on DuelScreen to avoid double push
      // This is a bit hacky, but for now:
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const DuelScreen()),
      );
    });
  }

  void _showInvitationDialog(dynamic data) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Duel Challenge!'),
        content: Text(
          '${data['challengerEmail'] ?? 'Someone'} wants to duel you!',
        ),
        actions: [
          TextButton(
            onPressed: () {
              // Decline
              final socketService = ref.read(socketServiceProvider);
              socketService.emit('duel:decline', {
                'challengeId': data['challengeId'],
                'challengerId': data['challengerId'],
              });
              Navigator.pop(context);
            },
            child: Text(
              'Decline',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
          TextButton(
            onPressed: () async {
              // Accept
              final socketService = ref.read(socketServiceProvider);
              socketService.emit('duel:accept', {
                'challengeId': data['challengeId'],
                'challengerId': data['challengerId'],
              });
              Navigator.pop(context);

              try {
                // Fetch duel details
                final duelId = data['duelId'];
                if (duelId != null) {
                  final duelData = await ref
                      .read(duelServiceProvider)
                      .getDuel(duelId);
                  ref.read(duelStateProvider.notifier).setDuelData(duelData);

                  if (context.mounted) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const DuelScreen(),
                      ),
                    );
                  }
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Error: Missing duel ID')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to load duel: $e')),
                  );
                }
              }
            },
            child: const Text(
              'Accept',
              style: TextStyle(color: Color(0xFF6C63FF)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    final socketService = ref.read(socketServiceProvider);
    socketService.off('duel:invitation_received');
    socketService.off('duel:accepted');
    socketService.disconnect();
    super.dispose();
  }

  final List<Widget> _screens = const [
    HomeScreen(),
    LeaderboardScreen(),
    FriendsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(bottomNavIndexProvider);

    return Scaffold(
      body: IndexedStack(index: currentIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: Theme.of(context).dividerColor, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (index) {
            ref.read(bottomNavIndexProvider.notifier).state = index;
          },
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.leaderboard_outlined),
              activeIcon: Icon(Icons.leaderboard_rounded),
              label: 'Leaderboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.people_outline),
              activeIcon: Icon(Icons.people_rounded),
              label: 'Friends',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
