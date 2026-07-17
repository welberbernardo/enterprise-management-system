using System.Text;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Infrastructure.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace EnterpriseManagement.Infrastructure.Services;

/// <summary>Sends emails through a configured SMTP server using MailKit.</summary>
public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;

        var builder = new BodyBuilder();
        if (isHtml) builder.HtmlBody = body; else builder.TextBody = body;
        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        var secure = _settings.UseSsl ? SecureSocketOptions.Auto : SecureSocketOptions.None;
        await client.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, secure, cancellationToken);
        if (!string.IsNullOrEmpty(_settings.Username))
            await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }

    public async Task SendTemplateEmailAsync(string to, string templateName, IDictionary<string, string> values, CancellationToken cancellationToken = default)
    {
        var (subject, body) = RenderTemplate(templateName, values);
        await SendEmailAsync(to, subject, body, true, cancellationToken);
    }

    private static (string Subject, string Body) RenderTemplate(string templateName, IDictionary<string, string> values)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<div style='font-family:Arial,sans-serif'>");
        sb.AppendLine($"<h2>{templateName}</h2>");
        foreach (var kvp in values)
        {
            sb.AppendLine($"<p><strong>{kvp.Key}:</strong> {kvp.Value}</p>");
        }
        sb.AppendLine("</div>");

        return (templateName, sb.ToString());
    }
}
