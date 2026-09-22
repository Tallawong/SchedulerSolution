using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using WebApi.Helpers;

namespace WebApi.Models.Accounts
{
    public class RegisterRequest : IValidatableObject
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Dob { get; set; }

        [Required]
        public string Ts { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }

        [Range(typeof(bool), "true", "true")]
        public bool AcceptTerms { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!string.IsNullOrWhiteSpace(Dob) &&
                !DateOnly.TryParseExact(Dob, ConstantsDefined.DateFormat,
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out _))
            {
                yield return new ValidationResult(
                    "DOB must be a valid date in dd-MM-yyyy format.", new[] { nameof(Dob) });
            }

            if (!string.IsNullOrWhiteSpace(Ts) &&
                !DateTimeOffset.TryParseExact(Ts,
                    new[] { "yyyy-MM-dd'T'HH:mm:ss'Z'", "yyyy-MM-dd'T'HH:mm:ss.FFFFFFF'Z'" },
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out _))
            {
                yield return new ValidationResult(
                    "Ts must be a valid UTC ISO 8601 timestamp ending in Z.", new[] { nameof(Ts) });
            }
        }
    }
}