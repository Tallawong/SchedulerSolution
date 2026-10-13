#nullable enable
using System.Threading.Tasks;

namespace Backend.Interfaces;

public interface IEmailService
{
    /// <summary>Sends an email asynchronously and returns whether the provider accepted it.</summary>
    Task<bool> SendEmailAsync(string to, string subject, string body);
}