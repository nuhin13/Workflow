//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

library garazo_api_client.api;

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:collection/collection.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:meta/meta.dart';

part 'api_client.dart';
part 'api_helper.dart';
part 'api_exception.dart';
part 'auth/authentication.dart';
part 'auth/api_key_auth.dart';
part 'auth/oauth.dart';
part 'auth/http_basic_auth.dart';
part 'auth/http_bearer_auth.dart';

part 'api/access_api.dart';
part 'api/system_api.dart';
part 'api/workshops_api.dart';

part 'model/api_error.dart';
part 'model/dependency_state.dart';
part 'model/error_code.dart';
part 'model/error_envelope.dart';
part 'model/field_error.dart';
part 'model/grant_envelope.dart';
part 'model/identity_assertion_request.dart';
part 'model/live_response.dart';
part 'model/locale.dart';
part 'model/locale_preference.dart';
part 'model/owner_pin_recovery_request.dart';
part 'model/owner_pin_set_request.dart';
part 'model/owner_pin_verify_request.dart';
part 'model/owner_pin_verify_response.dart';
part 'model/readiness_checks.dart';
part 'model/ready_response.dart';
part 'model/session_envelope.dart';
part 'model/session_exchange_response.dart';
part 'model/vehicle_type.dart';
part 'model/walking_skeleton_response.dart';
part 'model/workshop_setup_request.dart';
part 'model/workshop_summary.dart';


/// An [ApiClient] instance that uses the default values obtained from
/// the OpenAPI specification file.
var defaultApiClient = ApiClient();

const _delimiters = {'csv': ',', 'ssv': ' ', 'tsv': '\t', 'pipes': '|'};
const _dateEpochMarker = 'epoch';
const _deepEquality = DeepCollectionEquality();
final _dateFormatter = DateFormat('yyyy-MM-dd');
final _regList = RegExp(r'^List<(.*)>$');
final _regSet = RegExp(r'^Set<(.*)>$');
final _regMap = RegExp(r'^Map<String,(.*)>$');

bool _isEpochMarker(String? pattern) => pattern == _dateEpochMarker || pattern == '/$_dateEpochMarker/';
