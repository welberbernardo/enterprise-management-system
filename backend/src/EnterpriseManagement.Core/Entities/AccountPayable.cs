using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>The payment status of a payable account.</summary>
public enum PayableStatus
{
    Pending = 0,
    Partial = 1,
    Paid = 2,
    Overdue = 3
}

/// <summary>Represents an amount owed to a supplier.</summary>
public class AccountPayable : IEntity
{
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public int? InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public decimal PaidAmount { get; set; }
    public PayableStatus Status { get; set; } = PayableStatus.Pending;
    public DateTime? PaymentDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Supplier? Supplier { get; set; }
    public Invoice? Invoice { get; set; }
}
