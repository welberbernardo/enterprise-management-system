using EnterpriseManagement.Core.Entities;

namespace EnterpriseManagement.Core.DTOs.Orders;

/// <summary>Create payload for an order.</summary>
public class CreateOrderDto
{
    public int CustomerId { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? Notes { get; set; }
    public IEnumerable<CreateOrderItemDto> Items { get; set; } = new List<CreateOrderItemDto>();
}

/// <summary>Create payload for an order line item.</summary>
public class CreateOrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; }
}

/// <summary>Update payload for an order.</summary>
public class UpdateOrderDto
{
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Order summary.</summary>
public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public OrderStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Order detail including items.</summary>
public class OrderDetailDto : OrderDto
{
    public IEnumerable<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
}

/// <summary>Order line item summary.</summary>
public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalPrice { get; set; }
}

/// <summary>Payload to change an order's status.</summary>
public class ChangeOrderStatusDto
{
    public OrderStatus Status { get; set; }
}
