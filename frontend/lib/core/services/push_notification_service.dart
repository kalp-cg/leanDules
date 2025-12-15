import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

class PushNotificationService {
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  /// Register device for push notifications
  Future<void> registerDevice(String deviceToken, String platform) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/notifications/register-device'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'token': deviceToken,
          'platform': platform, // 'ios', 'android', or 'web'
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to register device');
      }
    } catch (e) {
      print('Error registering device: $e');
      rethrow;
    }
  }

  /// Remove device token
  Future<void> removeDevice(String deviceToken) async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.delete(
        Uri.parse('${ApiConstants.baseUrl}/notifications/remove-device'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'token': deviceToken}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to remove device');
      }
    } catch (e) {
      print('Error removing device: $e');
      rethrow;
    }
  }

  /// Send test notification
  Future<void> sendTestNotification() async {
    try {
      final token = await _getToken();
      if (token == null) throw Exception('Not authenticated');

      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/notifications/test'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to send test notification');
      }
    } catch (e) {
      print('Error sending test notification: $e');
      rethrow;
    }
  }
}
