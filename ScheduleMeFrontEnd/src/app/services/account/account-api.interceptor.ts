import { HttpContext, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';

/** Options missing from the generated signatures. Keep these outside generated code. */
export interface AccountApiRequestOptions {
  withCredentials?: boolean;
  formData?: FormData;
  responseType?: 'blob';
}

const ACCOUNT_API_REQUEST = new HttpContextToken<AccountApiRequestOptions | null>(() => null);

export function accountApiOptions(options: AccountApiRequestOptions) {
  return {
    context: new HttpContext().set(ACCOUNT_API_REQUEST, options),
    transferCache: false,
  };
}

/** Only requests explicitly marked by AccountService are changed. */
export const accountApiInterceptor: HttpInterceptorFn = (request, next) => {
  const options = request.context.get(ACCOUNT_API_REQUEST);
  if (!options) return next(request);

  return next(
    request.clone({
      withCredentials: options.withCredentials ?? request.withCredentials,
      responseType: options.responseType ?? request.responseType,
      // The current upload operations have no requestBody in the OpenAPI document.
      // Let the browser generate the multipart boundary; never set it manually.
      ...(options.formData !== undefined
        ? {
            body: options.formData,
            headers: request.headers.delete('Content-Type'),
          }
        : {}),
    }),
  );
};
