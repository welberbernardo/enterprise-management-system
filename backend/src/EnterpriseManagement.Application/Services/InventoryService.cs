using AutoMapper;
using EnterpriseManagement.Core.DTOs.Inventory;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements inventory movement tracking.</summary>
public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public InventoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<InventoryDto>> GetHistoryAsync(int? productId = null, CancellationToken cancellationToken = default)
    {
        IQueryable<Inventory> query = _unitOfWork.Repository<Inventory>().Query().Include(i => i.Product);
        if (productId.HasValue)
            query = query.Where(i => i.ProductId == productId.Value);

        var items = await query.OrderByDescending(i => i.CreatedAt).ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<InventoryDto>>(items);
    }

    public async Task<InventoryDto> CreateMovementAsync(CreateInventoryDto dto, int? userId = null, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(dto.ProductId, cancellationToken)
            ?? throw new InvalidOperationException("Product not found.");

        var movement = new Inventory
        {
            ProductId = dto.ProductId,
            MovementType = dto.MovementType,
            Quantity = dto.Quantity,
            Reference = dto.Reference,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };
        await _unitOfWork.Repository<Inventory>().AddAsync(movement, cancellationToken);

        product.StockQuantity += dto.MovementType == MovementType.Exit ? -dto.Quantity : dto.Quantity;
        if (product.StockQuantity < 0) product.StockQuantity = 0;
        product.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Product>().Update(product);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<InventoryDto>(movement);
    }
}
