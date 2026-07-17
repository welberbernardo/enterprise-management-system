using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>The lifecycle status of an invoice.</summary>
public enum InvoiceStatus
{
    Draft = 0,
    Sent = 1,
    Paid = 2,
    Overdue = 3,
    Cancelled = 4
}

/// <summary>Represents a customer invoice for an order.</summary>
public class Invoice : IEntity
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order? Order { get; set; }
    public ICollection<AccountPayable>? AccountsPayable { get; set; }
    public ICollection<AccountReceivable>? AccountsReceivable { get; set; }
}
