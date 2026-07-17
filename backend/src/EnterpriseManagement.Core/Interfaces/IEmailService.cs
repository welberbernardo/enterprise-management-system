namespace EnterpriseManagement.Core.Interfaces;

/// <summary>
/// Sends email messages through a configured SMTP provider.
/// </summary>
public interface IEmailService
{
    /// <summary>Sends an email message asynchronously.</summary>
    Task SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default);

    /// <summary>Sends an email using a named template with placeholder values.</summary>
    Task SendTemplateEmailAsync(string to, string templateName, IDictionary<string, string> values, CancellationToken cancellationToken = default);
}
