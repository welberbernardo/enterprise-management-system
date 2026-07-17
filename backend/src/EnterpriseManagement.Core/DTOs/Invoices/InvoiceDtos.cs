using EnterpriseManagement.Core.Entities;

namespace EnterpriseManagement.Core.DTOs.Invoices;

/// <summary>Create payload for an invoice.</summary>
public class CreateInvoiceDto
{
    public int OrderId { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal TaxAmount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Update payload for an invoice.</summary>
public class UpdateInvoiceDto
{
    public DateTime? DueDate { get; set; }
    public decimal TaxAmount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Invoice summary.</summary>
public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public InvoiceStatus Status { get; set; }
}

/// <summary>Payload to change an invoice's status.</summary>
public class ChangeInvoiceStatusDto
{
    public InvoiceStatus Status { get; set; }
}
