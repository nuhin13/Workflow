//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;


class WorkshopsApi {
  WorkshopsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Read the workshop resolved for the current session
  ///
  /// \"Current\" means the workshop this session is authorized for, resolved entirely server-side. There is no request parameter that names a workshop, so a client cannot name someone else's (`NFR-SEC-01`). 
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> getCurrentWorkshopWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/workshops/current';

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

  /// Read the workshop resolved for the current session
  ///
  /// \"Current\" means the workshop this session is authorized for, resolved entirely server-side. There is no request parameter that names a workshop, so a client cannot name someone else's (`NFR-SEC-01`). 
  Future<WorkshopSummary?> getCurrentWorkshop({ Future<void>? abortTrigger, }) async {
    final response = await getCurrentWorkshopWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'WorkshopSummary',) as WorkshopSummary;
    
    }
    return null;
  }

  /// Complete the one-time initial workshop setup
  ///
  /// Idempotent by method, but only ever succeeds once per account: a second call returns `WORKSHOP.ALREADY_SET_UP`. BD region profile and the default Bangla locale are assigned by the access domain, not by this request. 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [WorkshopSetupRequest] workshopSetupRequest (required):
  Future<Response> setUpCurrentWorkshopWithHttpInfo(WorkshopSetupRequest workshopSetupRequest, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/workshops/current/setup';

    // ignore: prefer_final_locals
    Object? postBody = workshopSetupRequest;

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

  /// Complete the one-time initial workshop setup
  ///
  /// Idempotent by method, but only ever succeeds once per account: a second call returns `WORKSHOP.ALREADY_SET_UP`. BD region profile and the default Bangla locale are assigned by the access domain, not by this request. 
  ///
  /// Parameters:
  ///
  /// * [WorkshopSetupRequest] workshopSetupRequest (required):
  Future<WorkshopSummary?> setUpCurrentWorkshop(WorkshopSetupRequest workshopSetupRequest, { Future<void>? abortTrigger, }) async {
    final response = await setUpCurrentWorkshopWithHttpInfo(workshopSetupRequest, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'WorkshopSummary',) as WorkshopSummary;
    
    }
    return null;
  }
}
