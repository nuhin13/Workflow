// E00-T01: owner-app composition root. It boots the shell and nothing else —
// no product feature, no navigation, no state management (task §4).

import 'package:flutter/widgets.dart';

import 'app/app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(buildGarazoApp());
}
