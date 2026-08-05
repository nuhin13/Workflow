//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class IdentityAssertionRequest {
  /// Returns a new [IdentityAssertionRequest] instance.
  IdentityAssertionRequest({
    required this.identityAssertion,
  });

  /// Opaque signed assertion from `PhoneIdentityPort` proving phone possession. Never logged, never echoed back, never stored raw. 
  String identityAssertion;

  @override
  bool operator ==(Object other) => identical(this, other) || other is IdentityAssertionRequest &&
    other.identityAssertion == identityAssertion;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (identityAssertion.hashCode);

  @override
  String toString() => 'IdentityAssertionRequest[identityAssertion=$identityAssertion]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'identityAssertion'] = this.identityAssertion;
    return json;
  }

  /// Returns a new [IdentityAssertionRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static IdentityAssertionRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'identityAssertion'), 'Required key "IdentityAssertionRequest[identityAssertion]" is missing from JSON.');
        assert(json[r'identityAssertion'] != null, 'Required key "IdentityAssertionRequest[identityAssertion]" has a null value in JSON.');
        return true;
      }());

      return IdentityAssertionRequest(
        identityAssertion: mapValueOfType<String>(json, r'identityAssertion')!,
      );
    }
    return null;
  }

  static List<IdentityAssertionRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <IdentityAssertionRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = IdentityAssertionRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, IdentityAssertionRequest> mapFromJson(dynamic json) {
    final map = <String, IdentityAssertionRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = IdentityAssertionRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of IdentityAssertionRequest-objects as value to a dart map
  static Map<String, List<IdentityAssertionRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<IdentityAssertionRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = IdentityAssertionRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'identityAssertion',
  };
}

