using Microsoft.Extensions.Options;
using PrsService.Infrastructure.EntityFramework;
using PrsService.Repositories.Implementations;
using PrsService.Services.Implementations.Extensions;
using PrsService.WebAPI.BackgroundServices;
using PrsService.WebAPI.SchemaFilters;
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

            builder.Services
                 .AddS7PlcServices()
                 .AddDatabase(builder.Configuration.GetSection("Database"))
                 .AddRepositories()
                 .AddControllers()
                 .AddJsonOptions(options =>
                 {
                    // options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                 });
            ;


            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            //builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(opt =>
            {
                opt.SchemaFilter<EnumSchemaFilter>();
                //opt.MapType<DateOnly>(() => new OpenApiSchema { Type = "string", Format = "date" });
                var xmlFileName = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                //var xml = $"{Assembly.GetAssembly(typeof(UserDto)).GetName().Name}.xml";
                opt.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFileName), includeControllerXmlComments: true);
                //opt.IncludeXmlComments(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, xml));
                opt.SupportNonNullableReferenceTypes();
            });

            //builder.Services.AddHostedService<PlcHostedService>();
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


            app.MapControllers();

            app.Run();
        }
    }
}
