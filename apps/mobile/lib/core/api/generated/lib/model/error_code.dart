//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;

/// Stable machine-readable code. Clients branch on this, never on the message. 
enum ErrorCode {
  ValidationInvalidField._(r'VALIDATION.INVALID_FIELD'),
  SystemNotFound._(r'SYSTEM.NOT_FOUND'),
  SystemNotReady._(r'SYSTEM.NOT_READY'),
  SystemDatabaseUnavailable._(r'SYSTEM.DATABASE_UNAVAILABLE'),
  SystemInternalError._(r'SYSTEM.INTERNAL_ERROR'),
  AuthInvalidCredentials._(r'AUTH.INVALID_CREDENTIALS'),
  AuthSessionInvalid._(r'AUTH.SESSION_INVALID'),
  AuthPinInvalid._(r'AUTH.PIN_INVALID'),
  AuthPinCooldown._(r'AUTH.PIN_COOLDOWN'),
  AuthPinNotSet._(r'AUTH.PIN_NOT_SET'),
  AuthRecoveryInvalid._(r'AUTH.RECOVERY_INVALID'),
  AuthRecoveryCooldown._(r'AUTH.RECOVERY_COOLDOWN'),
  AuthGrantRequired._(r'AUTH.GRANT_REQUIRED'),
  WorkshopNotSetUp._(r'WORKSHOP.NOT_SET_UP'),
  WorkshopAlreadySetUp._(r'WORKSHOP.ALREADY_SET_UP'),
  ;

  /// Instantiate a new enum with the provided value.
  const ErrorCode._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [ErrorCode] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static ErrorCode? fromJson(dynamic value) => ErrorCodeTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [ErrorCode]
  /// that were successfully decoded from the passed [JSON][json].
  static List<ErrorCode> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ErrorCode>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ErrorCode.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ErrorCode] to String,
/// and [decode] dynamic data back to [ErrorCode].
class ErrorCodeTypeTransformer {
  factory ErrorCodeTypeTransformer() => _instance ??= const ErrorCodeTypeTransformer._();

  const ErrorCodeTypeTransformer._();

  /// Encodes this enum as a value suitable for JSON.
  String encode(ErrorCode data) => data._value;

  /// Returns the instance of [ErrorCode] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ErrorCode? decode(dynamic data, {bool allowNull = true}) {
    if (data is ErrorCode) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'VALIDATION.INVALID_FIELD': return ErrorCode.ValidationInvalidField;
        case r'SYSTEM.NOT_FOUND': return ErrorCode.SystemNotFound;
        case r'SYSTEM.NOT_READY': return ErrorCode.SystemNotReady;
        case r'SYSTEM.DATABASE_UNAVAILABLE': return ErrorCode.SystemDatabaseUnavailable;
        case r'SYSTEM.INTERNAL_ERROR': return ErrorCode.SystemInternalError;
        case r'AUTH.INVALID_CREDENTIALS': return ErrorCode.AuthInvalidCredentials;
        case r'AUTH.SESSION_INVALID': return ErrorCode.AuthSessionInvalid;
        case r'AUTH.PIN_INVALID': return ErrorCode.AuthPinInvalid;
        case r'AUTH.PIN_COOLDOWN': return ErrorCode.AuthPinCooldown;
        case r'AUTH.PIN_NOT_SET': return ErrorCode.AuthPinNotSet;
        case r'AUTH.RECOVERY_INVALID': return ErrorCode.AuthRecoveryInvalid;
        case r'AUTH.RECOVERY_COOLDOWN': return ErrorCode.AuthRecoveryCooldown;
        case r'AUTH.GRANT_REQUIRED': return ErrorCode.AuthGrantRequired;
        case r'WORKSHOP.NOT_SET_UP': return ErrorCode.WorkshopNotSetUp;
        case r'WORKSHOP.ALREADY_SET_UP': return ErrorCode.WorkshopAlreadySetUp;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static ErrorCodeTypeTransformer? _instance;
}

