//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class OwnerPinRecoveryRequest {
  /// Returns a new [OwnerPinRecoveryRequest] instance.
  OwnerPinRecoveryRequest({
    required this.recoveryAssertion,
    required this.newPin,
  });

  /// Registered-phone OTP proof, opaque to Garazo. Never logged, never echoed, never stored raw. 
  String recoveryAssertion;

  /// Never logged, never echoed, never stored raw.
  String newPin;

  @override
  bool operator ==(Object other) => identical(this, other) || other is OwnerPinRecoveryRequest &&
    other.recoveryAssertion == recoveryAssertion &&
    other.newPin == newPin;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (recoveryAssertion.hashCode) +
    (newPin.hashCode);

  @override
  String toString() => 'OwnerPinRecoveryRequest[recoveryAssertion=$recoveryAssertion, newPin=$newPin]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'recoveryAssertion'] = this.recoveryAssertion;
      json[r'newPin'] = this.newPin;
    return json;
  }

  /// Returns a new [OwnerPinRecoveryRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static OwnerPinRecoveryRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'recoveryAssertion'), 'Required key "OwnerPinRecoveryRequest[recoveryAssertion]" is missing from JSON.');
        assert(json[r'recoveryAssertion'] != null, 'Required key "OwnerPinRecoveryRequest[recoveryAssertion]" has a null value in JSON.');
        assert(json.containsKey(r'newPin'), 'Required key "OwnerPinRecoveryRequest[newPin]" is missing from JSON.');
        assert(json[r'newPin'] != null, 'Required key "OwnerPinRecoveryRequest[newPin]" has a null value in JSON.');
        return true;
      }());

      return OwnerPinRecoveryRequest(
        recoveryAssertion: mapValueOfType<String>(json, r'recoveryAssertion')!,
        newPin: mapValueOfType<String>(json, r'newPin')!,
      );
    }
    return null;
  }

  static List<OwnerPinRecoveryRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OwnerPinRecoveryRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OwnerPinRecoveryRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, OwnerPinRecoveryRequest> mapFromJson(dynamic json) {
    final map = <String, OwnerPinRecoveryRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = OwnerPinRecoveryRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of OwnerPinRecoveryRequest-objects as value to a dart map
  static Map<String, List<OwnerPinRecoveryRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<OwnerPinRecoveryRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = OwnerPinRecoveryRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'recoveryAssertion',
    'newPin',
  };
}

