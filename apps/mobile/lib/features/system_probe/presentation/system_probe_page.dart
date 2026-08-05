// E00-T04 · development-only diagnostic page.
//
// This is NOT a product screen and has no SCR id. It exists so a human can see
// the round trip happen: tap, and a real row moves in PostgreSQL.
//
// It still follows the project's conventions — generated design tokens,
// localized copy, accessible controls — because a diagnostic that ignores them
// becomes the example everyone copies.

import 'package:flutter/material.dart';

import '../../../app/app.dart' show designColor, designSpace;
import '../../../core/design/generated/design_tokens.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../application/system_probe_view_model.dart';

/// Route name. Registered only for non-production builds (see app.dart).
const String systemProbeRouteName = '/dev/walking-skeleton';

@visibleForTesting
const Key systemProbeRunButtonKey = Key('system-probe-run');

@visibleForTesting
const Key systemProbeStatusKey = Key('system-probe-status');

class SystemProbePage extends StatefulWidget {
  const SystemProbePage({super.key, this.viewModel});

  /// Injectable so widget tests drive it without a network or a database.
  final SystemProbeViewModel? viewModel;

  @override
  State<SystemProbePage> createState() => _SystemProbePageState();
}

class _SystemProbePageState extends State<SystemProbePage> {
  late final SystemProbeViewModel _viewModel = widget.viewModel ?? SystemProbeViewModel();

  @override
  void initState() {
    super.initState();
    _viewModel.addListener(_onChanged);
  }

  @override
  void dispose() {
    _viewModel.removeListener(_onChanged);
    super.dispose();
  }

  void _onChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;
    final state = _viewModel.state;

    return Scaffold(
      appBar: AppBar(title: Text(localizations.probeTitle)),
      body: Semantics(
        container: true,
        label: localizations.probeTitle,
        child: Padding(
          padding: EdgeInsets.all(designSpace(DesignTokens.spaceN6)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                localizations.probeExplanation,
                style: TextStyle(color: designColor(DesignTokens.colorTextMuted)),
              ),
              SizedBox(height: designSpace(DesignTokens.spaceN6)),
              _StatusView(state: state, localizations: localizations),
              SizedBox(height: designSpace(DesignTokens.spaceN6)),
              FilledButton(
                key: systemProbeRunButtonKey,
                // Disabled while in flight. The probe is deliberately not
                // idempotent, so a second tap would persist a second visit.
                onPressed: state.isBusy ? null : _viewModel.run,
                child: Text(localizations.probeRunAction),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusView extends StatelessWidget {
  const _StatusView({required this.state, required this.localizations});

  final SystemProbeState state;
  final AppLocalizations localizations;

  @override
  Widget build(BuildContext context) {
    final (String text, Color color) = switch (state.status) {
      SystemProbeStatus.idle => (
          localizations.probeIdle,
          designColor(DesignTokens.colorTextMuted),
        ),
      SystemProbeStatus.loading => (
          localizations.probeRunning,
          designColor(DesignTokens.colorTextMuted),
        ),
      SystemProbeStatus.success => (
          localizations.probePersisted(state.visitCount ?? 0),
          designColor(DesignTokens.colorSuccessText),
        ),
      SystemProbeStatus.failure => (
          localizations.probeFailed,
          designColor(DesignTokens.colorDanger),
        ),
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Semantics(
          // liveRegion so a screen reader announces the outcome instead of
          // leaving the user tapping and waiting in silence.
          liveRegion: true,
          child: Text(
            text,
            key: systemProbeStatusKey,
            style: TextStyle(color: color, fontSize: designSpace(DesignTokens.fontSizeLg)),
          ),
        ),
        if (state.correlationId != null) ...[
          SizedBox(height: designSpace(DesignTokens.spaceN2)),
          // Shown so a human can tie what they saw to a server log line. It is
          // opaque and carries no identity.
          Text(
            localizations.probeCorrelation(state.correlationId!),
            style: TextStyle(
              color: designColor(DesignTokens.colorTextFaint),
              fontSize: designSpace(DesignTokens.fontSizeSm),
            ),
          ),
        ],
        if (state.status == SystemProbeStatus.loading) ...[
          SizedBox(height: designSpace(DesignTokens.spaceN4)),
          const LinearProgressIndicator(),
        ],
      ],
    );
  }
}
