using GM.EFCore.Interfaces.Entities;

namespace GM.EFCore.Entities.Base
{
    /// <summary>Именованная сущность</summary>
    /// <typeparam name="TKey"></typeparam>
    public abstract class NamedEntity<TKey> : Entity<TKey>, INamedEntity<TKey>
    {
        /// <summary>Имя</summary>
        public string Name { get; set; }

    }

    /// <summary> <inheritdoc/> </summary>
    public abstract class NamedEntity : NamedEntity<Guid>, INamedEntity { }
}
