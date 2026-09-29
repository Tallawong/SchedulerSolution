using System;
using System.Threading.Tasks;

namespace WebApi.Services
{
    public interface IMfaService
    {
        Task<string> GenerateMfaCodeAsync(string userId);
        Task<bool> ValidateMfaCodeAsync(string userId, string code);
        Task<bool> SendMfaCodeViaSmsAsync(string userId, string phoneNumber);
        Task EnableMfaAsync(string userId, string phoneNumber);
        Task DisableMfaAsync(string userId);
        bool IsMfaEnabled(string userId);
    }
}
