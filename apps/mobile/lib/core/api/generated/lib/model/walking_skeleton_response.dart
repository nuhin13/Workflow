//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class WalkingSkeletonResponse {
  /// Returns a new [WalkingSkeletonResponse] instance.
  WalkingSkeletonResponse({
    required this.status,
    required this.visitCount,
    required this.correlationId,
  });

  WalkingSkeletonResponseStatusEnum status;

  /// Total accepted probe calls persisted so far. At least 1 on success. 
  ///
  /// Minimum value: 1
  int visitCount;

  /// 1–128 printable ASCII characters.
  String correlationId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is WalkingSkeletonResponse &&
    other.status == status &&
    other.visitCount == visitCount &&
    other.correlationId == correlationId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (status.hashCode) +
    (visitCount.hashCode) +
    (correlationId.hashCode);

  @override
  String toString() => 'WalkingSkeletonResponse[status=$status, visitCount=$visitCount, correlationId=$correlationId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'status'] = this.status;
      json[r'visitCount'] = this.visitCount;
      json[r'correlationId'] = this.correlationId;
    return json;
  }

  /// Returns a new [WalkingSkeletonResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static WalkingSkeletonResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'status'), 'Required key "WalkingSkeletonResponse[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "WalkingSkeletonResponse[status]" has a null value in JSON.');
        assert(json.containsKey(r'visitCount'), 'Required key "WalkingSkeletonResponse[visitCount]" is missing from JSON.');
        assert(json[r'visitCount'] != null, 'Required key "WalkingSkeletonResponse[visitCount]" has a null value in JSON.');
        assert(json.containsKey(r'correlationId'), 'Required key "WalkingSkeletonResponse[correlationId]" is missing from JSON.');
        assert(json[r'correlationId'] != null, 'Required key "WalkingSkeletonResponse[correlationId]" has a null value in JSON.');
        return true;
      }());

      return WalkingSkeletonResponse(
        status: WalkingSkeletonResponseStatusEnum.fromJson(json[r'status'])!,
        visitCount: mapValueOfType<int>(json, r'visitCount')!,
        correlationId: mapValueOfType<String>(json, r'correlationId')!,
      );
    }
    return null;
  }

  static List<WalkingSkeletonResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <WalkingSkeletonResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = WalkingSkeletonResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, WalkingSkeletonResponse> mapFromJson(dynamic json) {
    final map = <String, WalkingSkeletonResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = WalkingSkeletonResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of WalkingSkeletonResponse-objects as value to a dart map
  static Map<String, List<WalkingSkeletonResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<WalkingSkeletonResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = WalkingSkeletonResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'status',
    'visitCount',
    'correlationId',
  };
}


enum WalkingSkeletonResponseStatusEnum {
  persisted._(r'persisted'),
  ;

  /// Instantiate a new enum with the provided value.
  const WalkingSkeletonResponseStatusEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [WalkingSkeletonResponseStatusEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static WalkingSkeletonResponseStatusEnum? fromJson(dynamic value) => WalkingSkeletonResponseStatusEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [WalkingSkeletonResponseStatusEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<WalkingSkeletonResponseStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <WalkingSkeletonResponseStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = WalkingSkeletonResponseStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [WalkingSkeletonResponseStatusEnum] to String,
/// and [decode] dynamic data back to [WalkingSkeletonResponseStatusEnum].
class WalkingSkeletonResponseStatusEnumTypeTransformer {
  factory WalkingSkeletonResponseStatusEnumTypeTransformer() => _instance ??= const WalkingSkeletonResponseStatusEnumTypeTransformer._();

  const WalkingSkeletonResponseStatusEnumTypeTransformer._();

  String encode(WalkingSkeletonResponseStatusEnum data) => data._value;

  /// Returns the instance of [WalkingSkeletonResponseStatusEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  WalkingSkeletonResponseStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is WalkingSkeletonResponseStatusEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'persisted': return WalkingSkeletonResponseStatusEnum.persisted;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static WalkingSkeletonResponseStatusEnumTypeTransformer? _instance;
}


