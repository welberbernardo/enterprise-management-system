using System.Net;
using System.Text.Json;
using EnterpriseManagement.Core.DTOs.Common;
using FluentValidation;

namespace EnterpriseManagement.API.Middleware;

/// <summary>Global exception handling middleware that returns a consistent JSON error envelope.</summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException vex)
        {
            _logger.LogWarning(vex, "Validation error");
            await WriteAsync(context, HttpStatusCode.BadRequest, "Validation failed",
                vex.Errors.Select(e => e.ErrorMessage));
        }
        catch (InvalidOperationException oex)
        {
            _logger.LogWarning(oex, "Business rule violation");
            await WriteAsync(context, HttpStatusCode.BadRequest, oex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteAsync(context, HttpStatusCode.InternalServerError, "An unexpected error occurred.");
        }
    }

    private static async Task WriteAsync(HttpContext context, HttpStatusCode status, string message, IEnumerable<string>? errors = null)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)status;
        var response = ApiResponse<object>.Fail(message, errors);
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}

/// <summary>Lightweight request logging middleware.</summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        await _next(context);
        stopwatch.Stop();
        _logger.LogInformation("[{Method}] {Path} => {StatusCode} in {Elapsed}ms",
            context.Request.Method, context.Request.Path, context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
    }
}
