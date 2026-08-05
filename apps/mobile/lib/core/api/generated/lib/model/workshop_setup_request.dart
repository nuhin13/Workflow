//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class WorkshopSetupRequest {
  /// Returns a new [WorkshopSetupRequest] instance.
  WorkshopSetupRequest({
    required this.name,
    this.vehicleTypes = const {},
  });

  /// 1–120 characters after trimming; must not be only whitespace.
  String name;

  Set<VehicleType> vehicleTypes;

  @override
  bool operator ==(Object other) => identical(this, other) || other is WorkshopSetupRequest &&
    other.name == name &&
    _deepEquality.equals(other.vehicleTypes, vehicleTypes);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name.hashCode) +
    (vehicleTypes.hashCode);

  @override
  String toString() => 'WorkshopSetupRequest[name=$name, vehicleTypes=$vehicleTypes]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'name'] = this.name;
      json[r'vehicleTypes'] = this.vehicleTypes.toList(growable: false);
    return json;
  }

  /// Returns a new [WorkshopSetupRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static WorkshopSetupRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'name'), 'Required key "WorkshopSetupRequest[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "WorkshopSetupRequest[name]" has a null value in JSON.');
        assert(json.containsKey(r'vehicleTypes'), 'Required key "WorkshopSetupRequest[vehicleTypes]" is missing from JSON.');
        assert(json[r'vehicleTypes'] != null, 'Required key "WorkshopSetupRequest[vehicleTypes]" has a null value in JSON.');
        return true;
      }());

      return WorkshopSetupRequest(
        name: mapValueOfType<String>(json, r'name')!,
        vehicleTypes: VehicleType.listFromJson(json[r'vehicleTypes']).toSet(),
      );
    }
    return null;
  }

  static List<WorkshopSetupRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <WorkshopSetupRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = WorkshopSetupRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, WorkshopSetupRequest> mapFromJson(dynamic json) {
    final map = <String, WorkshopSetupRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = WorkshopSetupRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of WorkshopSetupRequest-objects as value to a dart map
  static Map<String, List<WorkshopSetupRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<WorkshopSetupRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = WorkshopSetupRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'name',
    'vehicleTypes',
  };
}

