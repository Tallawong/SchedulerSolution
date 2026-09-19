namespace WebApi.Models.Accounts
{
    public class MfaResponse
    {
        public bool MfaRequired { get; set; }
        public string Message { get; set; }
        public string TempToken { get; set; } // Temporary token for MFA verification
    }
}
