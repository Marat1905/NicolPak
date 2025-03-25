using PrsService.Infrastructure.EntityFramework;
using PrsService.Repositories.Implementations;
using PrsService.Services.Implementations.Extensions;
using PrsService.WebAPI.BackgroundServices;
using Sharp7.Extensions.Options;
using System.Reflection;

namespace PrsService.WebAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            var ConnectSettingPlc = PLCReadConfigurationManager.Configuration.GetSection(ConnectPlcSetting.Position).Get<ConnectPlcSetting>();

            builder.Services
                 .AddCors()
                 .AddSingleton(ConnectSettingPlc)
                 .AddS7PlcServices()
                 .AddDatabase(builder.Configuration.GetSection("Database"))
                 .AddRepositories()
                 .AddControllers()
            ;


            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

            builder.Services.AddSwaggerGen(opt =>
            {
                var xmlFileName = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                opt.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFileName), includeControllerXmlComments: true);
                opt.SupportNonNullableReferenceTypes();
            });
            builder.Services.AddHostedService<PLCBackgroundService>();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:62081"));

            app.MapControllers();

            app.Run();
        }
    }
}
