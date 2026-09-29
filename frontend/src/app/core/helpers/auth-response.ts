import { MfaResponse } from '../../dto/responses/mfa-response';
import { AuthenticateResponse } from '../../shared/openapi-api-client/model/authenticateResponse';

export function isAuthenticateResponse(value: unknown): value is AuthenticateResponse {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const response = value as Record<string, unknown>;
  if (response['dob'] !== null && typeof response['dob'] !== 'string') return false;

  const nullableStrings = [
    'id',
    'title',
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'role',
    'updated',
    'jwtToken',
    'message',
    'tempToken',
  ];
  if (
    !nullableStrings.every(
      (key) =>
        response[key] === undefined || response[key] === null || typeof response[key] === 'string',
    )
  )
    return false;

  return (
    (response['created'] === undefined || typeof response['created'] === 'string') &&
    (response['isVerified'] === undefined || typeof response['isVerified'] === 'boolean') &&
    (!('mfaRequired' in response) || typeof response['mfaRequired'] === 'boolean')
  );
}

export function isMfaResponse(value: unknown): value is MfaResponse {
  return (
    isAuthenticateResponse(value) &&
    'mfaRequired' in value &&
    typeof value.mfaRequired === 'boolean'
  );
}
