// E00-T04 · Flutter data boundary for the diagnostic probe.
//
// Every call goes through the GENERATED client. No hand-written model, no
// ad-hoc http call: the contract in contracts/openapi/garazo.v1.yaml is the
// single source of truth, and a parallel hand-rolled request is how a client
// and server drift apart without either noticing.

import 'package:garazo_owner/core/api/generated/lib/api.dart';

/// Outcome of one probe attempt.
///
/// A sealed result rather than exceptions-as-flow: the UI must handle failure
/// explicitly, and an unhandled exception in a diagnostic would look like a
/// broken skeleton rather than a broken database.
sealed class SystemProbeOutcome {
  const SystemProbeOutcome();
}

final class SystemProbeSucceeded extends SystemProbeOutcome {
  const SystemProbeSucceeded({required this.visitCount, required this.correlationId});

  final int visitCount;
  final String correlationId;
}

final class SystemProbeFailed extends SystemProbeOutcome {
  const SystemProbeFailed({required this.messageKey, this.correlationId});

  /// A localization KEY, never a rendered sentence — the same failure must read
  /// correctly in Bangla and English (NFR-I18N-01).
  final String messageKey;

  /// Present when the server answered; absent when the request never arrived.
  final String? correlationId;
}

class SystemProbeRepository {
  SystemProbeRepository({SystemApi? api}) : _api = api ?? SystemApi();

  final SystemApi _api;

  /// Runs one probe round trip.
  ///
  /// Never throws. The server's error envelope is already redacted, and this
  /// deliberately does not surface its raw body: a diagnostic screen is exactly
  /// where someone would paste a screenshot into a chat.
  Future<SystemProbeOutcome> run() async {
    try {
      final response = // The contract requires exactly `{}`; an empty map serializes to that.
      await _api.systemWalkingSkeleton(<String, dynamic>{});

      if (response == null) {
        return const SystemProbeFailed(messageKey: 'errors.systemDatabaseUnavailable');
      }

      return SystemProbeSucceeded(
        visitCount: response.visitCount,
        correlationId: response.correlationId,
      );
    } on ApiException catch (exception) {
      return SystemProbeFailed(
        messageKey: _messageKeyForStatus(exception.code),
        correlationId: null,
      );
    } catch (_) {
      // Transport failure: no response, so no correlation id exists to show.
      return const SystemProbeFailed(messageKey: 'errors.systemDatabaseUnavailable');
    }
  }

  /// Maps a status to the localization key the server would have used.
  String _messageKeyForStatus(int status) {
    return switch (status) {
      400 => 'errors.validationInvalidField',
      404 => 'errors.systemNotFound',
      503 => 'errors.systemDatabaseUnavailable',
      _ => 'errors.systemInternalError',
    };
  }
}
