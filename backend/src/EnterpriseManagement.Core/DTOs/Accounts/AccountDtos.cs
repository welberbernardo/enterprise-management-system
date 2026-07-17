using EnterpriseManagement.Core.Entities;

namespace EnterpriseManagement.Core.DTOs.Accounts;

/// <summary>Create payload for an account payable.</summary>
public class CreateAccountPayableDto
{
    public int SupplierId { get; set; }
    public int? InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Payload to record a payable payment.</summary>
public class PayablePaymentDto
{
    public decimal Amount { get; set; }
    public DateTime? PaymentDate { get; set; }
}

/// <summary>Account payable summary.</summary>
public class AccountPayableDto
{
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Remaining { get; set; }
    public DateTime DueDate { get; set; }
    public PayableStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }
}

/// <summary>Create payload for an account receivable.</summary>
public class CreateAccountReceivableDto
{
    public int CustomerId { get; set; }
    public int? InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Payload to record a receivable payment.</summary>
public class ReceivablePaymentDto
{
    public decimal Amount { get; set; }
    public DateTime? PaymentDate { get; set; }
}

/// <summary>Account receivable summary.</summary>
public class AccountReceivableDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal Remaining { get; set; }
    public DateTime DueDate { get; set; }
    public ReceivableStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }
}
