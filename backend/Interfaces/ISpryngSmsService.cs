using System.Threading.Tasks;

namespace Backend.Interfaces;

public interface ISpryngSmsService
{
    Task<bool> SendSmsAsync(string phoneNumber, string message);
    Task<bool> SendSmsVerificationCodeAsync(string phoneNumber, string code);
}
