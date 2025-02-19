using PrsService.Services.Contracts.Production;
using PrsService.Services.Contracts.TamburPrs;

namespace PrsService.Services.Abstractions
{
    public interface IProductionService
    {
        /// <summary>Добавление пользователя</summary>
        /// <param name="item">Добавляемая сущность пользователя</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Добавленная в репозиторий сущность</returns>
        Task<CreatingProductionDto> AddAsync(CreatingProductionDto item, CancellationToken Cancel = default);
    }
}
