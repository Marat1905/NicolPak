﻿using GM.EFCore.Interfaces.Entities;
//Взят с https://github.com/Infarh/MathCore.EF7/
namespace GM.EFCore.Interfaces.Repositories
{
    /// <summary>Репозиторий именованных сущностей</summary>
    /// <typeparam name="T">Тип сущности</typeparam>
    /// <typeparam name="TKey">Тип первичного ключа сущности</typeparam>
    public interface INamedRepository<T, in TKey> : IRepository<T, TKey> where T : INamedEntity<TKey>
    {
        /// <summary>Проверка - существует ли в репозитории сущность с указанным именем</summary>
        /// <param name="Name">Имя сущности</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Истина, если сущность с указанными именем существует в репозитории</returns>
        Task<bool> ExistName(string Name, CancellationToken Cancel = default);

        /// <summary>Получить сущность по указанному имени</summary>
        /// <param name="Name">Имя сущности, которую требуется получить из репозитория</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Сущность с указанным именем в случае ее наличия, и null, если сущности с заданным именем в репозитории нет</returns>
        Task<T> GetByName(string Name, CancellationToken Cancel = default);

        /// <summary>Удаление сущности с указанным именем из репозитория</summary>
        /// <param name="Name">Имя удаляемой сущности</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Удаленная из репозитория сущность в случае ее наличия и null, если такой сущности в репозитории не было</returns>
        Task<T> DeleteByName(string Name, CancellationToken Cancel = default);
    }

    /// <summary>Репозиторий именованных сущностей</summary>
    /// <typeparam name="T">Тип сущности</typeparam>
    public interface INamedRepository<T> : INamedRepository<T, Guid> where T : INamedEntity<Guid> { }
}
