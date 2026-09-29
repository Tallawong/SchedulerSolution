import { AuthenticateResponse } from '../../shared/openapi-api-client/model/authenticateResponse';

export interface MfaResponse extends AuthenticateResponse {
  mfaRequired: boolean;
  message?: string | null;
  tempToken?: string | null;
}
