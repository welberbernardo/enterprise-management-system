namespace EnterpriseManagement.Core.Interfaces;

/// <summary>
/// Marker interface for entities that have an integer primary key.
/// </summary>
public interface IEntity
{
    /// <summary>Gets the primary key identifier.</summary>
    int Id { get; }
}
