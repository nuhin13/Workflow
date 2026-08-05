// E00-T04 · diagnostic view model. Keeps transport and state out of widgets.

import 'package:flutter/foundation.dart';

import '../data/system_probe_repository.dart';

/// The four states the diagnostic screen can be in.
///
/// Modelled explicitly so the widget cannot forget one. "Loading" in particular
/// must be distinguishable from "idle", or a user taps twice and triggers two
/// increments while believing nothing happened.
enum SystemProbeStatus { idle, loading, success, failure }

@immutable
class SystemProbeState {
  const SystemProbeState({
    this.status = SystemProbeStatus.idle,
    this.visitCount,
    this.correlationId,
    this.messageKey,
  });

  final SystemProbeStatus status;
  final int? visitCount;
  final String? correlationId;
  final String? messageKey;

  bool get isBusy => status == SystemProbeStatus.loading;
}

class SystemProbeViewModel extends ChangeNotifier {
  SystemProbeViewModel({SystemProbeRepository? repository})
      : _repository = repository ?? SystemProbeRepository();

  final SystemProbeRepository _repository;

  SystemProbeState _state = const SystemProbeState();
  SystemProbeState get state => _state;

  /// Runs one probe.
  ///
  /// Re-entrancy is refused while a run is in flight. The probe is deliberately
  /// NOT idempotent — each accepted call increments — so a double tap would
  /// persist two visits and make the displayed count look wrong.
  Future<void> run() async {
    if (_state.isBusy) {
      return;
    }

    _emit(const SystemProbeState(status: SystemProbeStatus.loading));

    final outcome = await _repository.run();

    switch (outcome) {
      case SystemProbeSucceeded(:final visitCount, :final correlationId):
        _emit(SystemProbeState(
          status: SystemProbeStatus.success,
          visitCount: visitCount,
          correlationId: correlationId,
        ));
      case SystemProbeFailed(:final messageKey, :final correlationId):
        _emit(SystemProbeState(
          status: SystemProbeStatus.failure,
          messageKey: messageKey,
          correlationId: correlationId,
        ));
    }
  }

  void _emit(SystemProbeState next) {
    _state = next;
    notifyListeners();
  }
}
