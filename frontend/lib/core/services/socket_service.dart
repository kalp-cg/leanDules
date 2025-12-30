import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

final socketServiceProvider = Provider<SocketService>((ref) {
  return SocketService();
});

class SocketService {
  io.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;
  io.Socket? get socket => _socket;

  Future<void> connect() async {
    if (_socket != null && _socket!.connected) return;

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('accessToken');

    if (token == null) return;

    // Extract base URL without /api
    final baseUrl = ApiConstants.baseUrl.replaceAll('/api', '');

    _socket = io.io(
      baseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      debugPrint('Socket connected');
      _isConnected = true;
    });

    _socket!.onDisconnect((_) {
      debugPrint('Socket disconnected');
      _isConnected = false;
    });

    _socket!.onError((data) => debugPrint('Socket error: $data'));
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _isConnected = false;
  }

  void emit(String event, dynamic data) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit(event, data);
    } else {
      debugPrint('Cannot emit $event: Socket not connected');
    }
  }

  void on(String event, Function(dynamic) handler) {
    _socket?.on(event, handler);
  }

  void off(String event) {
    _socket?.off(event);
  }

  // Duel-specific methods
  void joinDuel(int duelId) {
    emit('joinDuel', {'duelId': duelId});
  }

  void leaveDuel(int duelId) {
    emit('leaveDuel', {'duelId': duelId});
  }

  void submitDuelAnswer(int duelId, int questionId, dynamic answer) {
    emit('submitAnswer', {
      'duelId': duelId,
      'questionId': questionId,
      'answer': answer,
    });
  }

  void onDuelUpdate(Function(dynamic) handler) {
    on('duelUpdate', handler);
  }

  void onDuelFinished(Function(dynamic) handler) {
    on('duelFinished', handler);
  }

  void onOpponentAnswer(Function(dynamic) handler) {
    on('opponentAnswer', handler);
  }

  void onDuelStarted(Function(dynamic) handler) {
    on('duelStarted', handler);
  }

  /// Update user profile in socket (call after profile changes)
  void updateUserProfile({String? avatarUrl, String? fullName}) {
    emit('user:updateProfile', {
      'avatarUrl': avatarUrl,
      'fullName': fullName,
    });
  }
}
