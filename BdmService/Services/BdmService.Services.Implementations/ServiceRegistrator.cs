// Ignore Spelling: Plc Registrator Bdm

using BdmService.Services.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace BdmService.Services.Implementations
{
    public static class ServiceRegistrator
    {
        public static IServiceCollection AddS7PlcServices(this IServiceCollection services) =>
           services
           .AddSingleton<IS7PlcService, S7PlcService>()
           ;
    }
}
