using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Orders;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages sales orders and status changes.</summary>
public class OrdersController : BaseController
{
    private readonly IOrderService _service;

    public OrdersController(IOrderService service) => _service = service;

    [HttpGet]
    [RequirePermission("Orders", "View")]
    public async Task<ActionResult<ApiResponse<PagedResult<OrderDto>>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPagedAsync(page, pageSize, search, cancellationToken);
        return Ok(ApiResponse<PagedResult<OrderDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Orders", "View")]
    public async Task<ActionResult<ApiResponse<OrderDetailDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<OrderDetailDto>.Fail("Order not found.")) : Ok(ApiResponse<OrderDetailDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<OrderDetailDto>>> Create([FromBody] CreateOrderDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<OrderDetailDto>.Ok(result, "Order created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> Update(int id, [FromBody] UpdateOrderDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<OrderDto>.Fail("Order not found.")) : Ok(ApiResponse<OrderDto>.Ok(result, "Order updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Order cancelled.")) : NotFound(ApiResponse<bool>.Fail("Order not found."));
    }

    [HttpPut("{id:int}/status")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangeStatus(int id, [FromBody] ChangeOrderStatusDto dto, CancellationToken cancellationToken)
    {
        var ok = await _service.ChangeStatusAsync(id, dto, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Status updated.")) : NotFound(ApiResponse<bool>.Fail("Order not found."));
    }
}
