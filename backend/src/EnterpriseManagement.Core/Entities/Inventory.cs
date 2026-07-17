using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>The type of inventory movement.</summary>
public enum MovementType
{
    Entry = 0,
    Exit = 1,
    Adjustment = 2
}

/// <summary>Represents a stock movement record for a product.</summary>
public class Inventory : IEntity
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public MovementType MovementType { get; set; }
    public int Quantity { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? CreatedBy { get; set; }

    public Product? Product { get; set; }
    public User? Creator { get; set; }
}
