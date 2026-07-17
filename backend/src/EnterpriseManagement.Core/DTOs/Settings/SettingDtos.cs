namespace EnterpriseManagement.Core.DTOs.Settings;

/// <summary>Company setting key/value pair.</summary>
public class CompanySettingDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>Update payload for a company setting.</summary>
public class UpdateSettingDto
{
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
