using PrsService.Domain.Entities;

namespace PrsService.Services.Repositories.Abstractions
{
    /// <summary>
    /// Репозиторий работы с рулоном
    /// </summary>
    public interface IRollRepository : IRepository<Roll, Guid>
    {
    }
}
