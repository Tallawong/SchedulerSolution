using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using WebApi.Entities;
using log4net;

using System.Diagnostics.CodeAnalysis;
using System.Diagnostics.Contracts;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Security.Claims;




[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = false, AllowMultiple = true)]

[SuppressMessage("Microsoft.Performance", "CA1813:AvoidUnsealedAttributes", Justification = "We want to support extensibility")]
//[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
public class AuthorizeAttribute : Attribute, Microsoft.AspNetCore.Mvc.Filters.IAuthorizationFilter
{
    private static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

    private readonly IList<Role> _roles;

    public AuthorizeAttribute(params Role[] roles)
    {
        _roles = roles ?? new Role[] { };
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {

        // JD
        var httpContext = context.HttpContext;
        var actionDescriptor = context.ActionDescriptor.DisplayName;

        // get user name
        string userName = httpContext.User.Identity.Name;
        var user = context.HttpContext.User;
        var value = context.HttpContext.User.Claims?.FirstOrDefault(x => x.Type == System.Security.Claims.ClaimTypes.Name)?.Value;
        WindowsPrincipal wp = new WindowsPrincipal(WindowsIdentity.GetCurrent());

        var username = wp.Identity.Name;
        // JD

        var account = (Account)context.HttpContext.Items["Account"];
        if (account == null || (_roles.Any() && !_roles.Contains(account.Role)))
        {
            log.Info("Not logged in or role not authorized for action: " + context.ActionDescriptor.DisplayName);
            // not logged in or role not authorized
            context.Result = new JsonResult(new { message = "Unauthorized" }) { StatusCode = StatusCodes.Status401Unauthorized };
        }
    }
}