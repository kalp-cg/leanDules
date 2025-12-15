import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/notification_service.dart';
import '../../core/services/socket_service.dart';
import '../../core/services/duel_service.dart';
import '../duel/duel_screen.dart';

final notificationsProvider = FutureProvider.autoDispose<List<dynamic>>((
  ref,
) async {
  final service = ref.watch(notificationServiceProvider);
  final result = await service.getNotifications();
  return result['data'] ?? [];
});

class NotificationScreen extends ConsumerStatefulWidget {
  const NotificationScreen({super.key});

  @override
  ConsumerState<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends ConsumerState<NotificationScreen> {
  @override
  Widget build(BuildContext context) {
    final notificationsAsync = ref.watch(notificationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            onPressed: () async {
              await ref.read(notificationServiceProvider).markAllAsRead();
              ref.invalidate(notificationsProvider);
            },
            tooltip: 'Mark all as read',
          ),
        ],
      ),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return const Center(child: Text('No notifications yet'));
          }
          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notification = notifications[index];
              final isRead = notification['isRead'] ?? false;
              final type = notification['type'];
              final data = notification['data'];

              return Container(
                color: isRead
                    ? null
                    : Theme.of(
                        context,
                      ).colorScheme.primary.withValues(alpha: 0.05),
                child: ListTile(
                  leading: _buildIcon(type),
                  title: Text(
                    notification['message'],
                    style: TextStyle(
                      fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                    ),
                  ),
                  subtitle: Text(
                    _formatDate(notification['createdAt']),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () => _handleNotificationTap(notification),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildIcon(String? type) {
    switch (type) {
      case 'duel_invite':
        return const CircleAvatar(
          backgroundColor: Colors.orange,
          child: Icon(Icons.flash_on, color: Colors.white),
        );
      case 'follow':
        return const CircleAvatar(
          backgroundColor: Colors.blue,
          child: Icon(Icons.person_add, color: Colors.white),
        );
      default:
        return const CircleAvatar(
          backgroundColor: Colors.grey,
          child: Icon(Icons.notifications, color: Colors.white),
        );
    }
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr).toLocal();
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  Future<void> _handleNotificationTap(Map<String, dynamic> notification) async {
    // Mark as read
    if (notification['isRead'] == false) {
      await ref
          .read(notificationServiceProvider)
          .markAsRead(notification['id']);
      ref.invalidate(notificationsProvider);
    }

    final type = notification['type'];
    final data = notification['data'];

    if (type == 'duel_invite' && data != null) {
      _showDuelDialog(data);
    }
  }

  void _showDuelDialog(Map<String, dynamic> data) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Duel Challenge!'),
        content: Text(
          '${data['challengerEmail'] ?? 'Someone'} challenged you!',
        ),
        actions: [
          TextButton(
            onPressed: () {
              // Decline logic if needed
              Navigator.pop(context);
            },
            child: const Text('Close'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              // Accept logic
              final socketService = ref.read(socketServiceProvider);
              socketService.emit('duel:accept', {
                'challengeId': data['challengeId'],
                'challengerId': data['challengerId'],
              });

              // Wait for socket event or just navigate?
              // The MainScreen socket listener handles 'duel:accepted' and navigates.
              // But we might need to manually navigate if the socket event doesn't fire here?
              // Actually, if we emit 'duel:accept', the server should emit 'duel:accepted' to us.
              // But we are not listening to it here. MainScreen is.
              // So if MainScreen is in the tree (it is), it should handle it.

              // However, to be safe/responsive:
              // We can show a loading indicator or wait.
            },
            child: const Text('Accept'),
          ),
        ],
      ),
    );
  }
}
