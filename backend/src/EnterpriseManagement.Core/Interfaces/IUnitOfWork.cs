namespace EnterpriseManagement.Core.Interfaces;

/// <summary>
/// Unit of Work pattern abstraction coordinating multiple repositories and committing changes as a single transaction.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>Generic repository accessor for the given entity type.</summary>
    IRepository<T> Repository<T>() where T : class, IEntity;

    /// <summary>Commits all pending changes to the underlying store.</summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>Begins a new database transaction.</summary>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>Commits the current transaction.</summary>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>Rolls back the current transaction.</summary>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
