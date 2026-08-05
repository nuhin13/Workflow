//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class ApiError {
  /// Returns a new [ApiError] instance.
  ApiError({
    required this.code,
    required this.messageKey,
    required this.correlationId,
    this.fieldErrors = const [],
  });

  ErrorCode code;

  /// Localization key resolved by the client, so Bangla and English surfaces stay consistent (NFR-I18N-01). Never a server-rendered sentence, never a stack trace, never a provider message. 
  String messageKey;

  /// 1–128 printable ASCII characters.
  String correlationId;

  List<FieldError> fieldErrors;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ApiError &&
    other.code == code &&
    other.messageKey == messageKey &&
    other.correlationId == correlationId &&
    _deepEquality.equals(other.fieldErrors, fieldErrors);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (code.hashCode) +
    (messageKey.hashCode) +
    (correlationId.hashCode) +
    (fieldErrors.hashCode);

  @override
  String toString() => 'ApiError[code=$code, messageKey=$messageKey, correlationId=$correlationId, fieldErrors=$fieldErrors]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'code'] = this.code;
      json[r'messageKey'] = this.messageKey;
      json[r'correlationId'] = this.correlationId;
      json[r'fieldErrors'] = this.fieldErrors;
    return json;
  }

  /// Returns a new [ApiError] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ApiError? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'code'), 'Required key "ApiError[code]" is missing from JSON.');
        assert(json[r'code'] != null, 'Required key "ApiError[code]" has a null value in JSON.');
        assert(json.containsKey(r'messageKey'), 'Required key "ApiError[messageKey]" is missing from JSON.');
        assert(json[r'messageKey'] != null, 'Required key "ApiError[messageKey]" has a null value in JSON.');
        assert(json.containsKey(r'correlationId'), 'Required key "ApiError[correlationId]" is missing from JSON.');
        assert(json[r'correlationId'] != null, 'Required key "ApiError[correlationId]" has a null value in JSON.');
        assert(json.containsKey(r'fieldErrors'), 'Required key "ApiError[fieldErrors]" is missing from JSON.');
        assert(json[r'fieldErrors'] != null, 'Required key "ApiError[fieldErrors]" has a null value in JSON.');
        return true;
      }());

      return ApiError(
        code: ErrorCode.fromJson(json[r'code'])!,
        messageKey: mapValueOfType<String>(json, r'messageKey')!,
        correlationId: mapValueOfType<String>(json, r'correlationId')!,
        fieldErrors: FieldError.listFromJson(json[r'fieldErrors']),
      );
    }
    return null;
  }

  static List<ApiError> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ApiError>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ApiError.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ApiError> mapFromJson(dynamic json) {
    final map = <String, ApiError>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ApiError.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ApiError-objects as value to a dart map
  static Map<String, List<ApiError>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ApiError>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ApiError.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'code',
    'messageKey',
    'correlationId',
    'fieldErrors',
  };
}

