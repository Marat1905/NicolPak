using GM.EFCore.Interfaces.Repositories;
using PrsService.Services.Contracts.TamburPrs;
using System.Data;

namespace PrsService.Services.Abstractions
{
    public interface ITamburService
    {
        /// <summary>Добавление Тамбура</summary>
        /// <param name="item">Добавляемая сущность тамбура</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Добавленная в репозиторий сущность</returns>
        Task<CreatingTamburDto> AddAsync(CreatingTamburDto item, CancellationToken Cancel = default);

        /// <summary>Добавить последнему тамбуру что его скинули</summary>
        /// <returns></returns>
        Task<TamburDto?> AddEndTimeTambur();

        /// <summary>Получение тамбура по идентификатору</summary>
        /// <param name="id">Идентификатор</param>
        /// <returns>Возвращаем тамбур</returns>
        Task<TamburDto?> GetByIdAsync(Guid id);

        /// <summary>Получить страницу с тамбурами из репозитория</summary>
        /// <param name="PageNumber">Номер страницы начиная с нуля</param>
        /// <param name="PageSize">Размер страницы</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Страница с тамбурами из репозитория</returns>
        Task<IPage<TamburDto>> GetPageAsync(int PageNumber, int PageSize, CancellationToken Cancel = default);
    }
}
