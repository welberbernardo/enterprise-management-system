using System.Linq.Expressions;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Infrastructure.Repositories;

/// <summary>Generic repository implementation backed by Entity Framework Core.</summary>
/// <typeparam name="T">The entity type.</typeparam>
public class Repository<T> : IRepository<T> where T : class, IEntity
{
    private readonly ApplicationDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public IQueryable<T> Query() => _dbSet.AsNoTracking();

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _dbSet.AsNoTracking().ToListAsync(cancellationToken);

    public async Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(int page, int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : pageSize;
        var total = await _dbSet.CountAsync(cancellationToken);
        var items = await _dbSet.AsNoTracking()
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await _dbSet.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) =>
        await _dbSet.AsNoTracking().FirstOrDefaultAsync(predicate, cancellationToken);

    public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) =>
        await _dbSet.AnyAsync(predicate, cancellationToken);

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        return entity;
    }

    public async Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default) =>
        await _dbSet.AddRangeAsync(entities, cancellationToken);

    public void Update(T entity)
    {
        var tracked = _dbSet.Local.FirstOrDefault(e => e.Id.Equals(entity.Id));
        if (tracked is not null)
            _context.Entry(tracked).CurrentValues.SetValues(entity);
        else
            _dbSet.Update(entity);
    }

    public void Remove(T entity) => _dbSet.Remove(entity);

    public void RemoveRange(IEnumerable<T> entities) => _dbSet.RemoveRange(entities);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        await _context.SaveChangesAsync(cancellationToken);
}
