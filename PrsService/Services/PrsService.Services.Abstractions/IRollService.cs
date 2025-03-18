using GM.EFCore.Interfaces.Repositories;
using PrsService.Services.Contracts.Roll;
using PrsService.Services.Contracts.TamburPrs;

namespace PrsService.Services.Abstractions
{
    /// <summary>Сервис для рулонов </summary>
    public interface IRollService
    {
        /// <summary>Добавление рулона</summary>
        /// <param name="item">Добавляемая сущность рулона</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Добавленная в репозиторий сущность</returns>
        Task<CreatingRollDto> AddAsync(CreatingRollDto item, CancellationToken Cancel = default);


        /// <summary>Получение рулона по идентификатору</summary>
        /// <param name="id">Идентификатор</param>
        /// <returns>Возвращаем рулон</returns>
        Task<RollDto?> GetByIdAsync(Guid id);

        /// <summary>Получить страницу с рулонами из репозитория</summary>
        /// <param name="PageNumber">Номер страницы начиная с нуля</param>
        /// <param name="PageSize">Размер страницы</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Страница с рулонами из репозитория</returns>
        Task<IPage<RollDto>?> GetPageAsync(int PageNumber, int PageSize, CancellationToken Cancel = default);

        /// <summary>Получить страницу рулонов за выбранный период</summary>
        /// <param name="Start">Начало периода</param>
        /// <param name="End">Конец периода</param>
        /// /// <param name="PageNumber">Номер страницы начиная с нуля</param>
        /// <param name="PageSize">Размер страницы</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Страница рулонов за выбранный период</returns>
        Task<IPage<RollDto>?> GetPageInTimeIntervalPage(DateTime Start, DateTime End, int PageNumber, int PageSize, CancellationToken Cancel = default);

        /// <summary>Получить коллекцию рулонов, время которых попадает в указанный интервал</summary>
        /// <param name="StartTime">Время начала интервала поиска</param>
        /// <param name="EndTime">Время конца интервала поиска</param>
        /// <param name="Cancel">Признак отмены асинхронной операции</param>
        /// <returns>Коллекция с рулонами, время которых попадает в указанный интервал</returns>
        Task<IEnumerable<RollDto>?> GetInTimeInterval(DateTime StartTime, DateTime EndTime, CancellationToken Cancel = default);

    }
}
