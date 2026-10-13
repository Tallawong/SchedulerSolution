using System.Threading.Tasks;

namespace Backend.Interfaces;

public interface IEmailService
{
    void Send(string to, string subject, string html, string? from = null);
    Task SendEmailAsync(string to, string subject, string html, string? from = null);
}