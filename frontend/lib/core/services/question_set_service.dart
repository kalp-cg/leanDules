import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

class QuestionSetService {
  /// Get access token from storage
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('accessToken');
  }

  /// Get all question sets (public + user's own)
  Future<List<Map<String, dynamic>>> getQuestionSets({
    String? visibility,
    int? authorId,
  }) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      var url = '${ApiConstants.baseUrl}/question-sets';
      final queryParams = <String>[];

      if (visibility != null) queryParams.add('visibility=$visibility');
      if (authorId != null) queryParams.add('authorId=$authorId');

      if (queryParams.isNotEmpty) {
        url += '?${queryParams.join('&')}';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['data']);
      } else {
        throw Exception('Failed to load question sets');
      }
    } catch (e) {
      print('Error getting question sets: $e');
      rethrow;
    }
  }

  /// Get question set by ID with all questions
  Future<Map<String, dynamic>> getQuestionSetById(int id) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/question-sets/$id'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to load question set');
      }
    } catch (e) {
      print('Error getting question set: $e');
      rethrow;
    }
  }

  /// Create new question set
  Future<Map<String, dynamic>> createQuestionSet({
    required String name,
    String? description,
    required List<int> questionIds,
    String visibility = 'private',
  }) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/question-sets'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'name': name,
          'description': description,
          'questionIds': questionIds,
          'visibility': visibility,
        }),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to create question set');
      }
    } catch (e) {
      print('Error creating question set: $e');
      rethrow;
    }
  }

  /// Update question set
  Future<Map<String, dynamic>> updateQuestionSet(
    int id, {
    String? name,
    String? description,
    String? visibility,
  }) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      final body = <String, dynamic>{};
      if (name != null) body['name'] = name;
      if (description != null) body['description'] = description;
      if (visibility != null) body['visibility'] = visibility;

      final response = await http.put(
        Uri.parse('${ApiConstants.baseUrl}/question-sets/$id'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to update question set');
      }
    } catch (e) {
      print('Error updating question set: $e');
      rethrow;
    }
  }

  /// Delete question set
  Future<void> deleteQuestionSet(int id) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.delete(
        Uri.parse('${ApiConstants.baseUrl}/question-sets/$id'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete question set');
      }
    } catch (e) {
      print('Error deleting question set: $e');
      rethrow;
    }
  }

  /// Clone question set
  Future<Map<String, dynamic>> cloneQuestionSet(int id) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/question-sets/$id/clone'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return data['data'];
      } else {
        throw Exception('Failed to clone question set');
      }
    } catch (e) {
      print('Error cloning question set: $e');
      rethrow;
    }
  }
}
