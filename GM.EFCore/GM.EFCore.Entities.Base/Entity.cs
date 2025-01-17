using GM.EFCore.Interfaces.Entities;

namespace GM.EFCore.Entities.Base
{
    /// <summary>Сущность</summary>
    /// <typeparam name="TKey">Тип первичного ключа</typeparam>
    public abstract class Entity<TKey> : IEntity<TKey>
    {
        /// <summary>Первичный ключ </summary>
        public TKey? Id { get; set; }
    }

    /// <summary> <inheritdoc/> </summary>
    public abstract class Entity : Entity<Guid>, IEntity { }
}
