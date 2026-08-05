// E00-T01 shell contracts. These are scaffold tests, not product tests: they
// prove the localization boundary and the accessible root exist, and that the
// shell shows only its static placeholder.

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart' show SemanticsFlag;
import 'package:flutter_test/flutter_test.dart';
import 'package:garazo_owner/app/app.dart';
import 'package:garazo_owner/l10n/generated/app_localizations.dart';

void main() {
  testWidgets('test_NFR_I18N_01_shell_resolves_english_copy', (tester) async {
    await tester.pumpWidget(buildGarazoApp());
    await tester.pumpAndSettle();

    expect(find.text('Skeleton not configured.'), findsOneWidget);
  });

  testWidgets('test_NFR_I18N_01_shell_resolves_bangla_copy', (tester) async {
    await tester.pumpWidget(
      Localizations(
        locale: const Locale('bn'),
        delegates: AppLocalizations.localizationsDelegates,
        child: Builder(
          builder: (context) => Directionality(
            textDirection: TextDirection.ltr,
            child: Text(AppLocalizations.of(context)!.shellNotConfigured),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('কাঠামো এখনো সাজানো হয়নি।'), findsOneWidget);
  });

  test('test_NFR_I18N_01_shell_supports_bangla_and_english', () {
    final locales = AppLocalizations.supportedLocales
        .map((locale) => locale.languageCode)
        .toSet();

    expect(locales.contains('bn'), isTrue);
    expect(locales.contains('en'), isTrue);
  });

  testWidgets('test_NFR_A11Y_01_shell_root_is_named_and_focusable', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(buildGarazoApp());
    await tester.pumpAndSettle();

    final semantics = tester.getSemantics(find.byKey(shellRootKey));

    // The root node merges its descendants' text, so the shell label is the
    // prefix rather than the whole string.
    expect(semantics.label, startsWith('Garazo owner app shell'));
    // `flagsCollection` is the advertised replacement but exposes no
    // focusability accessor in Flutter 3.44, so hasFlag remains the only way to
    // assert this contract.
    // ignore: deprecated_member_use
    expect(semantics.hasFlag(SemanticsFlag.isFocusable), isTrue);
    handle.dispose();
  });

  testWidgets('test_EARS_E00_1_shell_uses_generated_design_tokens', (
    tester,
  ) async {
    await tester.pumpWidget(buildGarazoApp());
    await tester.pumpAndSettle();

    final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));

    // #F5F5F5 — DesignTokens.colorBackground, not a hand-written literal.
    expect(materialApp.theme!.scaffoldBackgroundColor, const Color(0xFFF5F5F5));
  });

  test('test_EARS_E00_1_design_token_parsers_are_faithful', () {
    expect(designColor('#F4670F'), const Color(0xFFF4670F));
    expect(designSpace('1.5rem'), 24.0);
    expect(designSpace('44px'), 44.0);
  });
}
