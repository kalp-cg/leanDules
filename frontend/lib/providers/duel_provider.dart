import 'package:flutter_riverpod/flutter_riverpod.dart';
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
      print('Duel started: $data');
      state = AsyncValue.data(data);
    });

    _socketService.on('challenge:started', (data) {
      print('Challenge started: $data');
      state = AsyncValue.data(data);
    });

    _socketService.on('duel:room_created', (data) {
      print('Room created: $data');
      _ref.read(roomCodeProvider.notifier).state = data['roomId'];
    });

    _socketService.on('duel:join_room_request', (data) {
      print('Join room request: $data');
      _socketService.emit('duel:join_room_ack', {'roomId': data['roomId']});
    });

    _socketService.on('duel:error', (data) {
      print('Duel Error: $data');
      // Handle error (maybe show snackbar via a global listener or state)
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

  Future<void> sendChallenge(int opponentId, int categoryId) async {
    state = AsyncValue.loading();
    try {
      // 1. Create Challenge via API
      final duelData = await _duelService.createDuelChallenge(
        opponentId,
        categoryId,
      );

      // 2. Send Socket Invite - REMOVED
      // The API call triggers the notification and socket event from backend.

      // We don't set state to data yet, we wait for acceptance or just show "Waiting..."
      // But for now, let's just keep loading or set a "waiting" state if we had one.
      // The socket 'duel:started' or 'duel:accepted' will eventually trigger the game.
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> startDuel(int categoryId) async {
    state = AsyncValue.loading();
    try {
      final duelData = await _duelService.startDuel(categoryId);
      state = AsyncValue.data(duelData);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void setDuelData(Map<String, dynamic> data) {
    state = AsyncValue.data(data);
  }

  Future<void> submitAnswer(
    int duelId,
    int questionId,
    String selectedOption,
  ) async {
    await _duelService.submitAnswer(duelId, questionId, selectedOption);
  }

  void reset() {
    state = AsyncValue.data(null);
  }
}
