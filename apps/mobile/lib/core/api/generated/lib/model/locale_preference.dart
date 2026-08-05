//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class LocalePreference {
  /// Returns a new [LocalePreference] instance.
  LocalePreference({
    required this.locale,
  });

  Locale locale;

  @override
  bool operator ==(Object other) => identical(this, other) || other is LocalePreference &&
    other.locale == locale;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (locale.hashCode);

  @override
  String toString() => 'LocalePreference[locale=$locale]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'locale'] = this.locale;
    return json;
  }

  /// Returns a new [LocalePreference] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static LocalePreference? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'locale'), 'Required key "LocalePreference[locale]" is missing from JSON.');
        assert(json[r'locale'] != null, 'Required key "LocalePreference[locale]" has a null value in JSON.');
        return true;
      }());

      return LocalePreference(
        locale: Locale.fromJson(json[r'locale'])!,
      );
    }
    return null;
  }

  static List<LocalePreference> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LocalePreference>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LocalePreference.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, LocalePreference> mapFromJson(dynamic json) {
    final map = <String, LocalePreference>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = LocalePreference.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of LocalePreference-objects as value to a dart map
  static Map<String, List<LocalePreference>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<LocalePreference>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = LocalePreference.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'locale',
  };
}

