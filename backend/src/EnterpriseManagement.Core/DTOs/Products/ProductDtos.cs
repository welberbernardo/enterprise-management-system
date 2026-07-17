namespace EnterpriseManagement.Core.DTOs.Products;

/// <summary>Create payload for a product.</summary>
public class CreateProductDto
{
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
}

/// <summary>Update payload for a product.</summary>
public class UpdateProductDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }
    public int MinStock { get; set; }
    public string? Barcode { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>Product summary.</summary>
public class ProductDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinStock { get; set; }
    public string? Barcode { get; set; }
    public bool IsActive { get; set; }
    public bool IsLowStock { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Payload to adjust product stock.</summary>
public class StockAdjustmentDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}
