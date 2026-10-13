using Backend.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Backend.Services;

public sealed class SmsServiceBrevo : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SmsServiceBrevo> _logger;
    private readonly string _brevoApiKey;
    private readonly string _sender;

    public SmsServiceBrevo(HttpClient httpClient, ILogger<SmsServiceBrevo> logger, IConfiguration config)
    {
        _httpClient = httpClient;
        _logger = logger;

        _brevoApiKey = (Environment.GetEnvironmentVariable("BREVO_API_KEY")
            ?? config["Brevo:BREVO_API_KEY"]
            ?? string.Empty).Trim();

        _sender = (Environment.GetEnvironmentVariable("BREVO_SENDER")
            ?? config["Brevo:BREVO_SENDER"]
            ?? string.Empty).Trim();
    }

    public async Task<bool> SendSmsAsync(string phoneNumber, string message)
    {
        if (string.IsNullOrWhiteSpace(_brevoApiKey) || string.IsNullOrWhiteSpace(_sender))
        {
            _logger.LogWarning("Brevo credentials not configured.");
            return false;
        }

        var payload = new
        {
            sender = _sender,
            recipient = phoneNumber,
            content = message,
            type = "transactional"
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/transactionalSMS/sms")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };

        request.Headers.TryAddWithoutValidation("api-key", _brevoApiKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
        {
            _logger.LogInformation("SMS sent successfully to {PhoneNumber}", phoneNumber);
            return true;
        }

        _logger.LogError("Failed to send SMS via Brevo. Status: {Status}. Error: {Error}", response.StatusCode, responseBody);
        return false;
    }

    public Task<bool> SendSmsMfaCodeAsync(string phoneNumber, string code)
    {
        var message = $"Your verification code is: {code}. This code expires in 5 minutes.";
        return SendSmsAsync(phoneNumber, message);
    }
}
