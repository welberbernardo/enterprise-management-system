using AutoMapper;
using EnterpriseManagement.Core.DTOs.Categories;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements category management.</summary>
public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await _unitOfWork.Repository<Category>().GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<CategoryDto>>(items);
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _unitOfWork.Repository<Category>().GetByIdAsync(id, cancellationToken);
        return item is null ? null : _mapper.Map<CategoryDto>(item);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var exists = await _unitOfWork.Repository<Category>().AnyAsync(c => c.Code == dto.Code, cancellationToken);
        if (exists) throw new InvalidOperationException("Category code already exists.");

        var category = _mapper.Map<Category>(dto);
        category.CreatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Category>().AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id, cancellationToken);
        if (category is null) return null;
        _mapper.Map(dto, category);
        _unitOfWork.Repository<Category>().Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id, cancellationToken);
        if (category is null) return false;
        _unitOfWork.Repository<Category>().Remove(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
