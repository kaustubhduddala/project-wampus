import assert from 'node:assert/strict';
import test from 'node:test';

import { mergeRequestHeaders } from '../src/api/requestHeaders.js';

const AUTH_HEADER_VALUE = 'Bearer test-token';

function assertAuthenticatedJsonMutationHeaders(headers) {
  assert.equal(
    headers.get('Content-Type'),
    'application/json',
    'Authenticated JSON mutation must include Content-Type: application/json'
  );
  assert.equal(
    headers.get('Authorization'),
    AUTH_HEADER_VALUE,
    'Authenticated JSON mutation must include Authorization header'
  );
}

test('authenticated POST headers include Authorization and Content-Type', () => {
  const headers = mergeRequestHeaders({ Authorization: AUTH_HEADER_VALUE });
  assertAuthenticatedJsonMutationHeaders(headers);
});

test('authenticated PUT headers include Authorization and Content-Type', () => {
  const headers = mergeRequestHeaders({
    Authorization: AUTH_HEADER_VALUE,
    Accept: 'application/json',
  });
  assertAuthenticatedJsonMutationHeaders(headers);
});

test('regression guard fails when Authorization header is missing', () => {
  const headers = mergeRequestHeaders();
  assert.throws(() => assertAuthenticatedJsonMutationHeaders(headers));
});

test('regression guard fails when Content-Type header is overwritten to non-JSON', () => {
  const headers = mergeRequestHeaders({
    Authorization: AUTH_HEADER_VALUE,
    'Content-Type': 'text/plain',
  });
  assert.throws(() => assertAuthenticatedJsonMutationHeaders(headers));
});
