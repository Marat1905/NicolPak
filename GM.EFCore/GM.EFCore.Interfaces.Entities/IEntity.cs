namespace GM.EFCore.Interfaces.Entities
{
    /// <summary>Сущность</summary>
    /// <typeparam name="TKey"></typeparam>
    public interface IEntity<out TKey>
    {
        /// <summary>Идентификатор</summary>
        TKey? Id { get; }
    }

    /// <summary>Сущность</summary>
    public interface IEntity : IEntity<Guid> { }
}
