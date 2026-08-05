//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class LiveResponse {
  /// Returns a new [LiveResponse] instance.
  LiveResponse({
    required this.status,
    required this.correlationId,
  });

  LiveResponseStatusEnum status;

  /// 1–128 printable ASCII characters.
  String correlationId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is LiveResponse &&
    other.status == status &&
    other.correlationId == correlationId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (status.hashCode) +
    (correlationId.hashCode);

  @override
  String toString() => 'LiveResponse[status=$status, correlationId=$correlationId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'status'] = this.status;
      json[r'correlationId'] = this.correlationId;
    return json;
  }

  /// Returns a new [LiveResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static LiveResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'status'), 'Required key "LiveResponse[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "LiveResponse[status]" has a null value in JSON.');
        assert(json.containsKey(r'correlationId'), 'Required key "LiveResponse[correlationId]" is missing from JSON.');
        assert(json[r'correlationId'] != null, 'Required key "LiveResponse[correlationId]" has a null value in JSON.');
        return true;
      }());

      return LiveResponse(
        status: LiveResponseStatusEnum.fromJson(json[r'status'])!,
        correlationId: mapValueOfType<String>(json, r'correlationId')!,
      );
    }
    return null;
  }

  static List<LiveResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LiveResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LiveResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, LiveResponse> mapFromJson(dynamic json) {
    final map = <String, LiveResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = LiveResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of LiveResponse-objects as value to a dart map
  static Map<String, List<LiveResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<LiveResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = LiveResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'status',
    'correlationId',
  };
}


enum LiveResponseStatusEnum {
  ok._(r'ok'),
  ;

  /// Instantiate a new enum with the provided value.
  const LiveResponseStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [LiveResponseStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static LiveResponseStatusEnum? fromJson(dynamic value) => LiveResponseStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [LiveResponseStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<LiveResponseStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LiveResponseStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LiveResponseStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [LiveResponseStatusEnum] to String,
/// and [decode] dynamic data back to [LiveResponseStatusEnum].
class LiveResponseStatusEnumTypeTransformer {
  factory LiveResponseStatusEnumTypeTransformer() => _instance ??= const LiveResponseStatusEnumTypeTransformer._();

  const LiveResponseStatusEnumTypeTransformer._();

  String encode(LiveResponseStatusEnum data) => data._value;

  /// Returns the instance of [LiveResponseStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  LiveResponseStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is LiveResponseStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'ok': return LiveResponseStatusEnum.ok;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static LiveResponseStatusEnumTypeTransformer? _instance;
}


