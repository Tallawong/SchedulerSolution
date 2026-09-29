using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using log4net;
using Microsoft.EntityFrameworkCore;
using WebApi.Entities;
using WebApi.Helpers;

namespace WebApi.Services
{
    public class MfaService : IMfaService
    {
        private static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly DataContext _context;
        private readonly ISpryngSmsService _smsService;

        // In-memory cache for MFA codes (consider using Redis in production)
        private static readonly Dictionary<string, MfaCodeEntry> _mfaCodes = new Dictionary<string, MfaCodeEntry>();
        private const int CODE_EXPIRY_MINUTES = 10;
        private const int CODE_LENGTH = 6;

        public MfaService(DataContext context, ISpryngSmsService smsService)
        {
            _context = context;
            _smsService = smsService;
        }

        public async Task<string> GenerateMfaCodeAsync(string userId)
        {
            try
            {
                // Generate a 6-digit code
                var code = GenerateRandomNumericCode(CODE_LENGTH);
                
                var entry = new MfaCodeEntry
                {
                    Code = code,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(CODE_EXPIRY_MINUTES),
                    Attempts = 0
                };

                // Store in cache
                lock (_mfaCodes)
                {
                    _mfaCodes[userId] = entry;
                }

                log.InfoFormat("MFA code generated for user {0}", userId);
                return code;
            }
            catch (Exception ex)
            {
                log.Error($"Error generating MFA code for user {userId}", ex);
                throw;
            }
        }

        public async Task<bool> ValidateMfaCodeAsync(string userId, string code)
        {
            try
            {
                MfaCodeEntry entry;
                lock (_mfaCodes)
                {
                    if (!_mfaCodes.TryGetValue(userId, out entry))
                    {
                        log.WarnFormat("No MFA code found for user {0}", userId);
                        return false;
                    }
                }

                // Check if expired
                if (DateTime.UtcNow > entry.ExpiresAt)
                {
                    log.WarnFormat("MFA code expired for user {0}", userId);
                    lock (_mfaCodes)
                    {
                        _mfaCodes.Remove(userId);
                    }
                    return false;
                }

                // Check attempts (prevent brute force)
                if (entry.Attempts >= 3)
                {
                    log.WarnFormat("Too many MFA attempts for user {0}", userId);
                    lock (_mfaCodes)
                    {
                        _mfaCodes.Remove(userId);
                    }
                    return false;
                }

                entry.Attempts++;

                // Validate code
                if (entry.Code == code)
                {
                    log.InfoFormat("MFA code validated successfully for user {0}", userId);
                    lock (_mfaCodes)
                    {
                        _mfaCodes.Remove(userId);
                    }
                    return true;
                }

                log.WarnFormat("Invalid MFA code for user {0}", userId);
                return false;
            }
            catch (Exception ex)
            {
                log.Error($"Error validating MFA code for user {userId}", ex);
                return false;
            }
        }

        public async Task<bool> SendMfaCodeViaSmsAsync(string userId, string phoneNumber)
        {
            try
            {
                var code = await GenerateMfaCodeAsync(userId);
                var sent = await _smsService.SendVerificationCodeAsync(phoneNumber, code);
                
                if (sent)
                {
                    log.InfoFormat("MFA code sent via SMS to user {0}", userId);
                }
                else
                {
                    log.ErrorFormat("Failed to send MFA code via SMS to user {0}", userId);
                }

                return sent;
            }
            catch (Exception ex)
            {
                log.Error($"Error sending MFA code via SMS for user {userId}", ex);
                return false;
            }
        }

        public async Task EnableMfaAsync(string userId, string phoneNumber)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(userId);
                if (account == null)
                {
                    throw new KeyNotFoundException("Account not found");
                }

                account.MfaEnabled = true;
                account.PhoneNumber = phoneNumber;
                account.Updated = DateTime.UtcNow;

                _context.Accounts.Update(account);
                await _context.SaveChangesAsync();

                log.InfoFormat("MFA enabled for user {0}", userId);
            }
            catch (Exception ex)
            {
                log.Error($"Error enabling MFA for user {userId}", ex);
                throw;
            }
        }

        public async Task DisableMfaAsync(string userId)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(userId);
                if (account == null)
                {
                    throw new KeyNotFoundException("Account not found");
                }

                account.MfaEnabled = false;
                account.Updated = DateTime.UtcNow;

                _context.Accounts.Update(account);
                await _context.SaveChangesAsync();

                log.InfoFormat("MFA disabled for user {0}", userId);
            }
            catch (Exception ex)
            {
                log.Error($"Error disabling MFA for user {userId}", ex);
                throw;
            }
        }

        public bool IsMfaEnabled(string userId)
        {
            var account = _context.Accounts.Find(userId);
            return account?.MfaEnabled ?? false;
        }

        private string GenerateRandomNumericCode(int length)
        {
            var random = new Random();
            var code = "";
            for (int i = 0; i < length; i++)
            {
                code += random.Next(0, 10).ToString();
            }
            return code;
        }

        private class MfaCodeEntry
        {
            public string Code { get; set; }
            public DateTime ExpiresAt { get; set; }
            public int Attempts { get; set; }
        }
    }
}
