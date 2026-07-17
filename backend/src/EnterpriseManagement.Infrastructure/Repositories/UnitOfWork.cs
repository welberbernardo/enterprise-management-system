using System.Collections.Concurrent;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Infrastructure.Data;
using EnterpriseManagement.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Infrastructure.Repositories;

/// <summary>Entity Framework Core implementation of the Unit of Work pattern.</summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<T> Repository<T>() where T : class, IEntity
    {
        var type = typeof(T);
        return (IRepository<T>)_repositories.GetOrAdd(type, _ => new Repository<T>(_context));
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        await _context.SaveChangesAsync(cancellationToken);

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default) =>
        await _context.Database.BeginTransactionAsync(cancellationToken);

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_context.Database.CurrentTransaction is not null)
            await _context.Database.CommitTransactionAsync(cancellationToken);
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_context.Database.CurrentTransaction is not null)
            await _context.Database.RollbackTransactionAsync(cancellationToken);
    }

    public void Dispose() => _context.Dispose();
}
