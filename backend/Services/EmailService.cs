#nullable enable
using Backend.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
//using Backend.Helpers;
using WebApi.Helpers;

namespace Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> log;
        private readonly AppSettings _appSettings;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public EmailService(IOptions<AppSettings> appSettings, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<EmailService> logger)
        {
            log = logger;
            _appSettings = appSettings.Value;
            _httpClient = httpClientFactory.CreateClient();
            _configuration = configuration;
        }

        public Task<bool> SendEmailAsync(string to, string subject, string body)
        {
            return SendEmailCoreAsync(to, subject, body, null);
        }

        private async Task<bool> SendEmailCoreAsync(string to, string subject, string html, string? from)
        {
            try
            {
                var fromEmail = from ?? _appSettings.EmailFrom;

                // Read from configured providers, including user secrets and environment variables.
                var apiKey = _configuration["AppSettings:BrevoApiKey"];
                
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    log.LogError("Brevo API key is not configured at AppSettings:BrevoApiKey");
                    throw new InvalidOperationException("Email service is not properly configured. Brevo API key is missing.");
                }

                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
                request.Headers.Add("api-key", apiKey);

                // Build email JSON
                var emailData = new
                {
                    sender = new { email = fromEmail, name = "TasksAPI" },
                    to = new[] { new { email = to } },
                    subject = subject,
                    htmlContent = html
                };

                request.Content = new StringContent(
                    JsonSerializer.Serialize(emailData),
                    Encoding.UTF8,
                    "application/json"
                );

                // Send the email
                using var response = await _httpClient.SendAsync(request).ConfigureAwait(false);

                if (response.IsSuccessStatusCode)
                {
                    log.LogInformation("Email sent via Brevo.");
                }
                else
                {
                    log.LogError($"Failed to send email via Brevo. Status: {response.StatusCode}");
                }
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                log.LogError($"Exception sending email via Brevo: {ex.GetType().Name}");
                return false;
            }
        }
    }
}