using System.Linq.Expressions;

namespace EnterpriseManagement.Core.Interfaces;

/// <summary>
/// Generic repository abstraction for aggregate root persistence.
/// </summary>
/// <typeparam name="T">The entity type, must implement <see cref="IEntity"/>.</typeparam>
public interface IRepository<T> where T : class, IEntity
{
    /// <summary>Returns the queryable set without tracking.</summary>
    IQueryable<T> Query();

    /// <summary>Returns all entities asynchronously.</summary>
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Returns a paged list of entities.</summary>
    Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(int page, int pageSize,
        CancellationToken cancellationToken = default);

    /// <summary>Finds an entity by its primary key.</summary>
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Finds the first entity matching the predicate.</summary>
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>Returns true when any entity matches the predicate.</summary>
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>Adds a new entity.</summary>
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);

    /// <summary>Adds a range of entities.</summary>
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);

    /// <summary>Updates an existing entity.</summary>
    void Update(T entity);

    /// <summary>Removes an entity.</summary>
    void Remove(T entity);

    /// <summary>Removes a range of entities.</summary>
    void RemoveRange(IEnumerable<T> entities);

    /// <summary>Persists all pending changes to the store.</summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
