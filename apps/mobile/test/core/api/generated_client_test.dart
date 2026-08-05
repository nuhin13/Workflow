// E00-T02 · proves the GENERATED Dart client compiles and models the contract.
//
// The generated tree is excluded from `flutter analyze` (we do not own its
// style and may not hand-edit it), so this test is what keeps EARS-E00-3
// honest: if generation breaks or the contract stops producing usable Dart,
// this file fails to compile.

import 'package:flutter_test/flutter_test.dart';
import 'package:garazo_owner/core/api/generated/lib/api.dart';

void main() {
  test('test_EARS_E00_3_generated_dart_client_models_the_contract', () {
    final live = LiveResponse(
      status: LiveResponseStatusEnum.ok,
      correlationId: 'abc123',
    );
    expect(live.correlationId, 'abc123');

    final ready = ReadyResponse(
      status: ReadyResponseStatusEnum.ready,
      checks: ReadinessChecks(database: DependencyState.up),
      correlationId: 'abc123',
    );
    expect(ready.checks.database, DependencyState.up);

    final skeleton = WalkingSkeletonResponse(
      status: WalkingSkeletonResponseStatusEnum.persisted,
      visitCount: 1,
      correlationId: 'abc123',
    );
    expect(skeleton.visitCount, greaterThanOrEqualTo(1));
  });

  test('test_EARS_E00_4_generated_dart_client_models_one_error_envelope', () {
    final envelope = ErrorEnvelope(
      error: ApiError(
        code: ErrorCode.SystemNotReady,
        messageKey: 'errors.systemNotReady',
        correlationId: 'abc123',
      ),
    );

    expect(envelope.error.code, ErrorCode.SystemNotReady);
    expect(envelope.error.fieldErrors, isEmpty);
  });

  test('test_EARS_E00_3_generated_dart_client_exposes_the_system_api', () {
    final api = SystemApi();
    expect(api, isNotNull);
  });
}
