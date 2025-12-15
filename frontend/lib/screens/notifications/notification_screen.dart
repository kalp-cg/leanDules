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
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: _buildAppBar(context),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return _buildEmptyState(context);
          }
          return _buildNotificationsList(context, notifications);
        },
        loading: () => _buildLoadingState(context),
        error: (err, stack) => _buildErrorState(context, err),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Theme.of(context).colorScheme.surface,
      elevation: 0,
      centerTitle: false,
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Notifications',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
              fontWeight: FontWeight.w700,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 16.0),
          child: Center(
            child: TextButton.icon(
              onPressed: () async {
                await ref.read(notificationServiceProvider).markAllAsRead();
                ref.invalidate(notificationsProvider);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('All notifications marked as read'),
                      duration: const Duration(seconds: 2),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  );
                }
              },
              icon: const Icon(Icons.done_all_rounded, size: 18),
              label: Text(
                'Mark all read',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.notifications_none_rounded,
              size: 40,
              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.4),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'No notifications yet',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Stay tuned! When you get notifications,\nthey\'ll appear here.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            color: Theme.of(context).colorScheme.primary,
            strokeWidth: 2.5,
          ),
          const SizedBox(height: 16),
          Text(
            'Loading notifications...',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: Theme.of(context).colorScheme.error.withValues(alpha: 0.6),
            ),
            const SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () {
                ref.invalidate(notificationsProvider);
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationsList(
    BuildContext context,
    List<dynamic> notifications,
  ) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 0),
      itemCount: notifications.length,
      separatorBuilder: (context, index) => Divider(
        height: 1,
        indent: 16 + 56, // Icon + leading padding
        endIndent: 16,
        color: Theme.of(context).dividerColor.withValues(alpha: 0.3),
      ),
      itemBuilder: (context, index) {
        final notification = notifications[index];
        final isRead = notification['isRead'] ?? false;
        final type = notification['type'];

        return _buildNotificationTile(context, notification, isRead, type);
      },
    );
  }

  Widget _buildNotificationTile(
    BuildContext context,
    Map<String, dynamic> notification,
    bool isRead,
    String? type,
  ) {
    return Material(
      color: isRead
          ? Colors.transparent
          : Theme.of(context).colorScheme.primary.withValues(alpha: 0.03),
      child: InkWell(
        onTap: () => _handleNotificationTap(notification),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon
              Padding(
                padding: const EdgeInsets.only(top: 4, right: 12),
                child: _buildIcon(type),
              ),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Message
                    Text(
                      notification['message'] ?? 'Notification',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: isRead ? FontWeight.w500 : FontWeight.w600,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 6),
                    // Time
                    Text(
                      _formatDate(notification['createdAt']),
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              if (!isRead) ...[
                const SizedBox(width: 12),
                // Unread indicator dot
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIcon(String? type) {
    const iconSize = 24.0;
    
    switch (type) {
      case 'challenge':
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFFEE6E4D).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(
            Icons.flash_on_rounded,
            color: Color(0xFFEE6E4D),
            size: iconSize,
          ),
        );
      case 'message':
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF4A9EFF).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(
            Icons.chat_bubble_outline_rounded,
            color: Color(0xFF4A9EFF),
            size: iconSize,
          ),
        );
      case 'follow':
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF00D084).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(
            Icons.person_add_rounded,
            color: Color(0xFF00D084),
            size: iconSize,
          ),
        );
      case 'achievement':
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFFC9A227).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(
            Icons.emoji_events_rounded,
            color: Color(0xFFC9A227),
            size: iconSize,
          ),
        );
      case 'leaderboard':
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF9C27B0).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(
            Icons.trending_up_rounded,
            color: Color(0xFF9C27B0),
            size: iconSize,
          ),
        );
      case 'duel_result':
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF2196F3).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(
            Icons.sports_score_rounded,
            color: Color(0xFF2196F3),
            size: iconSize,
          ),
        );
      default:
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            Icons.notifications_rounded,
            color: Theme.of(context).colorScheme.primary,
            size: iconSize,
          ),
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

    if (type == 'challenge' && data != null) {
      _showChallengeDialog(data);
    }
  }

  void _showChallengeDialog(Map<String, dynamic> data) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFFEE6E4D).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.flash_on_rounded,
                  color: Color(0xFFEE6E4D),
                  size: 32,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Challenge Received!',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '${data['challengerName'] ?? 'Someone'} challenged you to a duel',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () async {
                    Navigator.pop(context);
                    final socketService = ref.read(socketServiceProvider);
                    socketService.emit('challenge:accept', {
                      'challengeId': data['challengeId'],
                      'challengerId': data['challengerId'],
                    });
                  },
                  child: const Text('Accept Challenge'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Decline'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

