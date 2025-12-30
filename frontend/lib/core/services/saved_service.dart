import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_service.dart';

final savedServiceProvider = Provider<SavedService>((ref) {
  final apiService = ref.read(apiServiceProvider);
  return SavedService(apiService);
});

class SavedService {
  final ApiService _apiService;

  SavedService(this._apiService);

  Future<Map<String, dynamic>> toggleSave(int questionId) async {
    final response = await _apiService.client.post(
      '/saved/toggle',
      data: {'questionId': questionId},
    );
    // Response format: { message: "...", isSaved: true/false }
    return response.data;
  }

  Future<Map<String, dynamic>> getSavedQuestions({int page = 1, int limit = 20}) async {
    final response = await _apiService.client.get(
      '/saved?page=$page&limit=$limit',
    );
    // Response format: { data: [...], pagination: {...} }
    return response.data;
  }
}
