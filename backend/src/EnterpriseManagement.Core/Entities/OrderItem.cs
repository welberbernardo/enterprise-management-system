using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>Represents a line item within a sales order.</summary>
public class OrderItem : IEntity
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalPrice { get; set; }

    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
