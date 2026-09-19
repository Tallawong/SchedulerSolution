using System.Threading.Tasks;

namespace WebApi.Services
{
    public interface ISpryngSmsService
    {
        Task<bool> SendSmsAsync(string phoneNumber, string message);
        Task<bool> SendVerificationCodeAsync(string phoneNumber, string code);
    }
}
