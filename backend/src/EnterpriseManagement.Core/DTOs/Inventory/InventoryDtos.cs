using EnterpriseManagement.Core.Entities;

namespace EnterpriseManagement.Core.DTOs.Inventory;

/// <summary>Create payload for an inventory movement.</summary>
public class CreateInventoryDto
{
    public int ProductId { get; set; }
    public MovementType MovementType { get; set; }
    public int Quantity { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Inventory movement summary.</summary>
public class InventoryDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public MovementType MovementType { get; set; }
    public int Quantity { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? CreatedBy { get; set; }
}
