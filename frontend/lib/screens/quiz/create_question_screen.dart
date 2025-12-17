import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/topic_service.dart';
import '../../providers/questions_provider.dart';
import '../../widgets/custom_text_field.dart';

final topicsProvider = FutureProvider<List<dynamic>>((ref) async {
  final service = TopicService();
  final topics = await service.getTopics();
  return topics;
});

final difficultiesProvider = FutureProvider<List<dynamic>>((ref) async {
  // In a real app we might fetch this, but for now matching PracticeScreen hardcoded + IDs
  // Assuming Backend expects ID 1=Easy, 2=Medium, 3=Hard based on seed data
  // or strings. The API test script used difficultyId: 2.
  // Actually, let's verify if we need IDs or names.
  // Test script: "difficultyId": 2
  // So we need to map names to IDs.
  return [
    {'id': 1, 'name': 'EASY'},
    {'id': 2, 'name': 'MEDIUM'},
    {'id': 3, 'name': 'HARD'}
  ];
});

class CreateQuestionScreen extends ConsumerStatefulWidget {
  const CreateQuestionScreen({super.key});

  @override
  ConsumerState<CreateQuestionScreen> createState() => _CreateQuestionScreenState();
}

class _CreateQuestionScreenState extends ConsumerState<CreateQuestionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _questionController = TextEditingController();
  final _optionAController = TextEditingController();
  final _optionBController = TextEditingController();
  final _optionCController = TextEditingController();
  final _optionDController = TextEditingController();
  
  String? _selectedCorrectOption;
  int? _selectedTopicId;
  int? _selectedDifficultyId;

  final List<String> _options = ['A', 'B', 'C', 'D'];

  @override
  void dispose() {
    _questionController.dispose();
    _optionAController.dispose();
    _optionBController.dispose();
    _optionCController.dispose();
    _optionDController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedTopicId == null || _selectedDifficultyId == null || _selectedCorrectOption == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please select all dropdown fields'), backgroundColor: Colors.red),
        );
        return;
      }

      final success = await ref.read(createQuestionControllerProvider.notifier).createQuestion(
        questionText: _questionController.text,
        optionA: _optionAController.text,
        optionB: _optionBController.text,
        optionC: _optionCController.text,
        optionD: _optionDController.text,
        correctOption: _selectedCorrectOption!,
        categoryId: _selectedTopicId!,
        difficultyId: _selectedDifficultyId!,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Question created successfully!'), backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      } else if (mounted) {
         final error = ref.read(createQuestionControllerProvider).error;
         ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $error'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final topicsAsync = ref.watch(topicsProvider);
    final difficultiesAsync = ref.watch(difficultiesProvider);
    final state = ref.watch(createQuestionControllerProvider);
    final isLoading = state.isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Contribute Question'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Help grow the knowledge base by adding a new question!',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              CustomTextField(
                label: 'Question',
                hint: 'Enter your question here...',
                controller: _questionController,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              
              // Topics Dropdown
              Text('Topic', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              topicsAsync.when(
                data: (topics) => DropdownButtonFormField<int>(
                  value: _selectedTopicId,
                  items: topics.map<DropdownMenuItem<int>>((t) {
                    return DropdownMenuItem<int>(
                      value: t['id'],
                      child: Text(t['name']),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedTopicId = val),
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                  ),
                ),
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text('Error loading topics'),
              ),
              const SizedBox(height: 16),

              // Difficulty Dropdown
              Text('Difficulty', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
               difficultiesAsync.when(
                data: (diffs) => DropdownButtonFormField<int>(
                  value: _selectedDifficultyId,
                  items: diffs.map<DropdownMenuItem<int>>((d) {
                    return DropdownMenuItem<int>(
                      value: d['id'],
                      child: Text(d['name']),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedDifficultyId = val),
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                  ),
                ),
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text('Error loading difficulties'),
              ),
              const SizedBox(height: 24),

              // Options
              CustomTextField(
                label: 'Option A',
                controller: _optionAController,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                prefixIcon: Icons.looks_one,
              ),
              const SizedBox(height: 12),
              CustomTextField(
                label: 'Option B',
                controller: _optionBController,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                prefixIcon: Icons.looks_two,
              ),
              const SizedBox(height: 12),
              CustomTextField(
                label: 'Option C',
                 controller: _optionCController,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                prefixIcon: Icons.looks_3,
              ),
              const SizedBox(height: 12),
              CustomTextField(
                label: 'Option D',
                controller: _optionDController,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                prefixIcon: Icons.looks_4,
              ),
              const SizedBox(height: 16),

              // Correct Option
              Text('Correct Answer', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedCorrectOption,
                 items: _options.map((o) => DropdownMenuItem(value: o, child: Text('Option $o'))).toList(),
                onChanged: (val) => setState(() => _selectedCorrectOption = val),
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                ),
              ),

              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: isLoading
                    ? const SizedBox(
                        height: 24, 
                        width: 24, 
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                      )
                    : const Text('Submit Question', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
