using System.Threading.Tasks;

namespace Backend.Interfaces;

public interface ISmsService
{
    Task<bool> SendSmsAsync(string phoneNumber, string message);
    Task<bool> SendMfaCodeAsync(string phoneNumber, string code);
}
