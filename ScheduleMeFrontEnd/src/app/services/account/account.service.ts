import { HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

//import { environment } from '@environments/environment';
import { Account, Role } from '../../entities';
import { RegisterRequest } from '../../dto/requests/register-request';
import { ForgotPasswordRequest } from '../../dto/requests/forgot-password-request';
import { ResetPasswordRequest } from '../../dto/requests/reset-password-request';
import { MfaResponse } from '../../dto/responses/mfa-response';
import { isAuthenticateResponse, isMfaResponse } from '../../core/helpers/auth-response';
//import { JwtHelperService } from '@auth0/angular-jwt';

//import { environment } from '../environments/environment';
import { AgentTaskConfig } from '../../entities/agenttaskconfig';
import { Schedule } from '../../entities/schedule';
import { ScheduleDateTimes } from '../../entities/scheduledatetimes';
import { SchedulePoolElement } from '../../entities/schedulepoolelement';
import { SchedulePoolElements } from '../../entities/schedulepoolelements';
import { Task } from '../../entities/task';
import { DateFunctionTeams } from '../../entities/teams';
import { TimeSlotsTasksDTO } from '../../entities/timeslotstasksDTO';
import { AccountsService } from '../../shared/openapi-api-client/api/accounts.service';
import { AuthenticateResponse } from '../../shared/openapi-api-client/model/authenticateResponse';
import { accountApiOptions } from './account-api.interceptor';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;
  private api = inject(AccountsService);
  private router = inject(Router);

  constructor() {
    this.accountSubject = new BehaviorSubject<Account | null>(null);
    this.account = this.accountSubject.asObservable();
  }

  public get accountValue(): Account | null {
    return this.accountSubject.value;
  }

  login(email: string, password: string, dob: string): Observable<MfaResponse | AuthenticateResponse> {
    return this.asLegacyResponse<MfaResponse | AuthenticateResponse>(
      this.api.accountsAuthenticateMfaPost(
        { email, password, dob },
        'body',
        false,
        accountApiOptions({ withCredentials: true }),
      ),
    ).pipe(tap((response) => this.setAuthenticatedAccount(response)));
  }

  verifyMfa(email: string, mfaCode: string): Observable<AuthenticateResponse> {
    return this.asLegacyResponse<AuthenticateResponse>(
      this.api.verifyMfa(
        { email, mfaCode },
        'body',
        false,
        accountApiOptions({ withCredentials: true }),
      ),
    ).pipe(tap((response) => this.setAuthenticatedAccount(response)));
  }

  logout() {
    this.api
      .accountsRevokeTokenPost({}, 'body', false, accountApiOptions({ withCredentials: true }))
      .subscribe();
    this.stopRefreshTokenTimer();
    this.accountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  refreshToken() {
    return this.asLegacyResponse<Account>(
      this.api.accountsRefreshTokenPost(
        'body',
        false,
        accountApiOptions({ withCredentials: true }),
      ),
    ).pipe(
      map((account) => {
        this.accountSubject.next(account);
        const cookie = document.cookie;
        this.startRefreshTokenTimer();
        return account;
      }),
    );
  }

  register(account: RegisterRequest) {
    // Preserve additional registration fields while adapting Date to the wire format.
    return this.api.accountsRegisterPost({
      ...account,
      title: account.title ?? null,
      dob: account.dob.toJSON(),
    });
  }

  verifyEmail(token: string, dob: string) {
    return this.api.accountsVerifyPost({ token, dob });
  }

  forgotPassword(request: ForgotPasswordRequest) {
    return this.api.accountsForgotPasswordPost({ ...request, dob: request.dob ?? null });
  }

  validateResetToken(token: string, dob: string) {
    return this.api.accountsValidateResetTokenPost({ token, dob });
  }

  resetPassword(request: ResetPasswordRequest) {
    return this.api.accountsResetPasswordPost(request);
  }

  getAll() {
    return this.asLegacyResponse<Account[]>(this.api.accountsGet());
  }

  getById(id: string) {
    return this.asLegacyResponse<Account>(this.api.accountsIdGet(id));
  }

  getAllDates() {
    return this.asLegacyResponse<ScheduleDateTimes>(this.api.accountsAllDatesGet());
  }
  getTeamsByFunctionForDate(dateStr: any) {
    return this.asLegacyResponse<DateFunctionTeams>(this.api.accountsTeamsForDateDateGet(dateStr));
  }

  generateSchedules() {
    return this.api.accountsGenerateSchedulesPost();
  }

  getTimeSlotsTasks() {
    return this.asLegacyResponse<TimeSlotsTasksDTO[]>(this.api.accountsTimeslotsTasksGet());
  }
  setTimeSlotsTasks(tasks: TimeSlotsTasksDTO) {
    return this.asLegacyResponse<TimeSlotsTasksDTO[]>(this.api.accountsTimeslotsTasksPut(tasks));
  }
  deleteTimeSlotsTasks(tasks: TimeSlotsTasksDTO) {
    return this.api.accountsTimeslotsTasksPost(tasks);
  }

  downloadSchedulesFile() {
    return this.asLegacyResponse<Blob>(
      this.api.accountsDownloadSchedulesFileGet(
        'body',
        false,
        accountApiOptions({ responseType: 'blob' }),
      ),
    );
  }
  getAvailablePoolElementsForAccount(id: any) {
    return this.asLegacyResponse<SchedulePoolElements>(
      this.api.accountsAvailablePoolElementsForAccountIdGet(id),
    );
  }
  GetAllAvailablePoolElements() {
    return this.asLegacyResponse<SchedulePoolElements>(
      this.api.accountsAllAvailablePoolElementsGet(),
    );
  }
  addSchedule(id: any, schedule: any) {
    return this.asLegacyResponse<Account>(this.api.accountsAddScheduleIdPut(id, schedule));
  }
  updateSchedule(id: any, schedule: Schedule) {
    return this.api.accountsUpdateScheduleIdPost(id, schedule).pipe(
      map((account: any) => {
        // update the current account if it was updated
        if (account.id === this.accountValue?.id) {
          // publish updated account to subscribers
          account = { ...this.accountValue, ...account };
          this.accountSubject.next(account);
        }
        return account;
      }),
    );
  }

  deleteSchedule(id: any, schedule: any) {
    return this.asLegacyResponse<Account>(this.api.accountsDeleteScheduleIdPost(id, schedule));
  }

  deleteSchedules4Date(date: string) {
    return this.api.accountsDeleteSchedules4DateDateStrDelete(date);
  }

  getSchedules4Date(dateStr: string) {
    return this.asLegacyResponse<Account[]>(this.api.accountsGetScheduleDateStrGet(dateStr));
  }

  addFunction(id: any, userTask: Task) {
    return this.asLegacyResponse<Account>(this.api.accountsAddFunctionIdPut(id, userTask));
  }

  testAddFunction(id: any, userTask: Task) {
    return this.asLegacyResponse<Account[]>(this.api.accountsTestAddFunctionIdPut(id, userTask));
  }

  deleteFunction(id: any, userTask: Task) {
    return this.asLegacyResponse<Account>(this.api.accountsDeleteFunctionIdPost(id, userTask));
  }

  deletePoolElement(id: string, email: string, userFunction: string) {
    return this.asLegacyResponse<SchedulePoolElement>(
      this.api.accountsRemovePoolElementIdEmailUserFunctionPost(id, email, userFunction),
    );
  }

  moveSchedule2Pool(id: any, schedule: any) {
    return this.asLegacyResponse<Account>(this.api.accountsMoveScheduleToPoolIdPost(id, schedule));
  }

  getScheduleFromPool(id: any, schedule: any) {
    return this.asLegacyResponse<Account>(this.api.accountsGetScheduleFromPoolIdPost(id, schedule));
  }

  create(params: any) {
    return this.api.accountsPost(params);
  }

  update(id: any, params: any) {
    return this.api.accountsIdPut(id, params).pipe(
      map((account: any) => {
        // update the current account if it was updated
        if (account.id === this.accountValue?.id) {
          // publish updated account to subscribers
          account = { ...this.accountValue, ...account };
          this.accountSubject.next(account);
        }
        return account;
      }),
    );
  }
  delete(id: string) {
    return this.api.accountsIdDelete(id).pipe(
      finalize(() => {
        // auto logout if the logged in account was deleted
        if (id === this.accountValue?.id) this.logout();
      }),
    );
  }

  uploadAccountsFile(formData: FormData) {
    return this.asLegacyResponse<HttpEvent<Account[]>>(
      this.api.accountsUploadAccountsPost('events', true, accountApiOptions({ formData })),
    );
  }
  uploadTimeSlotsFile(formData: FormData) {
    return this.asLegacyResponse<HttpEvent<Account[]>>(
      this.api.accountsUploadTimeslotsPost('events', true, accountApiOptions({ formData })),
    );
  }
  deleteAllUserAccounts() {
    return this.api.accountsDeleteAllUserAccountsDelete();
  }
  getAutoEmail(): any {
    return this.api.accountsAutoEmailGet();
  }
  setAutoEmail(autoEmail: Boolean) {
    return this.api.accountsAutoEmailPut(autoEmail.valueOf());
  }

  getAllAgentTaskConfigs() {
    return this.asLegacyResponse<AgentTaskConfig[]>(this.api.accountsGetAllAgentTaskConfigsGet());
  }
  updateAgentTaskConfig(id: string, config: AgentTaskConfig) {
    return this.asLegacyResponse<AgentTaskConfig[]>(
      this.api.accountsCreateAgentTaskConfigIdPut(id, config),
    );
  }
  deleteAgentTaskConfig(id: string) {
    return this.api.accountsDeleteAgentTaskConfigIdDelete(id);
  }

  isAdmin(): boolean {
    return this.accountValue?.role === Role.Admin;
  }
  // helper methods

  /**
   * Preserve the existing UI-facing types without modifying wire data. These models
   * include UI-only fields and stricter nullability than the generated DTOs.
   * Like the previous HttpClient<T> calls, this is a type assertion, not validation.
   */
  private asLegacyResponse<T>(response: Observable<unknown>): Observable<T> {
    return response as Observable<T>;
  }

  private setAuthenticatedAccount(response: unknown): void {
    if (!isAuthenticateResponse(response) || !response.jwtToken?.trim()) return;
    if (isMfaResponse(response) && response.mfaRequired) return;

    this.accountSubject.next(response as Account);
    this.stopRefreshTokenTimer();
    this.startRefreshTokenTimer();
  }

  private refreshTokenTimeout: ReturnType<typeof setTimeout> | undefined;

  private startRefreshTokenTimer() {
    // HEADER:ALGORITHM & TOKEN TYPE

    // parse json object from base64 encoded jwt token
    // var buf = Buffer.from(this.accountValue.jwtToken.split('.')[0], 'base64');
    // var header = JSON.parse(buf.toString('base64'));
    var header = JSON.parse(atob(this.accountValue!.jwtToken!.split('.')[0]));

    // PAYLOAD:DATA
    // parse json object from base64 encoded jwt token
    // var buf = Buffer.from(this.accountValue.jwtToken.split('.')[1], 'base64');
    // const payload = JSON.parse(buf.toString('base64'));
    const payload = JSON.parse(atob(this.accountValue!.jwtToken!.split('.')[1]));

    // VERIFY SIGNATURE
    // parse json object from base64 encoded jwt token
    const signature = this.accountValue!.jwtToken!.split('.')[2];

    // VERIFY SIGNATURE
    // parse json object from base64 encoded jwt token
    //const jwtSignature = JSON.parse(atob(this.accountValue.jwtToken.split('.')[2]));

    // parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(this.accountValue!.jwtToken!.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - 60 * 1000;
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  // private string hmacSha256(string data, string secret) {
  //     try {

  //         byte[] hash = secret.getBytes(StandardCharsets.UTF_8);
  //         Mac sha256Hmac = Mac.getInstance("HmacSHA256");
  //         SecretKeySpec secretKey = new SecretKeySpec(hash, "HmacSHA256");
  //         sha256Hmac.init(secretKey);

  //         byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
  //         return encode(signedBytes);
  //     } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
  //         Logger.getLogger(JWebToken.class.getName()).log(Level.SEVERE, ex.getMessage(), ex);
  //         return null;
  //     }
  // }
  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
