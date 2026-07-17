using AutoMapper;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Inventory;
using EnterpriseManagement.Core.DTOs.Products;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements product management and stock adjustments.</summary>
public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IAuditService _auditService;

    public ProductService(IUnitOfWork unitOfWork, IMapper mapper, IAuditService auditService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _auditService = auditService;
    }

    public async Task<PagedResult<ProductDto>> GetPagedAsync(int page, int pageSize, string? search = null, int? categoryId = null, CancellationToken cancellationToken = default)
    {
        IQueryable<Product> query = _unitOfWork.Repository<Product>().Query().Include(p => p.Category);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s) || p.Code.ToLower().Contains(s) || (p.Barcode != null && p.Barcode.ToLower().Contains(s)));
        }
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(p => p.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<ProductDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            Items = _mapper.Map<IReadOnlyList<ProductDto>>(items)
        };
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().Query().Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        return product is null ? null : _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var exists = await _unitOfWork.Repository<Product>().AnyAsync(p => p.Code == dto.Code, cancellationToken);
        if (exists) throw new InvalidOperationException("Product code already exists.");

        var product = _mapper.Map<Product>(dto);
        product.CreatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Product>().AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(id, cancellationToken);
        if (product is null) return null;
        _mapper.Map(dto, product);
        product.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Product>().Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<ProductDto>(product);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(id, cancellationToken);
        if (product is null) return false;
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Product>().Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> AdjustStockAsync(StockAdjustmentDto dto, int? userId = null, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(dto.ProductId, cancellationToken);
        if (product is null) return false;

        var before = product.StockQuantity;
        product.StockQuantity += dto.Quantity;
        if (product.StockQuantity < 0) product.StockQuantity = 0;
        product.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Product>().Update(product);

        await _unitOfWork.Repository<Inventory>().AddAsync(new Inventory
        {
            ProductId = product.Id,
            MovementType = dto.Quantity >= 0 ? MovementType.Entry : MovementType.Exit,
            Quantity = dto.Quantity,
            Reference = dto.Reference,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _auditService.LogAsync(userId, "StockAdjustment", nameof(Product), product.Id.ToString(),
            oldValues: before.ToString(), newValues: product.StockQuantity.ToString(), cancellationToken: cancellationToken);
        return true;
    }
}
