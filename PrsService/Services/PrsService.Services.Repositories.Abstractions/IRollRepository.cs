using GM.EFCore.Interfaces.Repositories;
using PrsService.Domain.Entities;

namespace PrsService.Services.Repositories.Abstractions
{
    /// <summary>
    /// Репозиторий работы с рулоном
    /// </summary>
    public interface IRollRepository : ITimedRepository<Roll, Guid>
    {
    }
}
