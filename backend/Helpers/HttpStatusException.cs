#nullable enable
using System;

namespace Backend.Helpers;

public sealed class HttpStatusException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    public HttpStatusException(int statusCode, string message, string errorCode, Exception? inner = null)
        : base(message, inner)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}
