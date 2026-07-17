namespace EnterpriseManagement.Core.DTOs.Customers;

/// <summary>Create payload for a customer contact.</summary>
public class CreateCustomerContactDto
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Position { get; set; }
    public bool IsPrimary { get; set; }
}

/// <summary>Update payload for a customer contact.</summary>
public class UpdateCustomerContactDto
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Position { get; set; }
    public bool IsPrimary { get; set; }
}

/// <summary>Customer contact summary.</summary>
public class CustomerContactDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Position { get; set; }
    public bool IsPrimary { get; set; }
}
