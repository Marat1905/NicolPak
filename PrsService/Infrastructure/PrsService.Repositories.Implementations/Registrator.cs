using Microsoft.Extensions.DependencyInjection;
using PrsService.Services.Repositories.Abstractions;

namespace PrsService.Repositories.Implementations
{
    public static class Registrator
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services) =>
            services
            .AddTransient<IProductionRepository, ProductionRepository>()
            .AddTransient<ITamburRepository, TamburRepository>()
            .AddTransient<IRollRepository, RollRepository>()
            ;
    }
}
