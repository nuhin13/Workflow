//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class OwnerPinSetRequest {
  /// Returns a new [OwnerPinSetRequest] instance.
  OwnerPinSetRequest({
    required this.pin,
    this.recoveryAssertion,
  });

  /// Exactly 4–6 digits. Never logged, never echoed, never stored raw.
  String pin;

  /// Required only to REPLACE an existing PIN outside a verified step-up; omitted when establishing the first PIN. Never logged, never echoed, never stored raw. 
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? recoveryAssertion;

  @override
  bool operator ==(Object other) => identical(this, other) || other is OwnerPinSetRequest &&
    other.pin == pin &&
    other.recoveryAssertion == recoveryAssertion;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (pin.hashCode) +
    (recoveryAssertion == null ? 0 : recoveryAssertion!.hashCode);

  @override
  String toString() => 'OwnerPinSetRequest[pin=$pin, recoveryAssertion=$recoveryAssertion]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'pin'] = this.pin;
    if (this.recoveryAssertion != null) {
      json[r'recoveryAssertion'] = this.recoveryAssertion;
    } else {
      json[r'recoveryAssertion'] = null;
    }
    return json;
  }

  /// Returns a new [OwnerPinSetRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static OwnerPinSetRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'pin'), 'Required key "OwnerPinSetRequest[pin]" is missing from JSON.');
        assert(json[r'pin'] != null, 'Required key "OwnerPinSetRequest[pin]" has a null value in JSON.');
        return true;
      }());

      return OwnerPinSetRequest(
        pin: mapValueOfType<String>(json, r'pin')!,
        recoveryAssertion: mapValueOfType<String>(json, r'recoveryAssertion'),
      );
    }
    return null;
  }

  static List<OwnerPinSetRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OwnerPinSetRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OwnerPinSetRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, OwnerPinSetRequest> mapFromJson(dynamic json) {
    final map = <String, OwnerPinSetRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = OwnerPinSetRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of OwnerPinSetRequest-objects as value to a dart map
  static Map<String, List<OwnerPinSetRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<OwnerPinSetRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = OwnerPinSetRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'pin',
  };
}

