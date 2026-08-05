//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class OwnerPinVerifyRequest {
  /// Returns a new [OwnerPinVerifyRequest] instance.
  OwnerPinVerifyRequest({
    required this.pin,
  });

  /// Never logged, never echoed, never stored raw.
  String pin;

  @override
  bool operator ==(Object other) => identical(this, other) || other is OwnerPinVerifyRequest &&
    other.pin == pin;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (pin.hashCode);

  @override
  String toString() => 'OwnerPinVerifyRequest[pin=$pin]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'pin'] = this.pin;
    return json;
  }

  /// Returns a new [OwnerPinVerifyRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static OwnerPinVerifyRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'pin'), 'Required key "OwnerPinVerifyRequest[pin]" is missing from JSON.');
        assert(json[r'pin'] != null, 'Required key "OwnerPinVerifyRequest[pin]" has a null value in JSON.');
        return true;
      }());

      return OwnerPinVerifyRequest(
        pin: mapValueOfType<String>(json, r'pin')!,
      );
    }
    return null;
  }

  static List<OwnerPinVerifyRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OwnerPinVerifyRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OwnerPinVerifyRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, OwnerPinVerifyRequest> mapFromJson(dynamic json) {
    final map = <String, OwnerPinVerifyRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = OwnerPinVerifyRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of OwnerPinVerifyRequest-objects as value to a dart map
  static Map<String, List<OwnerPinVerifyRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<OwnerPinVerifyRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = OwnerPinVerifyRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'pin',
  };
}

