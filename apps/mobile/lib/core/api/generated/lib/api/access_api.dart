//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;


class AccessApi {
  AccessApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Exchange a Firebase phone-identity assertion for a Garazo session
  ///
  /// Verifies the assertion through the server's `PhoneIdentityPort` and rotates the Garazo application session: this call always issues a NEW session, and any previous session for the account stops being valid. Not idempotent.  `workshop` is `null` when the account has completed no setup yet. That is how a client knows to show first-time setup rather than the dashboard — it is never signalled as a 404.  Every failure of this exchange — unknown number, wrong code, expired assertion — returns the SAME `AUTH.INVALID_CREDENTIALS` response, so this endpoint cannot be used to test whether a phone number is a registered Garazo account (`EARS-E01-T01-3`, `L-auth-003`). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [IdentityAssertionRequest] identityAssertionRequest (required):
  Future<Response> exchangeIdentityAssertionWithHttpInfo(IdentityAssertionRequest identityAssertionRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/access/sessions';

    // ignore: prefer_final_locals
    Object? postBody = identityAssertionRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Exchange a Firebase phone-identity assertion for a Garazo session
  ///
  /// Verifies the assertion through the server's `PhoneIdentityPort` and rotates the Garazo application session: this call always issues a NEW session, and any previous session for the account stops being valid. Not idempotent.  `workshop` is `null` when the account has completed no setup yet. That is how a client knows to show first-time setup rather than the dashboard — it is never signalled as a 404.  Every failure of this exchange — unknown number, wrong code, expired assertion — returns the SAME `AUTH.INVALID_CREDENTIALS` response, so this endpoint cannot be used to test whether a phone number is a registered Garazo account (`EARS-E01-T01-3`, `L-auth-003`). 
  ///
  /// Parameters:
  ///
  /// * [IdentityAssertionRequest] identityAssertionRequest (required):
  Future<SessionExchangeResponse?> exchangeIdentityAssertion(IdentityAssertionRequest identityAssertionRequest, { Future<void>? abortTrigger, }) async {
    final response = await exchangeIdentityAssertionWithHttpInfo(identityAssertionRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'SessionExchangeResponse',) as SessionExchangeResponse;
    
    }
    return null;
  }

  /// Restore the current authorized session and workshop context
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getCurrentSessionWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/access/session';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Restore the current authorized session and workshop context
  Future<SessionExchangeResponse?> getCurrentSession({ Future<void>? abortTrigger, }) async {
    final response = await getCurrentSessionWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'SessionExchangeResponse',) as SessionExchangeResponse;
    
    }
    return null;
  }

  /// Verify a registered-phone OTP assertion and set a new PIN
  ///
  /// Atomically verifies `recoveryAssertion` and sets `newPin` in one step — there is no separate \"verify then set\" round trip, so there is nothing to race. An invalid or expired assertion leaves the existing PIN unchanged (`FR-ACCESS-14`). Success resets the next failure-cycle cooldown to 60 seconds (`FR-ACCESS-15`).  Throttled independently of the PIN failure cycle so recovery cannot be used to bypass PIN cooldown (`Q-009`): at most 5 OTP sends per registered phone per rolling hour, each OTP valid 5 minutes, at most 5 verify attempts per OTP. Exceeding either limit returns `AUTH.RECOVERY_COOLDOWN` and never reveals whether the phone is registered. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [OwnerPinRecoveryRequest] ownerPinRecoveryRequest (required):
  Future<Response> recoverOwnerPinWithHttpInfo(OwnerPinRecoveryRequest ownerPinRecoveryRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/access/owner-pin/recoveries';

    // ignore: prefer_final_locals
    Object? postBody = ownerPinRecoveryRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Verify a registered-phone OTP assertion and set a new PIN
  ///
  /// Atomically verifies `recoveryAssertion` and sets `newPin` in one step — there is no separate \"verify then set\" round trip, so there is nothing to race. An invalid or expired assertion leaves the existing PIN unchanged (`FR-ACCESS-14`). Success resets the next failure-cycle cooldown to 60 seconds (`FR-ACCESS-15`).  Throttled independently of the PIN failure cycle so recovery cannot be used to bypass PIN cooldown (`Q-009`): at most 5 OTP sends per registered phone per rolling hour, each OTP valid 5 minutes, at most 5 verify attempts per OTP. Exceeding either limit returns `AUTH.RECOVERY_COOLDOWN` and never reveals whether the phone is registered. 
  ///
  /// Parameters:
  ///
  /// * [OwnerPinRecoveryRequest] ownerPinRecoveryRequest (required):
  Future<void> recoverOwnerPin(OwnerPinRecoveryRequest ownerPinRecoveryRequest, { Future<void>? abortTrigger, }) async {
    final response = await recoverOwnerPinWithHttpInfo(ownerPinRecoveryRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Revoke the current application session
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> revokeCurrentSessionWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/access/session';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'DELETE',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Revoke the current application session
  Future<void> revokeCurrentSession({ Future<void>? abortTrigger, }) async {
    final response = await revokeCurrentSessionWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Explicitly revoke the current owner-money grant
  ///
  /// Explicit lock (`FR-ACCESS-07`). Always succeeds when the session is valid, whether or not a grant was currently active. 
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> revokeOwnerGrantWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/access/owner-pin/grant';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'DELETE',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Explicitly revoke the current owner-money grant
  ///
  /// Explicit lock (`FR-ACCESS-07`). Always succeeds when the session is valid, whether or not a grant was currently active. 
  Future<void> revokeOwnerGrant({ Future<void>? abortTrigger, }) async {
    final response = await revokeOwnerGrantWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Persist the Bangla/English presentation preference
  ///
  /// Changes presentation only. No stored business value changes when the locale changes (`NFR-I18N-01`–`03`). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [LocalePreference] localePreference (required):
  Future<Response> setLocalePreferenceWithHttpInfo(LocalePreference localePreference, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/access/preferences/locale';

    // ignore: prefer_final_locals
    Object? postBody = localePreference;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Persist the Bangla/English presentation preference
  ///
  /// Changes presentation only. No stored business value changes when the locale changes (`NFR-I18N-01`–`03`). 
  ///
  /// Parameters:
  ///
  /// * [LocalePreference] localePreference (required):
  Future<LocalePreference?> setLocalePreference(LocalePreference localePreference, { Future<void>? abortTrigger, }) async {
    final response = await setLocalePreferenceWithHttpInfo(localePreference, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'LocalePreference',) as LocalePreference;
    
    }
    return null;
  }

  /// Establish the initial owner PIN, or replace it with recovery proof
  ///
  /// Idempotent by method. Establishing a PIN for the first time needs no `recoveryAssertion`; replacing an existing PIN without a valid session step-up requires one (`recoveryAssertion`), verified the same way `POST .../recoveries` verifies it. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [OwnerPinSetRequest] ownerPinSetRequest (required):
  Future<Response> setOwnerPinWithHttpInfo(OwnerPinSetRequest ownerPinSetRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/access/owner-pin';

    // ignore: prefer_final_locals
    Object? postBody = ownerPinSetRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PUT',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Establish the initial owner PIN, or replace it with recovery proof
  ///
  /// Idempotent by method. Establishing a PIN for the first time needs no `recoveryAssertion`; replacing an existing PIN without a valid session step-up requires one (`recoveryAssertion`), verified the same way `POST .../recoveries` verifies it. 
  ///
  /// Parameters:
  ///
  /// * [OwnerPinSetRequest] ownerPinSetRequest (required):
  Future<void> setOwnerPin(OwnerPinSetRequest ownerPinSetRequest, { Future<void>? abortTrigger, }) async {
    final response = await setOwnerPinWithHttpInfo(ownerPinSetRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Verify the owner PIN and issue the separate owner-money grant
  ///
  /// Not idempotent — each call consumes one attempt of the current failure cycle (`Q-005`). Success resets the next cooldown to 60 seconds (`FR-ACCESS-15`).  The FIFTH wrong attempt of a cycle returns 429 `AUTH.PIN_COOLDOWN`, not 401: the cooldown starts on that attempt, so the response that starts it must already carry `retryAfterSeconds` (`EARS-E01-T01` correction, aligns with `T05`). Attempts 1–4 return 401 `AUTH.PIN_INVALID` with the `X-Pin-Remaining-Attempts` header. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [OwnerPinVerifyRequest] ownerPinVerifyRequest (required):
  Future<Response> verifyOwnerPinWithHttpInfo(OwnerPinVerifyRequest ownerPinVerifyRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/access/owner-pin/verifications';

    // ignore: prefer_final_locals
    Object? postBody = ownerPinVerifyRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Verify the owner PIN and issue the separate owner-money grant
  ///
  /// Not idempotent — each call consumes one attempt of the current failure cycle (`Q-005`). Success resets the next cooldown to 60 seconds (`FR-ACCESS-15`).  The FIFTH wrong attempt of a cycle returns 429 `AUTH.PIN_COOLDOWN`, not 401: the cooldown starts on that attempt, so the response that starts it must already carry `retryAfterSeconds` (`EARS-E01-T01` correction, aligns with `T05`). Attempts 1–4 return 401 `AUTH.PIN_INVALID` with the `X-Pin-Remaining-Attempts` header. 
  ///
  /// Parameters:
  ///
  /// * [OwnerPinVerifyRequest] ownerPinVerifyRequest (required):
  Future<OwnerPinVerifyResponse?> verifyOwnerPin(OwnerPinVerifyRequest ownerPinVerifyRequest, { Future<void>? abortTrigger, }) async {
    final response = await verifyOwnerPinWithHttpInfo(ownerPinVerifyRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'OwnerPinVerifyResponse',) as OwnerPinVerifyResponse;
    
    }
    return null;
  }
}
