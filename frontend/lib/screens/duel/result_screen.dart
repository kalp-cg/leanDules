import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/duel_provider.dart';

class ResultScreen extends ConsumerStatefulWidget {
  const ResultScreen({super.key});

  @override
  ConsumerState<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends ConsumerState<ResultScreen> {
  String? _currentUserId;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _currentUserId = prefs.getString('userId');
    });
  }

  @override
  Widget build(BuildContext context) {
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
    final duelState = ref.watch(duelStateProvider);

    // We can use args for initial display, but prefer duelState for real-time updates
    Map<String, dynamic> resultData = {};
    final stateValue = duelState.value;

    if (stateValue != null &&
        stateValue['status'] == 'completed' &&
        stateValue['finalResults'] != null) {
      // Ensure it's treated as a Map
      if (stateValue['finalResults'] is Map) {
        resultData = Map<String, dynamic>.from(stateValue['finalResults']);
      }
    } else if (args != null) {
      resultData = args;
    }

    if (resultData.isEmpty) {
      return const Scaffold(body: Center(child: Text('No result data')));
    }

    final winnerId = resultData['winnerId']?.toString();
    final scores = resultData['scores'] as Map<String, dynamic>? ?? {};

    // Determine win/loss/tie
    final isWin = winnerId != null && winnerId == _currentUserId;
    final isTie = winnerId == null;
    final userScore = scores[_currentUserId] ?? 0;

    // Rematch logic from duelState
    final rematchRequested = duelState.value?['rematchRequested'] ?? false;
    final rematchOfferedBy = duelState.value?['rematchOfferedBy']?.toString();

    // If a rematch starts, navigate back to DuelScreen
    if (duelState.value != null && duelState.value!['status'] != 'completed') {
      Future.microtask(() => Navigator.pushReplacementNamed(context, '/duel'));
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color:
                      (isTie
                              ? Colors.orange
                              : (isWin ? Colors.green : Colors.red))
                          .withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isTie
                      ? Icons.balance_rounded
                      : (isWin
                            ? Icons.emoji_events_rounded
                            : Icons.close_rounded),
                  size: 80,
                  color: isTie
                      ? Colors.orange
                      : (isWin ? Colors.green : Colors.red),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                isTie ? 'It\'s a Tie!' : (isWin ? 'Victory!' : 'Defeat!'),
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isTie
                      ? Colors.orange
                      : (isWin ? Colors.green : Colors.red),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              
              // Player stats comparison
              _buildPlayerStatsCard(resultData, _currentUserId),
              
              const SizedBox(height: 32),

              // Rematch Section
              if (rematchRequested)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text(
                      'Waiting for opponent to accept rematch...',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontStyle: FontStyle.italic),
                    ),
                  ),
                )
              else if (rematchOfferedBy != null &&
                  rematchOfferedBy != _currentUserId)
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () =>
                        ref.read(duelStateProvider.notifier).acceptRematch(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      'Accept Rematch',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                )
              else
                SizedBox(
                  height: 56,
                  child: OutlinedButton(
                    onPressed: () =>
                        ref.read(duelStateProvider.notifier).requestRematch(),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      'Rematch',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),
                ),

              const SizedBox(height: 16),

              SizedBox(
                height: 56,
                child: TextButton(
                  onPressed: () {
                    ref.read(duelStateProvider.notifier).reset();
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      '/home',
                      (route) => false,
                    );
                  },
                  child: Text(
                    'Back to Home',
                    style: TextStyle(
                      fontSize: 16,
                      color: Theme.of(context).hintColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildPlayerStatsCard(Map<String, dynamic> resultData, String? currentUserId) {
    final players = resultData['players'] as Map<String, dynamic>? ?? {};
    final winnerId = resultData['winnerId']?.toString();
    final totalQuestions = resultData['totalQuestions'] ?? 0;
    
    if (players.isEmpty) {
      // Fallback to old format
      final scores = resultData['scores'] as Map<String, dynamic>? ?? {};
      final userScore = scores[currentUserId] ?? 0;
      return Text(
        'Your Score: $userScore',
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
        textAlign: TextAlign.center,
      );
    }
    
    final playerList = players.entries.toList();
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Text(
            'Final Score',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          if (totalQuestions > 0)
            Text(
              '$totalQuestions Questions',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).hintColor,
              ),
            ),
          const SizedBox(height: 16),
          Row(
            children: playerList.map((entry) {
              final playerId = entry.key.toString(); // Ensure string
              final playerData = entry.value as Map<String, dynamic>;
              final isWinner = winnerId?.toString() == playerId;
              final isCurrentUser = playerId == currentUserId?.toString();
              
              return Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: isWinner 
                        ? Colors.green.withValues(alpha: 0.1)
                        : Theme.of(context).scaffoldBackgroundColor,
                    borderRadius: BorderRadius.circular(12),
                    border: isCurrentUser 
                        ? Border.all(color: Theme.of(context).colorScheme.primary, width: 2)
                        : null,
                  ),
                  child: Column(
                    children: [
                      if (isWinner)
                        const Icon(Icons.emoji_events, color: Colors.amber, size: 20),
                      Text(
                        isCurrentUser ? 'You' : (playerData['name'] ?? 'Opponent'),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isWinner ? Colors.green : null,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${playerData['score'] ?? 0}',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: isWinner ? Colors.green : Theme.of(context).colorScheme.primary,
                        ),
                      ),
                      Text(
                        'points',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.timer_outlined, size: 14, color: Theme.of(context).hintColor),
                          const SizedBox(width: 4),
                          Text(
                            '${playerData['timeTaken'] ?? 0}s',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).hintColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
