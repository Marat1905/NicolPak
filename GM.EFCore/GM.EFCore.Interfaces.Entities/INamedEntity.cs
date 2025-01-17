namespace GM.EFCore.Interfaces.Entities
{
    /// <summary>Именованная сущность</summary>
    /// <typeparam name="TKey">Тип первичного ключа</typeparam>
    public interface INamedEntity<out TKey> : IEntity<TKey>
    {
        /// <summary>Имя</summary>
        string Name { get; }
    }

    /// <summary>Именованная сущность</summary>
    public interface INamedEntity : INamedEntity<Guid>, IEntity { }
}
