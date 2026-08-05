// E00-T01: the Garazo owner-app shell.
//
// This is a composition root, not a product screen. It proves three contracts
// and nothing else:
//   * NFR-I18N-01 — every string resolves through the AppLocalizations boundary,
//     so Bangla and English are selectable before any feature exists.
//   * NFR-A11Y-01 — the shell root is named and focusable.
//   * EARS-E00-1 — the visual surface reads its colours and spacing from the
//     generated design tokens, never from a hand-copied literal.
//
// Do NOT add navigation, product data, or state management here. Those belong
// to E01 and later (task §4).

import 'package:flutter/material.dart';

import '../core/design/generated/design_tokens.dart';
import '../features/system_probe/presentation/system_probe_page.dart';
import '../l10n/generated/app_localizations.dart';

/// Identifies the accessible shell root so tests can assert NFR-A11Y-01 against
/// exactly one node instead of guessing at the framework's semantics tree.
const Key shellRootKey = Key('garazo-shell-root');

/// Parses a `#RRGGBB` design token into a Flutter [Color].
///
/// The generated token file is shared with TypeScript, so colours arrive as CSS
/// hex strings. Parsing here keeps a single source of truth instead of
/// maintaining a second, Dart-shaped copy of the palette.
Color designColor(String token) {
  final hex = token.replaceFirst('#', '');
  return Color(int.parse('FF$hex', radix: 16));
}

/// Converts a `rem` spacing token to logical pixels at the 16px root size the
/// design system assumes.
double designSpace(String token) {
  if (token.endsWith('rem')) {
    return double.parse(token.substring(0, token.length - 3)) * 16;
  }
  if (token.endsWith('px')) {
    return double.parse(token.substring(0, token.length - 2));
  }
  return double.parse(token);
}

/// Whether the E00 walking-skeleton diagnostic route exists in this build.
///
/// `kReleaseMode` is a COMPILE-TIME constant, so in a release build the route
/// table below is const-folded and the diagnostic page is tree-shaken out of the
/// binary entirely. That is stronger than a runtime check: there is no
/// environment value, remote flag, or debugger trick that can reach a page which
/// is not in the compiled artifact (EARS-E00-11).
const bool systemProbeRouteEnabled = !bool.fromEnvironment('dart.vm.product');

/// Builds the localized, token-backed application shell.
///
/// Exposed as a factory so widget tests can pump exactly what `main()` runs.
Widget buildGarazoApp() {
  return MaterialApp(
    routes: <String, WidgetBuilder>{
      if (systemProbeRouteEnabled)
        systemProbeRouteName: (BuildContext context) => const SystemProbePage(),
    },
    onGenerateTitle: (context) => AppLocalizations.of(context)!.appTitle,
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    theme: ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: designColor(DesignTokens.colorBackground),
      colorScheme: ColorScheme.fromSeed(
        seedColor: designColor(DesignTokens.colorPrimary),
      ),
    ),
    home: const _ShellPlaceholder(),
  );
}

class _ShellPlaceholder extends StatelessWidget {
  const _ShellPlaceholder();

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!;

    return Scaffold(
      body: Semantics(
        key: shellRootKey,
        container: true,
        label: localizations.shellRootLabel,
        focusable: true,
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(designSpace(DesignTokens.spaceN6)),
            child: Text(
              localizations.shellNotConfigured,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: designColor(DesignTokens.colorTextMuted),
                fontSize: designSpace(DesignTokens.fontSizeBase),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
