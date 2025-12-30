import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/duel_provider.dart';
import '../../core/services/socket_service.dart';

import '../chat/general_chat_screen.dart';
import '../../core/services/saved_service.dart';

class DuelScreen extends ConsumerStatefulWidget {
  const DuelScreen({super.key});

  @override
  ConsumerState<DuelScreen> createState() => _DuelScreenState();
}

class _DuelScreenState extends ConsumerState<DuelScreen> {
  String? _selectedOption;
  bool _answered = false;
  // Local tracking for save state during this session (per question)
  // Ideally this should be part of question data, but for now we default to false/unknown
  // or just let user toggle it (server handles check).
  bool _isSaved = false; 
  int? _lastShownExplanationIndex; // Track which question we showed explanation for

  final Stopwatch _stopwatch = Stopwatch();

  @override
  void initState() {
    super.initState();
    _stopwatch.start();
    
    // Listen for state changes to handle async flow
    WidgetsBinding.instance.addPostFrameCallback((_) {
      int? lastQuestionIndex;
      
      ref.listenManual(duelStateProvider, (previous, next) {
        next.whenData((duelData) {
          if (duelData == null) return;
          
          final currentIndex = duelData['currentQuestionIndex'] ?? 0;
          final playerFinished = duelData['playerFinished'] == true;
          final status = duelData['status'];
          
          // ASYNC FLOW: Reset when question index changes (new question arrived)
          if (lastQuestionIndex != null && currentIndex != lastQuestionIndex) {
            setState(() {
              _answered = false;
              _selectedOption = null;
              _isSaved = false;
            });
            _stopwatch.reset();
            _stopwatch.start();
          }
          lastQuestionIndex = currentIndex;
          
          // If player finished all questions, navigate to results immediately
          if (playerFinished && status != 'completed') {
            Future.microtask(() {
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/result', arguments: duelData);
              }
            });
          }
          
          // If duel completed, navigate to results
          if (status == 'completed') {
            Future.microtask(() {
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/result', arguments: duelData['finalResults']);
              }
            });
          }
        });
      });
    });
  }
  
  // Reset saved state when loading new question (this needs to be called where question index changes)
  // However, build() handles new question rendering.
  // We can just rely on the user tapping it.
  
  Future<void> _toggleSave(int questionId) async {
    try {
      final result = await ref.read(savedServiceProvider).toggleSave(questionId);
      final isSaved = result['isSaved'] as bool;
      setState(() {
        _isSaved = isSaved;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isSaved ? 'Question saved to Vault' : 'Question removed from Vault'),
            duration: const Duration(seconds: 1),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e')),
        );
      }
    }
  }

  void _askDoubt(Map<String, dynamic> question) {
    if (!mounted) return;
    
    final text = "I have a doubt regarding this question:\n\n"
        "**${question['questionText']}**\n\n"
        "Options:\n${(question['options'] as List).map((o) => "- ${o['text']}").join('\n')}";

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => GeneralChatScreen(initialMessage: text),
      ),
    );
  }

  void _clearSelection() {
    if (_answered) return;
    setState(() {
      _selectedOption = null;
    });
  }

  void _skipQuestion(String duelId, int questionId) {
    if (_answered) return;
    // Skip sends null for answer - backend treats this as wrong
    final timeUsed = _stopwatch.elapsedMilliseconds ~/ 1000;
    ref
        .read(duelStateProvider.notifier)
        .submitAnswer(
          int.parse(duelId),
          questionId,
          null, // Send null for skipped
          timeUsed: timeUsed,
        );
    setState(() {
      _answered = true;
    });
  }

  void _endDuel() {
    // Show confirmation dialog before leaving
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('End Duel?'),
        content: const Text(
          'Are you sure you want to surrender this duel? You will lose.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Emit leave/surrender event ideally, for now just pop
              final socketService = ref.read(socketServiceProvider);
              socketService.emit('duel:leave', {}); // Matches backend handler
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Close screen
            },
            child: Text(
              'Surrender',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ],
      ),
    );
  }

  void _showExplanation(Map<String, dynamic> question, bool wasCorrect) {
    final explanation = question['explanation'] ?? question['explanationText'];
    if (explanation == null || explanation.toString().isEmpty) return;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: wasCorrect 
                        ? Colors.green.withValues(alpha: 0.15)
                        : Colors.orange.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    wasCorrect ? Icons.check_circle_rounded : Icons.lightbulb_rounded,
                    color: wasCorrect ? Colors.green : Colors.orange,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    wasCorrect ? 'Great job!' : 'Explanation',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                explanation.toString(),
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  height: 1.5,
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Got it!', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final duelState = ref.watch(duelStateProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      // Enhanced Gradient Background for Premium Feel
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Theme.of(context).scaffoldBackgroundColor, Colors.black],
          ),
        ),
        child: SafeArea(
          child: duelState.when(
            data: (duelData) {
              if (duelData == null) {
                return _buildLoadingState('Initializing Duel...');
              }

              // Handle completion
              if (duelData['status'] == 'completed') {
                Future.microtask(
                  () => Navigator.pushReplacementNamed(
                    context,
                    '/result',
                    arguments: duelData['finalResults'],
                  ),
                );
                return const SizedBox.shrink();
              }

              final questions = duelData['questions'] as List<dynamic>;
              final currentQuestionIndex =
                  duelData['currentQuestionIndex'] ?? 0;

              if (currentQuestionIndex >= questions.length) {
                return _buildLoadingState('Calculating results...');
              }

              final question = questions[currentQuestionIndex];
              final questionResult = duelData['questionResult'];
              final isOpponentAnswered =
                  duelData['isOpponentAnswered'] ?? false;
              
              // Note: We need to reset _isSaved when question changes, 
              // but we don't have easy previousIndex here. 
              // For now, the button acts as a toggle. 
              // Ideally, the backend would tell us "saved: true" in question object.

              return Column(
                children: [
                  // Custom AppBar
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Duel Mode',
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              icon: const Icon(Icons.share_rounded),
                              tooltip: 'Share to Chat',
                              onPressed: () => _askDoubt(question),
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            IconButton(
                              icon: Icon(_isSaved ? Icons.bookmark : Icons.bookmark_border_rounded),
                              tooltip: 'Save to Vault',
                              onPressed: () => _toggleSave(question['id']),
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ],
                        ),
                        TextButton(
                          onPressed: _endDuel,
                          child: Text(
                            'End Duel',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.error,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Progress and Status
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value:
                                (currentQuestionIndex + 1) / questions.length,
                            backgroundColor: Theme.of(
                              context,
                            ).dividerColor.withValues(alpha: 0.2),
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Theme.of(context).colorScheme.primary,
                            ),
                            minHeight: 8,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Q ${currentQuestionIndex + 1}/${questions.length}',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            _buildOpponentStatus(isOpponentAnswered),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Question Content
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            question['questionText'] ?? 'Question text missing',
                            style: Theme.of(context).textTheme.headlineMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  height: 1.3,
                                  fontSize: 22,
                                ),
                          ),
                          const SizedBox(height: 32),
                          ...((question['options'] as List<dynamic>?) ?? [])
                              .asMap()
                              .entries
                              .map((entry) {
                                final index = entry.key;
                                final optionData = entry.value;
                                // Use letter A, B, C, D for option ID
                                final optionLetter = String.fromCharCode(65 + index); // A=65
                                final text = optionData['text']?.toString() ?? '';
                                return _buildOption(
                                  optionLetter,
                                  text,
                                  questionResult,
                                  question,
                                );
                              })
                              .toList(),
                        ],
                      ),
                    ),
                  ),

                  // Action Buttons
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        if (!_answered && questionResult == null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                TextButton.icon(
                                  onPressed: _selectedOption != null
                                      ? _clearSelection
                                      : null,
                                  icon: const Icon(Icons.clear_all),
                                  label: const Text('Clear'),
                                  style: TextButton.styleFrom(
                                    foregroundColor: Theme.of(context)
                                        .colorScheme
                                        .onSurface
                                        .withValues(alpha: 0.6),
                                  ),
                                ),
                                TextButton.icon(
                                  onPressed: () => _skipQuestion(
                                    duelData['id'],
                                    question['id'],
                                  ),
                                  icon: const Icon(Icons.skip_next),
                                  label: const Text('Skip'),
                                  style: TextButton.styleFrom(
                                    foregroundColor: Theme.of(context)
                                        .colorScheme
                                        .onSurface
                                        .withValues(alpha: 0.6),
                                  ),
                                ),
                              ],
                            ),
                          ),

                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _selectedOption == null || _answered
                                ? null
                                : () {
                                    final timeUsed =
                                        _stopwatch.elapsedMilliseconds ~/ 1000;
                                    ref
                                        .read(duelStateProvider.notifier)
                                        .submitAnswer(
                                          int.parse(duelData['id'].toString()),
                                          question['id'],
                                          _selectedOption!,
                                          timeUsed: timeUsed,
                                        );
                                    setState(() {
                                      _answered = true;
                                    });
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Theme.of(
                                context,
                              ).colorScheme.primary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: _answered ? 0 : 4,
                            ),
                            child: _isProcessing(duelData)
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(
                                    _answered
                                        ? 'Waiting for opponent...'
                                        : 'Submit Answer',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
            loading: () => _buildLoadingState('Loading Duel...'),
            error: (err, stack) => Center(
              child: Text(
                'Error: $err',
                style: const TextStyle(color: Colors.red),
              ),
            ),
          ),
        ),
      ),
    );
  }

  bool _isProcessing(Map<String, dynamic> duelData) {
    return _answered && duelData['questionResult'] == null;
  }

  Widget _buildLoadingState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(message, style: TextStyle(color: Theme.of(context).hintColor)),
        ],
      ),
    );
  }

  Widget _buildOpponentStatus(bool isReady) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isReady
            ? Colors.green.withValues(alpha: 0.1)
            : Theme.of(context).dividerColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isReady ? Colors.green : Theme.of(context).dividerColor,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isReady ? Icons.check_circle : Icons.hourglass_empty,
            size: 14,
            color: isReady ? Colors.green : Theme.of(context).hintColor,
          ),
          const SizedBox(width: 4),
          Text(
            isReady ? 'Opponent Ready' : 'Opponent Thinking...',
            style: TextStyle(
              fontSize: 12,
              color: isReady ? Colors.green : Theme.of(context).hintColor,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOption(
    String option,
    String text,
    Map<String, dynamic>? result,
    Map<String, dynamic> question,
  ) {
    final isSelected = _selectedOption == option;
    Color borderColor = Theme.of(context).dividerColor;
    Color bgColor =
        Theme.of(context).cardTheme.color?.withValues(alpha: 0.5) ??
        Colors.transparent; // Glassy

    if (result != null) {
      final correctOption = question['correctOption'];
      if (option == correctOption) {
        borderColor = Colors.green;
        bgColor = Colors.green.withValues(alpha: 0.2);
      } else if (isSelected) {
        borderColor = Colors.red;
        bgColor = Colors.red.withValues(alpha: 0.2);
      }
    } else if (isSelected) {
      borderColor = Theme.of(context).colorScheme.primary;
      bgColor = Theme.of(context).colorScheme.primary.withValues(alpha: 0.2);
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: _answered || result != null
            ? null
            : () => setState(() => _selectedOption = option),
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: bgColor,
            border: Border.all(
              color: borderColor,
              width: isSelected || result != null ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color:
                      isSelected ||
                          (result != null &&
                              option == question['correctOption'])
                      ? borderColor
                      : Colors.transparent,
                  border: Border.all(color: borderColor),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  option,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color:
                        isSelected ||
                            (result != null &&
                                option == question['correctOption'])
                        ? Colors.white
                        : Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  text,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: isSelected
                        ? FontWeight.bold
                        : FontWeight.normal,
                    color: Theme.of(context).textTheme.bodyLarge?.color,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
