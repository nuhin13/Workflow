//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

/// Coarse state only. No detail about the dependency is exposed.
enum DependencyState {
  up._(r'up'),
  down._(r'down'),
  ;

  /// Instantiate a new enum with the provided value.
  const DependencyState._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [DependencyState] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static DependencyState? fromJson(dynamic value) => DependencyStateTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [DependencyState]
  /// that were successfully decoded from the passed [JSON][json].
  static List<DependencyState> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DependencyState>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DependencyState.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [DependencyState] to String,
/// and [decode] dynamic data back to [DependencyState].
class DependencyStateTypeTransformer {
  factory DependencyStateTypeTransformer() => _instance ??= const DependencyStateTypeTransformer._();

  const DependencyStateTypeTransformer._();

  /// Encodes this enum as a value suitable for JSON.
  String encode(DependencyState data) => data._value;

  /// Returns the instance of [DependencyState] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  DependencyState? decode(dynamic data, {bool allowNull = true}) {
    if (data is DependencyState) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'up': return DependencyState.up;
        case r'down': return DependencyState.down;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static DependencyStateTypeTransformer? _instance;
}

