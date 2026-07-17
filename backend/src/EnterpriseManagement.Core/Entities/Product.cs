using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>Represents a sellable product with inventory tracking.</summary>
public class Product : IEntity
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinStock { get; set; }
    public string? Barcode { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Category? Category { get; set; }
    public ICollection<OrderItem>? OrderItems { get; set; }
    public ICollection<Inventory>? Inventories { get; set; }
}
