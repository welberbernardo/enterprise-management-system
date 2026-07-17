using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>Represents a contact person for a customer.</summary>
public class CustomerContact : IEntity
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Position { get; set; }
    public bool IsPrimary { get; set; }

    public Customer? Customer { get; set; }
}
