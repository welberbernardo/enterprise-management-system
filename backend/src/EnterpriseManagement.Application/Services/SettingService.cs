using AutoMapper;
using EnterpriseManagement.Core.DTOs.Settings;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements company settings management.</summary>
public class SettingService : ISettingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SettingService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CompanySettingDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await _unitOfWork.Repository<CompanySetting>().GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<CompanySettingDto>>(items);
    }

    public async Task<CompanySettingDto?> GetByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        var item = await _unitOfWork.Repository<CompanySetting>().FirstOrDefaultAsync(s => s.Key == key, cancellationToken);
        return item is null ? null : _mapper.Map<CompanySettingDto>(item);
    }

    public async Task<CompanySettingDto> UpsertAsync(string key, UpdateSettingDto dto, CancellationToken cancellationToken = default)
    {
        var setting = await _unitOfWork.Repository<CompanySetting>().FirstOrDefaultAsync(s => s.Key == key, cancellationToken);
        if (setting is null)
        {
            setting = new CompanySetting { Key = key, Value = dto.Value, Description = dto.Description, UpdatedAt = DateTime.UtcNow };
            await _unitOfWork.Repository<CompanySetting>().AddAsync(setting, cancellationToken);
        }
        else
        {
            setting.Value = dto.Value;
            setting.Description = dto.Description;
            setting.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Repository<CompanySetting>().Update(setting);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<CompanySettingDto>(setting);
    }
}
