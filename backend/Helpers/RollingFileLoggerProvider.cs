using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Text;

namespace WebApi.Helpers
{
    /// <summary>Writes application logs to a size-limited file alongside the host's console logger.</summary>
    internal sealed class RollingFileLoggerProvider : ILoggerProvider
    {
        private const long MaximumFileSize = 10 * 1024 * 1024;
        private const int MaximumBackups = 5;
        private readonly string filePath;
        private readonly object sync = new object();

        public RollingFileLoggerProvider(string filePath)
        {
            this.filePath = filePath;
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        }

        public ILogger CreateLogger(string categoryName) => new RollingFileLogger(this, categoryName);

        public void Dispose() { }

        private void Write(string category, LogLevel level, EventId eventId, string message, Exception exception)
        {
            var entry = $"{DateTimeOffset.Now:yyyy-MM-dd HH:mm:ss.fff zzz} [{Environment.CurrentManagedThreadId}] {level} {category} - {message}";
            if (exception != null)
                entry += Environment.NewLine + exception;
            entry += Environment.NewLine;

            lock (sync)
            {
                try
                {
                    if (File.Exists(filePath) && new FileInfo(filePath).Length + Encoding.UTF8.GetByteCount(entry) > MaximumFileSize)
                    {
                        var oldest = filePath + "." + MaximumBackups;
                        if (File.Exists(oldest)) File.Delete(oldest);
                        for (var i = MaximumBackups - 1; i >= 1; i--)
                        {
                            var backup = filePath + "." + i;
                            if (File.Exists(backup)) File.Move(backup, filePath + "." + (i + 1));
                        }
                        File.Move(filePath, filePath + ".1");
                    }
                    File.AppendAllText(filePath, entry, new UTF8Encoding(false));
                }
                catch (IOException) { /* Console logging remains available if the file is inaccessible. */ }
                catch (UnauthorizedAccessException) { /* Console logging remains available. */ }
            }
        }

        private sealed class RollingFileLogger : ILogger
        {
            private readonly RollingFileLoggerProvider provider;
            private readonly string category;

            public RollingFileLogger(RollingFileLoggerProvider provider, string category)
            {
                this.provider = provider;
                this.category = category;
            }

            public IDisposable BeginScope<TState>(TState state) where TState : notnull => EmptyScope.Instance;
            public bool IsEnabled(LogLevel logLevel) => logLevel != LogLevel.None;

            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
            {
                if (IsEnabled(logLevel))
                    provider.Write(category, logLevel, eventId, formatter(state, exception), exception);
            }
        }

        private sealed class EmptyScope : IDisposable
        {
            public static readonly EmptyScope Instance = new EmptyScope();
            public void Dispose() { }
        }
    }
}
