import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/services/questions_service.dart';

final questionsServiceProvider = Provider<QuestionsService>((ref) {
  return QuestionsService();
});

final createQuestionControllerProvider = StateNotifierProvider<CreateQuestionController, AsyncValue<void>>((ref) {
  return CreateQuestionController(ref.watch(questionsServiceProvider));
});

class CreateQuestionController extends StateNotifier<AsyncValue<void>> {
  final QuestionsService _questionsService;

  CreateQuestionController(this._questionsService) : super(const AsyncValue.data(null));

  Future<bool> createQuestion({
    required String questionText,
    required String optionA,
    required String optionB,
    required String optionC,
    required String optionD,
    required String correctOption,
    required int categoryId,
    required int difficultyId,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _questionsService.createQuestion({
        'questionText': questionText,
        'optionA': optionA,
        'optionB': optionB,
        'optionC': optionC,
        'optionD': optionD,
        'correctOption': correctOption,
        'categoryId': categoryId,
        'difficultyId': difficultyId,
        'type': 'MCQ', // Default type
      });
      state = const AsyncValue.data(null);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
}
