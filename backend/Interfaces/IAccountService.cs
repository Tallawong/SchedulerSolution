using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using WebApi.Entities;
using WebApi.Models.Accounts;

namespace Backend.Interfaces;

public interface IAccountService
{
    AuthenticateResponse Authenticate(AuthenticateRequest model, string ipAddress);
    Task<MfaResponse> AuthenticateWithMfaAsync(AuthenticateRequest model, string ipAddress);
    Task<AuthenticateResponse> VerifyMfaAsync(VerifyMfaRequest model, string ipAddress);
    AuthenticateResponse RefreshToken(string token, string ipAddress);
    void RevokeToken(string token, string ipAddress);
    IdentityResult Register(RegisterRequest model, string origin);
    void VerifyEmail(VerifyEmailRequest model);
    void ForgotPassword(ForgotPasswordRequest model, string origin);
    void ValidateResetToken(ValidateResetTokenRequest mode);
    void ResetPassword(ResetPasswordRequest model);
    IEnumerable<AccountResponse> GetAll();
    IEnumerable<AccountResponse> GetAccountsForDateAndTask(AccountsByDateAndTaskDTO accountsByDateAndTaskDTO);

    AccountResponse GetById(string id);

    ScheduleDateTimeResponse GetAllDates();
    DateFunctionTeamResponse GetTeamsByFunctionForDate(string date);

    AccountResponse Create(CreateRequest model);
    AccountResponse Update(string id, AccountRequest model);
    AccountResponse DeleteSchedule(string id, UpdateScheduleRequest scheduleReq);
    void DeleteSchedules4Date(string dateStr);

    IEnumerable<UpdateScheduleRequest> DeleteAllSchedules();
    Boolean DeleteAllTimeSlots();

    AccountResponse AddSchedule(string id, UpdateScheduleRequest scheduleReq);
    AccountResponse UpdateSchedule(string id, UpdateScheduleRequest scheduleReq);
    IEnumerable<AccountResponse> GetSchedules4Date(string dateStr);
    (AccountResponse, string) DeleteFunction(string id, AgentTask functionReq);
    AccountResponse AddFunction(string id, AgentTask functionReq);
    IEnumerable<Account> TestAddFunction(string id, AgentTask task);
    AccountResponse GetScheduleFromPool(string id, UpdateScheduleRequest scheduleReq);
    AccountResponse MoveSchedule2Pool(string id, UpdateScheduleRequest scheduleReq);

    SchedulePoolElementsResponse GetAvailablePoolElementsForAccount(string id);
    SchedulePoolElementsResponse GetAllAvailablePoolElements();

    SchedulePoolElement RemoveFromPool(int id, string email, string userFunction);

    void Delete(string id);

    List<AgentTaskConfig> GetAllAgentTaskConfigs();

    AgentTaskConfig[] UpdateAgentTaskConfig(string id, UpdateAgentTaskConfigRequest agentTaskConfigReq);

    void DeleteAgentTaskConfig(string id);

    void DeleteAllAgentTaskConfigs();

    void UploadUserAccounts(string path);
    Boolean GenerateSchedules();
    void ImportTimeSlotsTasks(string xlsmfullPath);

    Byte[] DownloadSchedules();

    TimeSlotTasks[] GetTimeSlotsTasks();

    TimeSlotTasks[] SetTimeSlotsTasks(TimeSlotTasks tasks);
    Boolean DeleteTimeSlotsTasks(TimeSlotTasks slotFromClient);

    IEnumerable<AccountResponse> DeleteAllUserAccounts();
    bool GetAutoEmail();
    bool SetAutoEmail(bool autoEmail);
    void SendRemindingEmail4Functions();

    // MFA methods
    Task EnableMfaAsync(string userId, string phoneNumber);
    Task DisableMfaAsync(string userId);
    bool IsMfaEnabled(string userId);
}
