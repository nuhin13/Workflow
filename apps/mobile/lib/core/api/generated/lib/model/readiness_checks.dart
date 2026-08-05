//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class ReadinessChecks {
  /// Returns a new [ReadinessChecks] instance.
  ReadinessChecks({
    required this.database,
  });

  DependencyState database;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ReadinessChecks &&
    other.database == database;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (database.hashCode);

  @override
  String toString() => 'ReadinessChecks[database=$database]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'database'] = this.database;
    return json;
  }

  /// Returns a new [ReadinessChecks] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ReadinessChecks? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'database'), 'Required key "ReadinessChecks[database]" is missing from JSON.');
        assert(json[r'database'] != null, 'Required key "ReadinessChecks[database]" has a null value in JSON.');
        return true;
      }());

      return ReadinessChecks(
        database: DependencyState.fromJson(json[r'database'])!,
      );
    }
    return null;
  }

  static List<ReadinessChecks> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ReadinessChecks>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ReadinessChecks.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ReadinessChecks> mapFromJson(dynamic json) {
    final map = <String, ReadinessChecks>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ReadinessChecks.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ReadinessChecks-objects as value to a dart map
  static Map<String, List<ReadinessChecks>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ReadinessChecks>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ReadinessChecks.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'database',
  };
}

