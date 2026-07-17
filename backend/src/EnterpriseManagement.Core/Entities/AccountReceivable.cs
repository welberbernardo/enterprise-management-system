using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>The payment status of a receivable account.</summary>
public enum ReceivableStatus
{
    Pending = 0,
    Partial = 1,
    Paid = 2,
    Overdue = 3
}

/// <summary>Represents an amount owed by a customer.</summary>
public class AccountReceivable : IEntity
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int? InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public decimal PaidAmount { get; set; }
    public ReceivableStatus Status { get; set; } = ReceivableStatus.Pending;
    public DateTime? PaymentDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Customer? Customer { get; set; }
    public Invoice? Invoice { get; set; }
}
