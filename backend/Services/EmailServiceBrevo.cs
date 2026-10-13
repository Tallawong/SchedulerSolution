#nullable enable
using Backend.Helpers;
using Backend.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Services;

public sealed class EmailServiceBrevo : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<EmailServiceBrevo> _logger;
    private readonly string _brevoApiKey;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailServiceBrevo(HttpClient httpClient, ILogger<EmailServiceBrevo> logger, IConfiguration config)
    {
        _httpClient = httpClient;
        _logger = logger;

        _brevoApiKey = (Environment.GetEnvironmentVariable("BREVO_API_KEY")
            ?? config["Brevo:BREVO_API_KEY"]
            ?? string.Empty).Trim();

        _fromEmail = (Environment.GetEnvironmentVariable("BREVO_FROM_EMAIL")
            ?? config["Brevo:BREVO_FROM_EMAIL"]
            ?? string.Empty).Trim();

        _fromName = (Environment.GetEnvironmentVariable("BREVO_FROM_NAME")
            ?? config["Brevo:BREVO_FROM_NAME"]
            ?? "BackEnd").Trim();
    }

    public Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        return SendEmailCoreAsync(to, subject, body, null);
    }

    private async Task<bool> SendEmailCoreAsync(string to, string subject, string body, string? from)
    {
        var fromEmail = from ?? _fromEmail;
        if (string.IsNullOrWhiteSpace(_brevoApiKey) || string.IsNullOrWhiteSpace(fromEmail))
        {
            throw new HttpStatusException(
                statusCode: StatusCodes.Status500InternalServerError,
                message: "Email service is not configured.",
                errorCode: "EMAIL_CONFIG_MISSING");
        }

        var payload = new
        {
            sender = new { email = fromEmail, name = _fromName },
            to = new[] { new { email = to } },
            subject,
            htmlContent = body
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };

        request.Headers.TryAddWithoutValidation("api-key", _brevoApiKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
        {
            _logger.LogInformation("Email sent successfully to {To}", to);
            return true;
        }

        _logger.LogError("Failed to send email. Status: {Status}. Error: {Error}", response.StatusCode, responseBody);

        var status = response.StatusCode == HttpStatusCode.TooManyRequests
            ? StatusCodes.Status503ServiceUnavailable
            : StatusCodes.Status502BadGateway;

        throw new HttpStatusException(
            statusCode: status,
            message: "Email provider is currently unavailable. Please try again later.",
            errorCode: "EMAIL_PROVIDER_ERROR",
            inner: new Exception($"Brevo status={(int)response.StatusCode}, body={responseBody}"));
    }
}
