#nullable enable
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
//using Backend.Helpers;
using WebApi.Helpers;
using log4net;

namespace Backend.Services
{
    public interface IEmailService
    {
        void Send(string to, string subject, string html, string? from = null);
        Task SendAsync(string to, string subject, string html, string? from = null);
    }

    public class EmailService : IEmailService
    {
        // Use explicit type to avoid possible null being passed to GetLogger and satisfy nullable analysis
        private static readonly ILog log = LogManager.GetLogger(typeof(EmailService));
        private readonly AppSettings _appSettings;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public EmailService(IOptions<AppSettings> appSettings, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _appSettings = appSettings.Value;
            _httpClient = httpClientFactory.CreateClient();
            _configuration = configuration;
        }

        public void Send(string to, string subject, string html, string? from = null)
        {
            SendAsync(to, subject, html, from).ConfigureAwait(false).GetAwaiter().GetResult();
        }

        public async Task SendAsync(string to, string subject, string html, string? from = null)
        {
            try
            {
                var fromEmail = from ?? _appSettings.EmailFrom;

                // Read from configured providers, including user secrets and environment variables.
                var apiKey = _configuration["AppSettings:BrevoApiKey"];
                
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    log.Error("Brevo API key is not configured at AppSettings:BrevoApiKey");
                    throw new InvalidOperationException("Email service is not properly configured. Brevo API key is missing.");
                }

                var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
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
                var response = await _httpClient.SendAsync(request).ConfigureAwait(false);
                var responseContent = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                if (response.IsSuccessStatusCode)
                {
                    log.Info($"Success sending email via Brevo (FREE!)\n {subject}: {subject}\n Message: {html}\n To: {to}");
                }
                else
                {
                    log.Error($"Failed to send email via Brevo\n Subject: {subject}\n To: {to}\n Status: {response.StatusCode}\n Response: {responseContent}");
                }
            }
            catch (Exception ex)
            {
                log.Error($"Exception sending email via Brevo\n Subject: {subject}\n Message: {html}\n To: {to}\n Error: {ex.Message}", ex);
            }
        }
    }
}