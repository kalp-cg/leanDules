import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/duel_provider.dart';

class DuelScreen extends ConsumerStatefulWidget {
  const DuelScreen({super.key});

  @override
  ConsumerState<DuelScreen> createState() => _DuelScreenState();
}

class _DuelScreenState extends ConsumerState<DuelScreen> {
  int _currentQuestionIndex = 0;
  String? _selectedOption;
  bool _answered = false;

  @override
  Widget build(BuildContext context) {
    final duelState = ref.watch(duelStateProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        title: Text('Duel', style: Theme.of(context).textTheme.titleLarge),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: duelState.when(
          data: (duelData) {
            if (duelData == null) {
              return Center(
                child: Text(
                  'Initializing Duel...',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(
                      context,
                    ).textTheme.bodyMedium?.color?.withValues(alpha: 0.5),
                  ),
                ),
              );
            }

            final questions = duelData['questions'] as List<dynamic>;
            if (_currentQuestionIndex >= questions.length) {
              Future.microtask(
                () => Navigator.pushReplacementNamed(context, '/result'),
              );
              return const SizedBox.shrink();
            }

            final question = questions[_currentQuestionIndex];

            return Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (_currentQuestionIndex + 1) / questions.length,
                      backgroundColor: Theme.of(
                        context,
                      ).dividerColor.withValues(alpha: 0.2),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Theme.of(context).colorScheme.primary,
                      ),
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Question Counter
                  Text(
                    'Question ${_currentQuestionIndex + 1}/${questions.length}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Question Text
                  Text(
                    question['questionText'] ?? 'Question text missing',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Options
                  ...['A', 'B', 'C', 'D'].map((option) {
                    final text = question['option$option'] ?? '';
                    final isSelected = _selectedOption == option;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: InkWell(
                        onTap: _answered
                            ? null
                            : () {
                                setState(() {
                                  _selectedOption = option;
                                });
                              },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Theme.of(
                                    context,
                                  ).colorScheme.primary.withValues(alpha: 0.2)
                                : Theme.of(context).cardTheme.color,
                            border: Border.all(
                              color: isSelected
                                  ? Theme.of(context).colorScheme.primary
                                  : Theme.of(context).dividerColor,
                              width: 2,
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
                                  color: isSelected
                                      ? Theme.of(context).colorScheme.primary
                                      : Theme.of(
                                          context,
                                        ).dividerColor.withValues(alpha: 0.2),
                                  shape: BoxShape.circle,
                                ),
                                child: Text(
                                  option,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isSelected
                                        ? Theme.of(
                                            context,
                                          ).colorScheme.onPrimary
                                        : Theme.of(context)
                                              .textTheme
                                              .bodyMedium
                                              ?.color
                                              ?.withValues(alpha: 0.5),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Text(
                                  text,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: isSelected
                                        ? Theme.of(context).colorScheme.primary
                                        : Theme.of(
                                            context,
                                          ).textTheme.bodyLarge?.color,
                                    fontWeight: isSelected
                                        ? FontWeight.w600
                                        : FontWeight.normal,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),

                  const Spacer(),

                  // Action Button
                  SizedBox(
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _selectedOption == null
                          ? null
                          : () {
                              if (_answered) {
                                setState(() {
                                  _currentQuestionIndex++;
                                  _selectedOption = null;
                                  _answered = false;
                                });
                              } else {
                                ref
                                    .read(duelStateProvider.notifier)
                                    .submitAnswer(
                                      duelData['id'],
                                      question['id'],
                                      _selectedOption!,
                                    );
                                setState(() {
                                  _answered = true;
                                });
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        disabledBackgroundColor: Theme.of(
                          context,
                        ).disabledColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: Text(
                        _answered ? 'Next Question' : 'Submit Answer',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _selectedOption == null
                              ? Theme.of(
                                  context,
                                ).colorScheme.onSurface.withValues(alpha: 0.3)
                              : Theme.of(context).colorScheme.onPrimary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(color: Color(0xFF6C63FF)),
          ),
          error: (err, stack) => Center(
            child: Text(
              'Error: $err',
              style: const TextStyle(color: Colors.redAccent),
            ),
          ),
        ),
      ),
    );
  }
}
