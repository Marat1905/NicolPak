namespace GM.EFCore.Interfaces.Entities
{
    /// <summary>Сущность определенная во времени</summary>
    /// <typeparam name="TKey"></typeparam>
    public interface ITimedEntity<out TKey> : IEntity<TKey>
    {
        /// <summary>Время</summary>
        DateTime CreateAt { get; set; }
    }

    /// <summary>Сущность определенная во времени</summary>
    public interface ITimedEntity : ITimedEntity<Guid> { }
}
