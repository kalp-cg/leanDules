import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';
import 'api_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AuthService(apiService.client);
});

class AuthService {
  final Dio _dio;

  AuthService(this._dio);

  Future<String?> login(String email, String password) async {
    try {
      debugPrint('📧 Attempting login for: $email');
      final response = await _dio.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );

      debugPrint('📥 Response status: ${response.statusCode}');

      // Check if response is successful
      if (response.data == null) {
        debugPrint('❌ No data in response');
        return 'No data received from server';
      }

      // Extract tokens from the response data
      final data = response.data['data'];
      if (data == null) {
        debugPrint('❌ No data field in response');
        return 'Invalid response format';
      }

      final accessToken = data['accessToken'];
      final refreshToken = data['refreshToken'];

      if (accessToken == null || refreshToken == null) {
        return 'Missing tokens in response';
      }

      // Save tokens
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', accessToken);
      await prefs.setString('refreshToken', refreshToken);

      debugPrint('✅ Tokens saved successfully');
      return null; // No error
    } on DioException catch (e) {
      debugPrint('❌ DioException: ${e.message}');
      if (e.response != null) {
        debugPrint('📦 Error Data: ${e.response?.data}');
        final message = e.response?.data['message'];
        if (message != null) return message.toString();
      }
      return 'Login failed: ${e.message}';
    } catch (e, stackTrace) {
      debugPrint('❌ Unexpected error: $e');
      debugPrint('Stack trace: $stackTrace');
      return 'An unexpected error occurred. Please try again.';
    }
  }

  Future<String?> register(
    String username,
    String email,
    String password,
    String fullName,
  ) async {
    try {
      final response = await _dio.post(
        ApiConstants.register,
        data: {
          'username': username,
          'email': email,
          'password': password,
          'fullName': fullName,
        },
      );

      // Check if response is successful
      if (response.data == null) {
        return 'No data received from server';
      }

      // Extract tokens from the response data
      final data = response.data['data'];
      if (data == null) {
        return 'Invalid response format';
      }

      final accessToken = data['accessToken'];
      final refreshToken = data['refreshToken'];

      if (accessToken == null || refreshToken == null) {
        return 'Missing tokens in response';
      }

      // Save tokens
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('accessToken', accessToken);
      await prefs.setString('refreshToken', refreshToken);

      return null;
    } on DioException catch (e) {
      return e.response?.data['message'] ?? 'Registration failed';
    } catch (e) {
      return 'An unexpected error occurred: $e';
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
    await prefs.remove('refreshToken');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('accessToken');
  }

  Future<String?> forgotPassword(String email) async {
    try {
      final response = await _dio.post(
        ApiConstants.forgotPassword,
        data: {'email': email},
      );

      if (response.data == null || response.data['success'] != true) {
        return 'Failed to send reset email';
      }

      return null; // Success
    } on DioException catch (e) {
      return e.response?.data['message'] ?? 'Failed to send reset email';
    } catch (e) {
      return 'An unexpected error occurred: $e';
    }
  }

  Future<String?> resetPassword(String token, String newPassword) async {
    try {
      final response = await _dio.post(
        ApiConstants.resetPassword,
        data: {'token': token, 'newPassword': newPassword},
      );

      if (response.data == null || response.data['success'] != true) {
        return 'Failed to reset password';
      }

      return null; // Success
    } on DioException catch (e) {
      return e.response?.data['message'] ?? 'Failed to reset password';
    } catch (e) {
      return 'An unexpected error occurred: $e';
    }
  }
}
