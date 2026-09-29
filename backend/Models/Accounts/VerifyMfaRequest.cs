using System.ComponentModel.DataAnnotations;

namespace WebApi.Models.Accounts
{
    public class VerifyMfaRequest
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string MfaCode { get; set; }
    }
}
