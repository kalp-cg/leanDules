import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/foundation.dart';
import '../core/services/duel_service.dart';
import '../core/services/socket_service.dart';

final categoriesProvider = FutureProvider<List<dynamic>>((ref) async {
  final duelService = ref.watch(duelServiceProvider);
  return duelService.getCategories();
});

final roomCodeProvider = StateProvider<String?>((ref) => null);

final duelStateProvider =
    StateNotifierProvider<DuelNotifier, AsyncValue<Map<String, dynamic>?>>((
      ref,
    ) {
      final duelService = ref.watch(duelServiceProvider);
      final socketService = ref.watch(socketServiceProvider);
      return DuelNotifier(duelService, socketService, ref);
    });

class DuelNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>?>> {
  final DuelService _duelService;
  final SocketService _socketService;
  final Ref _ref;

  DuelNotifier(this._duelService, this._socketService, this._ref)
    : super(AsyncValue.data(null)) {
    _setupSocketListeners();
  }

  void _setupSocketListeners() {
    _socketService.on('duel:started', (data) {
      debugPrint('Duel started: $data');
      // Ensure required fields are properly initialized
      final duelData = Map<String, dynamic>.from(data);
      duelData['id'] = duelData['duelId'] ?? duelData['id'];
      duelData['currentQuestionIndex'] = 0;
      duelData['isOpponentAnswered'] = false;
      duelData['questionResult'] = null;
      
      // CRITICAL: Set roomCode so socket is used for answer submission
      final roomId = duelData['roomId']?.toString();
      if (roomId != null) {
        _ref.read(roomCodeProvider.notifier).state = roomId;
        debugPrint('✅ Room code set: $roomId');
      }
      
      state = AsyncValue.data(duelData);
    });

    // ASYNC FLOW: Immediate answer result for THIS player
    _socketService.on('duel:answer_result', (data) {
      debugPrint('Answer result: $data');
      final currentData = state.value;
      if (currentData != null) {
        state = AsyncValue.data({
          ...currentData,
          'lastAnswerResult': data,
          'currentScore': data['currentScore'],
        });
      }
    });

    // ASYNC FLOW: Next question for THIS player (independent progression)
    _socketService.on('duel:next_question', (data) {
      debugPrint('Next Question: $data');
      final currentData = state.value;
      if (currentData != null) {
        state = AsyncValue.data({
          ...currentData,
          'currentQuestionIndex': data['questionIndex'],
          'isOpponentAnswered': false,
          'questionResult': null,
          'lastAnswerResult': null, // Clear previous result
        });
      }
    });

    // ASYNC FLOW: Player finished all questions
    _socketService.on('duel:player_finished', (data) {
      debugPrint('Player finished: $data');
      final currentData = state.value;
      if (currentData != null) {
        state = AsyncValue.data({
          ...currentData,
          'playerFinished': true,
          'currentScore': data['yourScore'],
        });
      }
    });

    _socketService.on('duel:question', (data) {
      debugPrint('New Question: $data');
      // Update state with current question index and reset answered local state if needed
      final currentData = state.value;
      if (currentData != null) {
        state = AsyncValue.data({
          ...currentData,
          'currentQuestionIndex': data['questionIndex'],
          'isOpponentAnswered': false,
          'questionResult': null,
        });
      }
    });

    _socketService.on('duel:opponent_answered', (data) {
      debugPrint('Opponent answered: $data');
      final currentData = state.value;
      if (currentData != null) {
        state = AsyncValue.data({
          ...currentData,
          'isOpponentAnswered': true,
          'opponentProgress': data['opponentProgress'],
        });
      }
    });

    _socketService.on('duel:question_result', (data) {
      debugPrint('Question result: $data');
      final currentData = state.value;
      if (currentData != null) {
        state = AsyncValue.data({
          ...currentData,
          'questionResult': data['results'],
          'currentScores': data['currentScores'],
        });
      }
    });

    _socketService.on('duel:completed', (data) {
      debugPrint('Duel completed: $data');
      final currentData = state.value;
      if (currentData != null) {
        state = AsyncValue.data({
          ...currentData,
          'status': 'completed',
          'finalResults': data,
        });
      }
    });

    _socketService.on('duel:room_created', (data) {
      debugPrint('Room created: $data');
      _ref.read(roomCodeProvider.notifier).state = data['roomId'];
    });

    _socketService.on('duel:join_room_request', (data) {
      debugPrint('Join room request: $data');
      _socketService.emit('duel:join_room_ack', {'roomId': data['roomId']});
    });

    _socketService.on('duel:rematch_offered', (data) {
      debugPrint('Rematch offered: $data');
      final currentData = state.value;
      if (currentData != null) {
        state = AsyncValue.data({
          ...currentData,
          'rematchOfferedBy': data['offeredBy'],
          'rematchOfferedByName': data['offeredByName'],
        });
      }
    });

    _socketService.on('duel:error', (data) {
      debugPrint('Duel Error: $data');
    });
  }

  void createRoom(int categoryId) {
    _socketService.emit('duel:create_room', {
      'categoryId': categoryId,
      'difficultyId': 1,
    });
  }

  void joinRoom(String roomId) {
    _socketService.emit('duel:join_room', {'roomId': roomId});
  }

  void requestRematch() {
    _socketService.emit('duel:rematch_request', {});
    final currentData = state.value;
    if (currentData != null) {
      state = AsyncValue.data({
        ...currentData,
        'rematchRequested': true,
      });
    }
  }

  void acceptRematch() {
    _socketService.emit('duel:rematch_accept', {});
  }

  Future<void> sendChallenge(int opponentId, int categoryId) async {
    state = AsyncValue.loading();
    try {
      await _duelService.createDuelChallenge(opponentId, categoryId);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void joinQueue(int categoryId) {
    state = AsyncValue.loading();
    _socketService.emit('duel:join_queue', {'categoryId': categoryId});
    // State will be updated when 'duel:started' is received
  }
  
  void leaveQueue() {
    _socketService.emit('duel:leave_queue', {});
    state = AsyncValue.data(null);
  }

  void setDuelData(Map<String, dynamic> data) {
    state = AsyncValue.data(data);
  }

  Future<void> submitAnswer(
    int duelId,
    int questionId,
    String? selectedOption, {
    int timeUsed = 0,
  }) async {
    // If we are in a socket-managed room, use socket to submit
    // Room ID is usually managed via roomCodeProvider or within duelData
    final roomId = _ref.read(roomCodeProvider);
    if (roomId != null) {
      _socketService.emit('duel:submit_answer', {
        'questionId': questionId,
        'answer': selectedOption, // Can be null for skipped
        'timeUsed': timeUsed,
      });
    } else {
      // Fallback to REST if not in a real-time room
      await _duelService.submitAnswer(duelId, questionId, selectedOption ?? '');
    }
  }

  @override
  void dispose() {
    debugPrint('🧹 Disposing DuelNotifier: Cleaning up socket listeners');
    _cleanupSocketListeners();
    super.dispose();
  }

  void _cleanupSocketListeners() {
    final events = [
      'duel:started',
      'duel:question',
      'duel:opponent_answered',
      'duel:question_result',
      'duel:completed',
      'duel:room_created',
      'duel:join_room_request',
      'duel:rematch_offered',
      'duel:error'
    ];
    
    for (final event in events) {
      _socketService.off(event);
    }
  }

  void reset() {
    state = AsyncValue.data(null);
    _ref.read(roomCodeProvider.notifier).state = null;
  }
}
