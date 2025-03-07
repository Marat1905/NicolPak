using GM.EFCore.Interfaces.Repositories;
//Взят с https://github.com/Infarh/MathCore.EF7/
namespace GM.EFCore.Repositories.Base
{
    /// <summary> Реализация интерфейса постраничных данных </summary>
    /// <typeparam name="T">Тип данных</typeparam>
    public record Page<T>(IEnumerable<T> Items, int TotalCount, int PageNumber, int PageSize) : IPage<T>
    {
        /// <summary>Полное число страниц в выдаче</summary>
        public int TotalPagesCount => PageSize <= 0 ? TotalCount : (int)Math.Ceiling((double)TotalCount / PageSize);

        /// <summary>Существует ли предыдущая страница</summary>
        public bool HasPrevPage => PageNumber > 0;

        /// <summary>Существует ли следующая страница</summary>
        public bool HasNextPage => PageNumber < TotalPagesCount - 1;//отсчёт от 0 страницы
    }
}
