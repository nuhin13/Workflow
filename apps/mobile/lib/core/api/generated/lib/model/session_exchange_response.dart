//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

class SessionExchangeResponse {
  /// Returns a new [SessionExchangeResponse] instance.
  SessionExchangeResponse({
    required this.session,
    required this.workshop,
  });

  SessionEnvelope session;

  WorkshopSummary? workshop;

  @override
  bool operator ==(Object other) => identical(this, other) || other is SessionExchangeResponse &&
    other.session == session &&
    other.workshop == workshop;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (session.hashCode) +
    (workshop == null ? 0 : workshop!.hashCode);

  @override
  String toString() => 'SessionExchangeResponse[session=$session, workshop=$workshop]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'session'] = this.session;
    if (this.workshop != null) {
      json[r'workshop'] = this.workshop;
    } else {
      json[r'workshop'] = null;
    }
    return json;
  }

  /// Returns a new [SessionExchangeResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static SessionExchangeResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'session'), 'Required key "SessionExchangeResponse[session]" is missing from JSON.');
        assert(json[r'session'] != null, 'Required key "SessionExchangeResponse[session]" has a null value in JSON.');
        assert(json.containsKey(r'workshop'), 'Required key "SessionExchangeResponse[workshop]" is missing from JSON.');
        return true;
      }());

      return SessionExchangeResponse(
        session: SessionEnvelope.fromJson(json[r'session'])!,
        workshop: WorkshopSummary.fromJson(json[r'workshop']),
      );
    }
    return null;
  }

  static List<SessionExchangeResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <SessionExchangeResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = SessionExchangeResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, SessionExchangeResponse> mapFromJson(dynamic json) {
    final map = <String, SessionExchangeResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = SessionExchangeResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of SessionExchangeResponse-objects as value to a dart map
  static Map<String, List<SessionExchangeResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<SessionExchangeResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = SessionExchangeResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'session',
    'workshop',
  };
}

