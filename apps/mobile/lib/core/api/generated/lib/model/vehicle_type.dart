//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

/// The approved workshop vehicle-type keys (`Q-008`, BRD v1 §1, ordered by the §3 beachhead). Additive-only: later keys may be appended, existing keys never change meaning. Display labels live in ARB files, never here. 
enum VehicleType {
  bike._(r'bike'),
  cng._(r'cng'),
  car._(r'car'),
  truck._(r'truck'),
  ;

  /// Instantiate a new enum with the provided value.
  const VehicleType._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [VehicleType] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static VehicleType? fromJson(dynamic value) => VehicleTypeTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [VehicleType]
  /// that were successfully decoded from the passed [JSON][json].
  static List<VehicleType> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VehicleType>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VehicleType.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [VehicleType] to String,
/// and [decode] dynamic data back to [VehicleType].
class VehicleTypeTypeTransformer {
  factory VehicleTypeTypeTransformer() => _instance ??= const VehicleTypeTypeTransformer._();

  const VehicleTypeTypeTransformer._();

  /// Encodes this enum as a value suitable for JSON.
  String encode(VehicleType data) => data._value;

  /// Returns the instance of [VehicleType] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  VehicleType? decode(dynamic data, {bool allowNull = true}) {
    if (data is VehicleType) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'bike': return VehicleType.bike;
        case r'cng': return VehicleType.cng;
        case r'car': return VehicleType.car;
        case r'truck': return VehicleType.truck;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static VehicleTypeTypeTransformer? _instance;
}

