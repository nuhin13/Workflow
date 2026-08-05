//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of garazo_api_client.api;


class SystemApi {
  SystemApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Process liveness
  ///
  /// Process-local only. Makes no downstream call, so a healthy response says nothing about the database or any provider. 
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> systemLiveWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/system/live';

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

  /// Process liveness
  ///
  /// Process-local only. Makes no downstream call, so a healthy response says nothing about the database or any provider. 
  Future<LiveResponse?> systemLive({ Future<void>? abortTrigger, }) async {
    final response = await systemLiveWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'LiveResponse',) as LiveResponse;
    
    }
    return null;
  }

  /// Dependency readiness
  ///
  /// Reports whether required dependencies are reachable. The body carries coarse up/down states only — never a hostname, URL, driver version, or stack trace. 
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> systemReadyWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/system/ready';

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

  /// Dependency readiness
  ///
  /// Reports whether required dependencies are reachable. The body carries coarse up/down states only — never a hostname, URL, driver version, or stack trace. 
  Future<ReadyResponse?> systemReady({ Future<void>? abortTrigger, }) async {
    final response = await systemReadyWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'ReadyResponse',) as ReadyResponse;
    
    }
    return null;
  }

  /// Gated persistence probe (E00 diagnostic)
  ///
  /// Proves one end-to-end round trip from client to API to PostgreSQL and back. It exists to validate the skeleton, not to model product behaviour, and it is deliberately NOT idempotent: each accepted call increments the counter.  Available only when the environment is not production AND the `system.walkingSkeleton` flag is true. Otherwise the route reports 404 so its existence is not disclosed (EARS-E00-5). 
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [Object] body (required):
  Future<Response> systemWalkingSkeletonWithHttpInfo(Object body, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/v1/system/walking-skeleton';

    // ignore: prefer_final_locals
    Object? postBody = body;

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

  /// Gated persistence probe (E00 diagnostic)
  ///
  /// Proves one end-to-end round trip from client to API to PostgreSQL and back. It exists to validate the skeleton, not to model product behaviour, and it is deliberately NOT idempotent: each accepted call increments the counter.  Available only when the environment is not production AND the `system.walkingSkeleton` flag is true. Otherwise the route reports 404 so its existence is not disclosed (EARS-E00-5). 
  ///
  /// Parameters:
  ///
  /// * [Object] body (required):
  Future<WalkingSkeletonResponse?> systemWalkingSkeleton(Object body, { Future<void>? abortTrigger, }) async {
    final response = await systemWalkingSkeletonWithHttpInfo(body, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'WalkingSkeletonResponse',) as WalkingSkeletonResponse;
    
    }
    return null;
  }
}
