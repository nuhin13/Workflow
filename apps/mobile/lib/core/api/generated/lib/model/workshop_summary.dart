//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class WorkshopSummary {
  /// Returns a new [WorkshopSummary] instance.
  WorkshopSummary({
    required this.workshopId,
    required this.name,
    this.vehicleTypes = const {},
    required this.locale,
    required this.regionProfile,
  });

  /// Opaque; identifies the workshop, never authorizes anything.
  String workshopId;

  String name;

  Set<VehicleType> vehicleTypes;

  Locale locale;

  WorkshopSummaryRegionProfileEnum regionProfile;

  @override
  bool operator ==(Object other) => identical(this, other) || other is WorkshopSummary &&
    other.workshopId == workshopId &&
    other.name == name &&
    _deepEquality.equals(other.vehicleTypes, vehicleTypes) &&
    other.locale == locale &&
    other.regionProfile == regionProfile;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (workshopId.hashCode) +
    (name.hashCode) +
    (vehicleTypes.hashCode) +
    (locale.hashCode) +
    (regionProfile.hashCode);

  @override
  String toString() => 'WorkshopSummary[workshopId=$workshopId, name=$name, vehicleTypes=$vehicleTypes, locale=$locale, regionProfile=$regionProfile]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'workshopId'] = this.workshopId;
      json[r'name'] = this.name;
      json[r'vehicleTypes'] = this.vehicleTypes.toList(growable: false);
      json[r'locale'] = this.locale;
      json[r'regionProfile'] = this.regionProfile;
    return json;
  }

  /// Returns a new [WorkshopSummary] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static WorkshopSummary? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'workshopId'), 'Required key "WorkshopSummary[workshopId]" is missing from JSON.');
        assert(json[r'workshopId'] != null, 'Required key "WorkshopSummary[workshopId]" has a null value in JSON.');
        assert(json.containsKey(r'name'), 'Required key "WorkshopSummary[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "WorkshopSummary[name]" has a null value in JSON.');
        assert(json.containsKey(r'vehicleTypes'), 'Required key "WorkshopSummary[vehicleTypes]" is missing from JSON.');
        assert(json[r'vehicleTypes'] != null, 'Required key "WorkshopSummary[vehicleTypes]" has a null value in JSON.');
        assert(json.containsKey(r'locale'), 'Required key "WorkshopSummary[locale]" is missing from JSON.');
        assert(json[r'locale'] != null, 'Required key "WorkshopSummary[locale]" has a null value in JSON.');
        assert(json.containsKey(r'regionProfile'), 'Required key "WorkshopSummary[regionProfile]" is missing from JSON.');
        assert(json[r'regionProfile'] != null, 'Required key "WorkshopSummary[regionProfile]" has a null value in JSON.');
        return true;
      }());

      return WorkshopSummary(
        workshopId: mapValueOfType<String>(json, r'workshopId')!,
        name: mapValueOfType<String>(json, r'name')!,
        vehicleTypes: VehicleType.listFromJson(json[r'vehicleTypes']).toSet(),
        locale: Locale.fromJson(json[r'locale'])!,
        regionProfile: WorkshopSummaryRegionProfileEnum.fromJson(json[r'regionProfile'])!,
      );
    }
    return null;
  }

  static List<WorkshopSummary> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <WorkshopSummary>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = WorkshopSummary.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, WorkshopSummary> mapFromJson(dynamic json) {
    final map = <String, WorkshopSummary>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = WorkshopSummary.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of WorkshopSummary-objects as value to a dart map
  static Map<String, List<WorkshopSummary>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<WorkshopSummary>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = WorkshopSummary.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'workshopId',
    'name',
    'vehicleTypes',
    'locale',
    'regionProfile',
  };
}


enum WorkshopSummaryRegionProfileEnum {
  BD._(r'BD'),
  ;

  /// Instantiate a new enum with the provided value.
  const WorkshopSummaryRegionProfileEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [WorkshopSummaryRegionProfileEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static WorkshopSummaryRegionProfileEnum? fromJson(dynamic value) => WorkshopSummaryRegionProfileEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [WorkshopSummaryRegionProfileEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<WorkshopSummaryRegionProfileEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <WorkshopSummaryRegionProfileEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = WorkshopSummaryRegionProfileEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [WorkshopSummaryRegionProfileEnum] to String,
/// and [decode] dynamic data back to [WorkshopSummaryRegionProfileEnum].
class WorkshopSummaryRegionProfileEnumTypeTransformer {
  factory WorkshopSummaryRegionProfileEnumTypeTransformer() => _instance ??= const WorkshopSummaryRegionProfileEnumTypeTransformer._();

  const WorkshopSummaryRegionProfileEnumTypeTransformer._();

  String encode(WorkshopSummaryRegionProfileEnum data) => data._value;

  /// Returns the instance of [WorkshopSummaryRegionProfileEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  WorkshopSummaryRegionProfileEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is WorkshopSummaryRegionProfileEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'BD': return WorkshopSummaryRegionProfileEnum.BD;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static WorkshopSummaryRegionProfileEnumTypeTransformer? _instance;
}


