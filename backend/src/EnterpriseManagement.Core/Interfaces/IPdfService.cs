namespace EnterpriseManagement.Core.Interfaces;

/// <summary>
/// Renders documents (invoices, reports) to PDF byte streams.
/// </summary>
public interface IPdfService
{
    /// <summary>Renders raw HTML to a PDF document and returns the bytes.</summary>
    byte[] GenerateFromHtml(string html, IDictionary<string, string>? metadata = null);

    /// <summary>Renders an invoice to a PDF document.</summary>
    byte[] GenerateInvoicePdf(object invoiceModel);
}
