using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>Represents a customer of the enterprise.</summary>
public class Customer : IEntity
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? TaxId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<CustomerContact>? Contacts { get; set; }
    public ICollection<Order>? Orders { get; set; }
    public ICollection<AccountReceivable>? AccountsReceivable { get; set; }
}
