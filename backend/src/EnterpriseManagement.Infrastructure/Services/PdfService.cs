using EnterpriseManagement.Core.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EnterpriseManagement.Infrastructure.Services;

/// <summary>Generates PDF documents using the QuestPDF library.</summary>
public class PdfService : IPdfService
{
    public byte[] GenerateFromHtml(string html, IDictionary<string, string>? metadata = null)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(40);
                page.Content().Column(col =>
                {
                    if (metadata is not null)
                    {
                        foreach (var kvp in metadata)
                        {
                            col.Item().Text($"{kvp.Key}: {kvp.Value}").FontSize(10);
                        }
                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Medium);
                    }

                    col.Item().PaddingTop(10).Text(html).FontSize(11);
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerateInvoicePdf(object invoiceModel)
    {
        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(40);
                page.Header().Text("INVOICE").FontSize(24).Bold();
                page.Content().PaddingTop(20).Text(invoiceModel.ToString() ?? string.Empty).FontSize(12);
                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Page ");
                    text.CurrentPageNumber();
                });
            });
        });

        return doc.GeneratePdf();
    }
}
