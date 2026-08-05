//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class FieldError {
  /// Returns a new [FieldError] instance.
  FieldError({
    required this.field,
    required this.messageKey,
  });

  /// Dotted path to the offending request field.
  String field;

  /// Localization key. Never a rendered sentence.
  String messageKey;

  @override
  bool operator ==(Object other) => identical(this, other) || other is FieldError &&
    other.field == field &&
    other.messageKey == messageKey;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (field.hashCode) +
    (messageKey.hashCode);

  @override
  String toString() => 'FieldError[field=$field, messageKey=$messageKey]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'field'] = this.field;
      json[r'messageKey'] = this.messageKey;
    return json;
  }

  /// Returns a new [FieldError] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static FieldError? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'field'), 'Required key "FieldError[field]" is missing from JSON.');
        assert(json[r'field'] != null, 'Required key "FieldError[field]" has a null value in JSON.');
        assert(json.containsKey(r'messageKey'), 'Required key "FieldError[messageKey]" is missing from JSON.');
        assert(json[r'messageKey'] != null, 'Required key "FieldError[messageKey]" has a null value in JSON.');
        return true;
      }());

      return FieldError(
        field: mapValueOfType<String>(json, r'field')!,
        messageKey: mapValueOfType<String>(json, r'messageKey')!,
      );
    }
    return null;
  }

  static List<FieldError> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <FieldError>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = FieldError.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, FieldError> mapFromJson(dynamic json) {
    final map = <String, FieldError>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = FieldError.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of FieldError-objects as value to a dart map
  static Map<String, List<FieldError>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<FieldError>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = FieldError.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'field',
    'messageKey',
  };
}

