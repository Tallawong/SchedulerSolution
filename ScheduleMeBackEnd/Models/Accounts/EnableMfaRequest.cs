using System.ComponentModel.DataAnnotations;

namespace WebApi.Models.Accounts
{
    public class EnableMfaRequest
    {
        [Required]
        [Phone]
        public string PhoneNumber { get; set; }
    }
}
