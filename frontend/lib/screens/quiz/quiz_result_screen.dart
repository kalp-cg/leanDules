import 'package:flutter/material.dart';

class QuizResultScreen extends StatelessWidget {
  final int totalQuestions;
  final int attempted;
  final int correct;
  final int wrong;
  final int skipped;

  const QuizResultScreen({
    super.key,
    required this.totalQuestions,
    required this.attempted,
    required this.correct,
    required this.wrong,
    required this.skipped,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              Text(
                'Quiz Completed!',
                textAlign: TextAlign.center,
                style: Theme.of(
                  context,
                ).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Here is how you performed',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.color?.withValues(alpha: 0.7),
                ),
              ),
              const SizedBox(height: 48),

              // Stats Grid
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.5,
                  children: [
                    _buildStatCard(
                      context,
                      'Total Questions',
                      totalQuestions.toString(),
                      Colors.blue,
                      Icons.quiz,
                    ),
                    _buildStatCard(
                      context,
                      'Attempted',
                      attempted.toString(),
                      Colors.orange,
                      Icons.edit,
                    ),
                    _buildStatCard(
                      context,
                      'Correct',
                      correct.toString(),
                      Colors.green,
                      Icons.check_circle,
                    ),
                    _buildStatCard(
                      context,
                      'Wrong',
                      wrong.toString(),
                      Theme.of(context).colorScheme.error,
                      Icons.cancel,
                    ),
                    _buildStatCard(
                      context,
                      'Skipped',
                      skipped.toString(),
                      Colors.grey,
                      Icons.skip_next,
                    ),
                  ],
                ),
              ),

              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Close result screen
                  Navigator.pop(
                    context,
                  ); // Close quiz screen (if pushed on top) or handle navigation
                  // Depending on navigation stack, we might need to pop until home
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  'Back to Home',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String label,
    String value,
    Color color,
    IconData icon,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(
                context,
              ).textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }
}
