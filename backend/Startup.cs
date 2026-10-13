using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using Microsoft.Extensions.DependencyInjection;
using System;
using WebApi.Helpers;
using WebApi.Middleware;
using WebApi.Services;
using Microsoft.Extensions.Hosting;

using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authentication.Cookies;
using Google.Apis.Auth.AspNetCore3;
using Google.Apis.Auth.OAuth2;
using MailKit.Net.Imap;
using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using Google.Apis.Drive.v3;
using System.Collections.Generic;
using Google.Apis.Gmail.v1.Data;
using WebApi.Hub;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Identity;
using WebApi.Entities;
using Google;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using Scalar.AspNetCore;
using Backend.Services;

namespace WebApi
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // add services to the DI container
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddHttpClient();

            services.AddDbContext<DataContext>();

            services.AddIdentity<Account, IdentityRole>(options =>
            {
                options.User.RequireUniqueEmail = false;
            })
            .AddEntityFrameworkStores<DataContext>()
            .AddDefaultTokenProviders();

            services.AddCors();
            //services.AddControllers().AddJsonOptions(x => x.JsonSerializerOptions.IgnoreNullValues = true);
            services.AddControllers(config =>
            {
                config.Filters.Add(typeof(WebApiActionFilter));
            }).AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            });

            services.AddAutoMapper(cfg => cfg.AddMaps(AppDomain.CurrentDomain.GetAssemblies()));
            services.AddOpenApi();

            services.AddSignalR();

            services.AddHttpLogging();

            // configure strongly typed settings object
            services.Configure<AppSettings>(Configuration.GetSection("AppSettings"));

            // configure DI for application services
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<ISpryngSmsService, SpryngSmsService>();
            services.AddHttpClient<Backend.Interfaces.IEmailService, EmailServiceBrevo>();
            services.AddHttpClient<Backend.Interfaces.ISmsService, SmsServiceBrevo>();
            services.AddScoped<IMfaService, MfaService>();

            /* JD experiment start */
            //services.AddScoped<IUserClaimsPrincipalFactory<IdentityUser>,
            //        AdditionalUserClaimsPrincipalFactory>();

            //services.AddAuthorization(options =>
            //    options.AddPolicy("TwoFactorEnabled", x => x.RequireClaim("amr", "mfa")));
            /* JD experiment end */
        }

        // configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, DataContext context, IHostApplicationLifetime lifetime, ILogger<Startup> log)
        {
            log.LogInformation("######################################## PROGRAM STARTED ########################################");

            // migrate database changes on startup (includes initial db creation)
            context.Database.Migrate();

            app.UseRouting();

            // global cors policy
            app.UseCors(x => x
                .SetIsOriginAllowed(origin => true)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());

            app.UseAuthentication();
            app.UseAuthorization();

            // global error handler
            app.UseMiddleware<ErrorHandlerMiddleware>();

            // custom jwt auth middleware
            app.UseMiddleware<JwtMiddleware>();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<MessageHub>("/update");

                if (env.IsDevelopment())
                {
                    endpoints.MapScalarApiReference(options =>
                    {
                        options
                        .WithTheme(ScalarTheme.None);
                        options.HideDarkModeToggle = true;
                        options.HideClientButton = true;
                    }).AllowAnonymous();
                    endpoints.MapOpenApi().AllowAnonymous();
                    endpoints.MapGet("/", () => Results.Redirect("/scalar/v1")).AllowAnonymous();
                }
            });

            try
            {
                using var scope = app.ApplicationServices.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                var canConnect = db.Database.CanConnect();
                log.LogInformation("Database connectivity check: CanConnect={CanConnect}", canConnect);
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Database connectivity check failed.");
            }

            lifetime.ApplicationStarted.Register(() =>
            {
                try
                {
                    var addresses = app.ServerFeatures.Get<IServerAddressesFeature>()?.Addresses;
                    var urls = addresses != null && addresses.Count > 0
                        ? string.Join(";", addresses)
                        : "unknown";

                    log.LogInformation("Listening on: {Urls}", urls);
                }
                catch (Exception ex)
                {
                    log.LogWarning(ex, "Failed to determine server listening addresses.");
                }
            });

            log.LogInformation("ASPNETCORE_URLS={Urls}", Environment.GetEnvironmentVariable("ASPNETCORE_URLS"));
            log.LogInformation("ASPNETCORE_HTTP_PORTS={HttpPorts}", Environment.GetEnvironmentVariable("ASPNETCORE_HTTP_PORTS"));
            log.LogInformation("ASPNETCORE_HTTPS_PORTS={HttpsPorts}", Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORTS"));

            app.UseHttpLogging();
            app.Use(async (context, next) => {
                Console.WriteLine("Request Path: " + context.Request.Path);
                await next();
                Console.WriteLine("Response Status Code: " + context.Response.StatusCode);
            });
        }
    }
}
