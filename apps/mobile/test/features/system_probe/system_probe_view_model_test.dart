// E00-T04 · view-model state transitions (EARS-E00-9, EARS-E00-10).

import 'package:flutter_test/flutter_test.dart';
import 'package:garazo_owner/features/system_probe/application/system_probe_view_model.dart';
import 'package:garazo_owner/features/system_probe/data/system_probe_repository.dart';

/// Repository stub whose completion the test controls, so the loading state is
/// observable rather than a race.
class _ControlledRepository implements SystemProbeRepository {
  _ControlledRepository(this._outcome);

  final SystemProbeOutcome _outcome;
  final List<void> calls = <void>[];
  Duration delay = Duration.zero;

  @override
  Future<SystemProbeOutcome> run() async {
    calls.add(null);
    if (delay > Duration.zero) {
      await Future<void>.delayed(delay);
    }
    return _outcome;
  }
}

void main() {
  test('test_EARS_E00_9_success_exposes_the_retained_count', () async {
    final viewModel = SystemProbeViewModel(
      repository: _ControlledRepository(
        const SystemProbeSucceeded(visitCount: 3, correlationId: 'corr-1'),
      ),
    );

    expect(viewModel.state.status, SystemProbeStatus.idle);

    await viewModel.run();

    expect(viewModel.state.status, SystemProbeStatus.success);
    expect(viewModel.state.visitCount, 3);
    expect(viewModel.state.correlationId, 'corr-1');
  });

  test('test_EARS_E00_10_failure_exposes_a_message_key_not_a_sentence', () async {
    final viewModel = SystemProbeViewModel(
      repository: _ControlledRepository(
        const SystemProbeFailed(
          messageKey: 'errors.systemDatabaseUnavailable',
          correlationId: 'corr-2',
        ),
      ),
    );

    await viewModel.run();

    expect(viewModel.state.status, SystemProbeStatus.failure);
    expect(viewModel.state.messageKey, 'errors.systemDatabaseUnavailable');
    // A failure must never leave a stale count on screen implying success.
    expect(viewModel.state.visitCount, isNull);
  });

  test('test_EARS_E00_9_run_is_not_reentrant_while_in_flight', () async {
    final repository = _ControlledRepository(
      const SystemProbeSucceeded(visitCount: 1, correlationId: 'corr-3'),
    )..delay = const Duration(milliseconds: 80);

    final viewModel = SystemProbeViewModel(repository: repository);

    // The probe is deliberately NOT idempotent: each accepted call increments.
    // A double tap must therefore not produce two round trips, or the count the
    // user sees will not match what they think they did.
    final first = viewModel.run();
    expect(viewModel.state.status, SystemProbeStatus.loading);
    final second = viewModel.run();

    await Future.wait(<Future<void>>[first, second]);

    expect(repository.calls.length, 1, reason: 'a second tap triggered a second increment');
    expect(viewModel.state.status, SystemProbeStatus.success);
  });

  test('test_EARS_E00_9_listeners_observe_loading_then_terminal_state', () async {
    final repository = _ControlledRepository(
      const SystemProbeSucceeded(visitCount: 1, correlationId: 'corr-4'),
    )..delay = const Duration(milliseconds: 20);

    final viewModel = SystemProbeViewModel(repository: repository);
    final observed = <SystemProbeStatus>[];
    viewModel.addListener(() => observed.add(viewModel.state.status));

    await viewModel.run();

    // Loading must be observable. If it is skipped the button never disables
    // and the user has no feedback that anything is happening.
    expect(observed, <SystemProbeStatus>[
      SystemProbeStatus.loading,
      SystemProbeStatus.success,
    ]);
  });
}
