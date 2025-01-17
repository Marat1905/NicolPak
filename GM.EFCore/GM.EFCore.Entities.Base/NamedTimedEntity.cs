using GM.EFCore.Interfaces.Entities;

namespace GM.EFCore.Entities.Base
{
    /// <summary>Именованная сущность определенная во времени</summary>
    /// <typeparam name="TKey"></typeparam>
    public abstract class NamedTimedEntity<TKey> : NamedEntity<TKey>, ITimedEntity<TKey>
    {
        /// <summary>Время</summary>
        public DateTime CreateAt { get; set; }
    }

    /// <summary> <inheritdoc/> </summary>
    public abstract class NamedTimedEntity : NamedTimedEntity<Guid>, ITimedEntity { }
}
