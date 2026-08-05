// E00-T04 · diagnostic page states and accessibility.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:garazo_owner/features/system_probe/application/system_probe_view_model.dart';
import 'package:garazo_owner/features/system_probe/data/system_probe_repository.dart';
import 'package:garazo_owner/features/system_probe/presentation/system_probe_page.dart';
import 'package:garazo_owner/l10n/generated/app_localizations.dart';

class _StubRepository implements SystemProbeRepository {
  _StubRepository(this._outcome, {this.delay = Duration.zero});

  final SystemProbeOutcome _outcome;
  final Duration delay;

  @override
  Future<SystemProbeOutcome> run() async {
    if (delay > Duration.zero) {
      await Future<void>.delayed(delay);
    }
    return _outcome;
  }
}

Widget _wrap(SystemProbeViewModel viewModel) {
  return MaterialApp(
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    home: SystemProbePage(viewModel: viewModel),
  );
}

void main() {
  testWidgets('test_EARS_E00_9_idle_state_is_shown_before_any_run', (tester) async {
    await tester.pumpWidget(_wrap(SystemProbeViewModel(
      repository: _StubRepository(
        const SystemProbeSucceeded(visitCount: 1, correlationId: 'c'),
      ),
    )));
    await tester.pumpAndSettle();

    expect(find.text('Persistence check not run'), findsOneWidget);
    // Nothing may imply a result before one exists.
    expect(find.textContaining('Visit count'), findsNothing);
  });

  testWidgets('test_EARS_E00_9_success_state_shows_count_and_correlation', (tester) async {
    await tester.pumpWidget(_wrap(SystemProbeViewModel(
      repository: _StubRepository(
        const SystemProbeSucceeded(visitCount: 4, correlationId: 'corr-abc'),
      ),
    )));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(systemProbeRunButtonKey));
    await tester.pumpAndSettle();

    expect(find.text('Persisted. Visit count: 4'), findsOneWidget);
    expect(find.text('Correlation ID: corr-abc'), findsOneWidget);
  });

  testWidgets('test_EARS_E00_9_loading_state_disables_the_action', (tester) async {
    await tester.pumpWidget(_wrap(SystemProbeViewModel(
      repository: _StubRepository(
        const SystemProbeSucceeded(visitCount: 1, correlationId: 'c'),
        delay: const Duration(milliseconds: 200),
      ),
    )));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(systemProbeRunButtonKey));
    await tester.pump();

    expect(find.text('Running persistence check'), findsOneWidget);
    expect(find.byType(LinearProgressIndicator), findsOneWidget);

    // Disabled, not merely ignored: the probe is not idempotent, so the button
    // must visibly refuse a second tap.
    final button = tester.widget<FilledButton>(find.byKey(systemProbeRunButtonKey));
    expect(button.onPressed, isNull);

    await tester.pumpAndSettle();
  });

  testWidgets('test_EARS_E00_10_error_state_shows_no_stack_or_configuration', (tester) async {
    await tester.pumpWidget(_wrap(SystemProbeViewModel(
      repository: _StubRepository(
        const SystemProbeFailed(
          messageKey: 'errors.systemDatabaseUnavailable',
          correlationId: 'corr-err',
        ),
      ),
    )));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(systemProbeRunButtonKey));
    await tester.pumpAndSettle();

    expect(find.text('Persistence check failed'), findsOneWidget);
    expect(find.text('Correlation ID: corr-err'), findsOneWidget);

    // A diagnostic screen is exactly where someone screenshots and pastes into
    // a chat, so it must never render internals.
    expect(find.textContaining('postgres'), findsNothing);
    expect(find.textContaining('Exception'), findsNothing);
    expect(find.textContaining('5432'), findsNothing);
    // No success wording may survive a failure.
    expect(find.textContaining('Persisted'), findsNothing);
  });

  testWidgets('test_NFR_A11Y_01_diagnostic_exposes_named_accessible_controls', (tester) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(_wrap(SystemProbeViewModel(
      repository: _StubRepository(
        const SystemProbeSucceeded(visitCount: 1, correlationId: 'c'),
      ),
    )));
    await tester.pumpAndSettle();

    expect(find.bySemanticsLabel('Run persistence check'), findsOneWidget);

    final status = tester.getSemantics(find.byKey(systemProbeStatusKey));
    expect(status.label, contains('Persistence check not run'));

    handle.dispose();
  });

  testWidgets('test_NFR_I18N_01_diagnostic_copy_resolves_in_bangla', (tester) async {
    await tester.pumpWidget(MaterialApp(
      locale: const Locale('bn'),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: SystemProbePage(
        viewModel: SystemProbeViewModel(
          repository: _StubRepository(
            const SystemProbeSucceeded(visitCount: 1, correlationId: 'c'),
          ),
        ),
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('সংরক্ষণ পরীক্ষা চালানো হয়নি'), findsOneWidget);
  });
}
