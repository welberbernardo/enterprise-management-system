namespace EnterpriseManagement.Infrastructure.Options;

/// <summary>SMTP email configuration bound from application settings.</summary>
public class EmailSettings
{
    public const string SectionName = "Email";
    public string SmtpServer { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SenderName { get; set; } = "Enterprise Management";
    public string SenderEmail { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool UseSsl { get; set; } = true;
}
