using Microsoft.Extensions.DependencyInjection;
using PrsService.Services.Abstractions;

namespace PrsService.Services.Implementations.Extensions
{
    public static class ServiceRegistrator
    {
        public static IServiceCollection AddS7PlcServices(this IServiceCollection services) =>
           services
           .AddSingleton<IS7PlcService, S7PlcService>()
           .AddSingleton<ITamburService, TamburService>()
           .AddTransient<IProductionService, ProductionService>()
           ;
    }
}
