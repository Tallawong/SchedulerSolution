using System.Threading.Tasks;

namespace Backend.Interfaces;

public interface ISmsService
{
    Task<bool> SendSmsAsync(string phoneNumber, string message);
    Task<bool> SendSmsMfaCodeAsync(string phoneNumber, string code);
}
