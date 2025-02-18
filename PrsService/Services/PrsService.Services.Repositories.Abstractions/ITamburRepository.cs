using PrsService.Domain.Entities;

namespace PrsService.Services.Repositories.Abstractions
{
    /// <summary>
    /// Репозиторий работы с тамбуром
    /// </summary>
    public interface ITamburRepository : IRepository<TamburPrs, Guid>
    {
    }
}
