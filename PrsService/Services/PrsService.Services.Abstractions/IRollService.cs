using PrsService.Services.Contracts.Roll;
using PrsService.Services.Contracts.TamburPrs;

namespace PrsService.Services.Abstractions
{
    public interface IRollService
    {
        /// <summary>Добавление рулона</summary>
        /// <param name="item">Добавляемая сущность рулона</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Добавленная в репозиторий сущность</returns>
        Task<CreatingRollDto> AddAsync(CreatingRollDto item, CancellationToken Cancel = default);
    }
}
