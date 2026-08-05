//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class OwnerPinVerifyResponse {
  /// Returns a new [OwnerPinVerifyResponse] instance.
  OwnerPinVerifyResponse({
    required this.grant,
  });

  GrantEnvelope grant;

  @override
  bool operator ==(Object other) => identical(this, other) || other is OwnerPinVerifyResponse &&
    other.grant == grant;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (grant.hashCode);

  @override
  String toString() => 'OwnerPinVerifyResponse[grant=$grant]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'grant'] = this.grant;
    return json;
  }

  /// Returns a new [OwnerPinVerifyResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static OwnerPinVerifyResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'grant'), 'Required key "OwnerPinVerifyResponse[grant]" is missing from JSON.');
        assert(json[r'grant'] != null, 'Required key "OwnerPinVerifyResponse[grant]" has a null value in JSON.');
        return true;
      }());

      return OwnerPinVerifyResponse(
        grant: GrantEnvelope.fromJson(json[r'grant'])!,
      );
    }
    return null;
  }

  static List<OwnerPinVerifyResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <OwnerPinVerifyResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = OwnerPinVerifyResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, OwnerPinVerifyResponse> mapFromJson(dynamic json) {
    final map = <String, OwnerPinVerifyResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = OwnerPinVerifyResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of OwnerPinVerifyResponse-objects as value to a dart map
  static Map<String, List<OwnerPinVerifyResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<OwnerPinVerifyResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = OwnerPinVerifyResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'grant',
  };
}

