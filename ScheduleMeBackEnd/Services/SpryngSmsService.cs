using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using log4net;
using Microsoft.Extensions.Options;
using WebApi.Helpers;

namespace WebApi.Services
{
    public class SpryngSmsService : ISpryngSmsService
    {
        private static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly HttpClient _httpClient;
        private readonly string _apiToken;
        private readonly string _sender;
        private const string SPRYNG_API_URL = "https://rest.spryngsms.com/v1/messages";

        public SpryngSmsService(IHttpClientFactory httpClientFactory, IOptions<AppSettings> appSettings)
        {
            _httpClient = httpClientFactory.CreateClient();
            _apiToken = appSettings.Value.SpryngApiToken;
            _sender = appSettings.Value.SpryngSender ?? "ScheduleMe";
        }

        public async Task<bool> SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                if (string.IsNullOrEmpty(_apiToken))
                {
                    log.Error("Spryng API token is not configured");
                    return false;
                }

                var payload = new
                {
                    recipients = new[] { phoneNumber },
                    body = message,
                    originator = _sender,
                    route = "business" // or "economy"
                };

                var jsonContent = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage(HttpMethod.Post, SPRYNG_API_URL)
                {
                    Content = content
                };
                request.Headers.Add("Authorization", $"Bearer {_apiToken}");

                var response = await _httpClient.SendAsync(request);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    log.InfoFormat("SMS sent successfully to {0}", phoneNumber);
                    return true;
                }
                else
                {
                    log.ErrorFormat("Failed to send SMS to {0}. Status: {1}, Response: {2}", 
                        phoneNumber, response.StatusCode, responseContent);
                    return false;
                }
            }
            catch (Exception ex)
            {
                log.Error($"Error sending SMS to {phoneNumber}", ex);
                return false;
            }
        }

        public async Task<bool> SendVerificationCodeAsync(string phoneNumber, string code)
        {
            var message = $"Your verification code is: {code}. Valid for 10 minutes.";
            return await SendSmsAsync(phoneNumber, message);
        }
    }
}
