using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading;

using WebApi.Helpers;

namespace WebApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CancellationTokenSource tokenSource = new CancellationTokenSource(); // Create a token source.

            // Create an AutoResetEvent to signal the timeout threshold in the
            // timer callback has been reached.
            //var autoEvent = new AutoResetEvent(false);
            IHost ihost = CreateHostBuilder(args).Build();
            //var services = ihost.Services.GetService(typeof(IServiceProvider));

            ScheduleFunctionRemainder scheduleFunctionRemainder = new ScheduleFunctionRemainder(ihost.Services);
            // Create a thread
            Thread backgroundThread = new Thread(new ThreadStart(ScheduleFunctionRemainder.CheckStatus));

            // Start thread
            backgroundThread.Start();

            ihost.Services.GetRequiredService<ILogger<Program>>().LogInformation("Schedule reminder started");

            //Timer stateTimer = new Timer(scheduleFunctionRemainder.CheckStatus, autoEvent, 0, 1000 * 60 * 5);
            ihost.Run();

            // Stop the timer
            //stateTimer.Change(Timeout.Infinite, Timeout.Infinite); ;
            /* Make autoEvent to signal main thread to finish the job */
            scheduleFunctionRemainder.Terminate();

            // When autoEvent signals , dispose of the timer.
            //autoEvent.WaitOne();
            //stateTimer.Dispose();
            Console.WriteLine("\nDestroying timer.");
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureLogging(logging =>
                {
                    var home = Environment.GetEnvironmentVariable("HOME");
                    var logDirectory = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME")) && !string.IsNullOrWhiteSpace(home)
                        ? Path.Combine(home, "LogFiles", "Application")
                        : Path.Combine(AppContext.BaseDirectory, "logs");
                    logging.AddProvider(new RollingFileLoggerProvider(Path.Combine(logDirectory, "myapp.log")));
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>()
                    .UseContentRoot(Directory.GetCurrentDirectory())
                    /*.UseUrls("https://parish.api:5002")*/;
                    /*
                     * 1) dotnet dev-certs https --trust
                     * 2) dotnet dev-certs https --clean
                     * */
                });

    }
}
