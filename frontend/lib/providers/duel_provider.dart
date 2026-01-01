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
    // ==================== DUEL EVENTS (Legacy/Custom Rooms) ====================
    _socketService.on('duel:started', (data) {
      debugPrint('Duel started: $data');
      _handleDuelStarted(data);
    });

    // ==================== CHALLENGE EVENTS (Instant Duels) ====================
    _socketService.on('challenge:started', (data) {
      debugPrint('Challenge started: $data');
      _handleDuelStarted(data);
    });

    // ASYNC FLOW: Immediate answer result for THIS player
    _socketService.on('duel:answer_result', (data) {
      debugPrint('Answer result: $data');
      _handleAnswerResult(data);
    });

    _socketService.on('challenge:answer_recorded', (data) {
      debugPrint('Challenge answer recorded: $data');
      // Map challenge answer data to provider format
      final resultData = {
        'isCorrect': data['isCorrect'],
        'correctAnswer': data['correctAnswer'],
        'currentScore': data['currentScore'],
      };
      
      _handleAnswerResult(resultData);
      
      // CRITICAL FIX: Also set questionResult so UI knows processing is done
      // For challenges, immediate feedback is allowed
      state = AsyncValue.data({
        ...?state.value,
        'questionResult': resultData,
        'currentScore': data['currentScore'],
        'lastAnswerResult': resultData,
      });
    });

    // ASYNC FLOW: Next question for THIS player (independent progression)
    _socketService.on('duel:next_question', (data) {
      debugPrint('Next Question: $data');
      _handleNextQuestion(data);
    });

    _socketService.on('challenge:next_question', (data) {
      debugPrint('Challenge Next Question: $data');
      _handleNextQuestion({
        'questionIndex':
            data['questionNumber'] - 1, // backend sends 1-based usually
        'question': data['question'],
      });
    });

    // ASYNC FLOW: Player finished all questions
    _socketService.on('duel:player_finished', (data) {
      debugPrint('Player finished: $data');
      _handlePlayerFinished(data);
    });

    _socketService.on('duel:question', (data) {
      debugPrint('New Question: $data');
      _handleNextQuestion(data);
    });

    _socketService.on('duel:opponent_answered', (data) {
      debugPrint('Opponent answered: $data');
      _handleOpponentAnswered(data);
    });

    _socketService.on('challenge:opponent_answered', (data) {
      debugPrint('Challenge opponent answered: $data');
      _handleOpponentAnswered({
        'opponentProgress':
            data['questionNumber'], // backend sends current question number
      });
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
      _handleDuelCompleted(data);
    });

    _socketService.on('challenge:completed', (data) {
      debugPrint('Challenge completed: $data');
      _handleDuelCompleted(data);
    });

    _socketService.on('duel:room_created', (data) {
      debugPrint('Room created: $data');
      _ref.read(roomCodeProvider.notifier).state = data['roomId']?.toString();
    });

    _socketService.on('duel:join_room_request', (data) {
      debugPrint('Join room request: $data');
      _socketService.emit('duel:join_room_ack', {'roomId': data['roomId']});
    });

    // Rematch feature removed

    _socketService.on('duel:error', (data) {
      debugPrint('Duel Error: $data');
    });

    _socketService.on('challenge:error', (data) {
      debugPrint('Challenge Error: $data');
    });
  }

  // Helper methods to handle shared logic
  void _handleDuelStarted(dynamic data) {
    // Ensure required fields are properly initialized
    final duelData = Map<String, dynamic>.from(data);
    duelData['id'] =
        duelData['duelId'] ?? duelData['challengeId'] ?? duelData['id'];
    duelData['currentQuestionIndex'] = 0;
    duelData['isOpponentAnswered'] = false;
    duelData['questionResult'] = null;

    // CRITICAL: Set roomCode so socket is used for answer submission
    // Convert roomId to String explicitly (backend may send as int)
    final roomIdRaw = duelData['roomId'];
    if (roomIdRaw != null) {
      final roomId = roomIdRaw is String ? roomIdRaw : roomIdRaw.toString();
      _ref.read(roomCodeProvider.notifier).state = roomId;
      debugPrint('✅ Room code set: $roomId');
    }

    state = AsyncValue.data(duelData);
  }

  void _handleAnswerResult(dynamic data) {
    final currentData = state.value;
    if (currentData != null) {
      state = AsyncValue.data({
        ...currentData,
        'lastAnswerResult': data,
        'currentScore': data['currentScore'] ?? currentData['currentScore'],
      });
    }
  }

  void _handleNextQuestion(dynamic data) {
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
  }

  void _handlePlayerFinished(dynamic data) {
    final currentData = state.value;
    if (currentData != null) {
      state = AsyncValue.data({
        ...currentData,
        'playerFinished': true,
        'currentScore': data['yourScore'],
      });
    }
  }

  void _handleOpponentAnswered(dynamic data) {
    final currentData = state.value;
    if (currentData != null) {
      state = AsyncValue.data({
        ...currentData,
        'isOpponentAnswered': true,
        'opponentProgress': data['opponentProgress'],
      });
    }
  }

  void _handleDuelCompleted(dynamic data) {
    final currentData = state.value;
    if (currentData != null) {
      state = AsyncValue.data({
        ...currentData,
        'status': 'completed',
        'finalResults': data,
      });
    }
  }

  void createRoom(int categoryId, {int questionCount = 7}) {
    _socketService.emit('duel:create_room', {
      'categoryId': categoryId,
      'difficultyId': 1,
      'questionCount': questionCount,
    });
  }

  void joinRoom(String roomId) {
    _socketService.emit('duel:join_room', {'roomId': roomId});
  }

  void loadDuel(int duelId) {
    _socketService.emit('duel:load', {'duelId': duelId});
  }

  // Rematch methods removed - feature simplified

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
      if (roomId.startsWith('challenge_')) {
        // Handle Instant Duel (Challenge Flow)
        // roomId format: challenge_{challengeId}
        final challengeId = int.tryParse(roomId.split('_')[1]) ?? duelId;

        _socketService.emit('challenge:answer', {
          'challengeId': challengeId,
          'questionId': questionId,
          'selectedAnswer': selectedOption,
          'timeTaken': timeUsed,
        });
      } else {
        // Handle Standard Duel Flow
        _socketService.emit('duel:submit_answer', {
          'questionId': questionId,
          'answer': selectedOption, // Can be null for skipped
          'timeUsed': timeUsed,
        });
      }
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
      'duel:error',
      'challenge:started',
      'challenge:answer_recorded',
      'challenge:next_question',
      'challenge:opponent_answered',
      'challenge:completed',
      'challenge:error',
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
