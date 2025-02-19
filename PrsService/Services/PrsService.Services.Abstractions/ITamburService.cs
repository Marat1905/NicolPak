using PrsService.Services.Contracts.TamburPrs;
using System.Data;

namespace PrsService.Services.Abstractions
{
    public interface ITamburService
    {
        /// <summary>Добавление пользователя</summary>
        /// <param name="item">Добавляемая сущность пользователя</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Добавленная в репозиторий сущность</returns>
        Task<CreatingTamburDto> AddAsync(CreatingTamburDto item, CancellationToken Cancel = default);
    }
}
