using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Orders;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages order line items.</summary>
public class OrderItemsController : BaseController
{
    private readonly IOrderService _orderService;

    public OrderItemsController(IOrderService orderService) => _orderService = orderService;

    /// <summary>Returns items for a given order.</summary>
    [HttpGet("order/{orderId:int}")]
    [RequirePermission("Orders", "View")]
    public async Task<ActionResult<ApiResponse<OrderDetailDto>>> GetByOrder(int orderId, CancellationToken cancellationToken)
    {
        var result = await _orderService.GetByIdAsync(orderId, cancellationToken);
        return result is null ? NotFound(ApiResponse<OrderDetailDto>.Fail("Order not found.")) : Ok(ApiResponse<OrderDetailDto>.Ok(result));
    }
}
