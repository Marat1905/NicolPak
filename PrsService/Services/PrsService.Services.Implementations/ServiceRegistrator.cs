using Microsoft.Extensions.DependencyInjection;
using PrsService.Services.Abstractions;

namespace PrsService.Services.Implementations
{
    public static class ServiceRegistrator
    {
        public static IServiceCollection AddS7PlcServices(this IServiceCollection services) =>
           services
           .AddSingleton<IS7PlcService, S7PlcService>()
           ;
    }
}
