using PrsService.Services.Implementations;
using PrsService.WebAPI.BackgroundServices;
using PrsService.Infrastructure.EntityFramework;
using PrsService.Repositories.Implementations;

namespace PrsService.WebAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services
                .AddS7PlcServices()
                 .AddDatabase(builder.Configuration.GetSection("Database"))
                 .AddRepositories();


            builder.Services.AddControllers();

            builder.Services.AddHostedService<PlcHostedService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
