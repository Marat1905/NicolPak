using PrsService.Services.Contracts.Production;
using PrsService.Services.Contracts.TamburPrs;

namespace PrsService.Services.Abstractions
{
    /// <summary>Сервис для продукции </summary>
    public interface IProductionService
    {
        /// <summary>Добавление продукта</summary>
        /// <param name="item">Добавляемая сущность продукта</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Добавленная в репозиторий сущность</returns>
        Task<CreatingProductionDto> AddAsync(CreatingProductionDto item, CancellationToken Cancel = default);
    }
}
