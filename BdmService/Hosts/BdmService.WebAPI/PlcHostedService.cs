// Ignore Spelling: Plc

using BdmService.Infrastructure.Enums;
using BdmService.Services.Abstractions;
using Microsoft.Extensions.Hosting;
using System.Data;
using System.Diagnostics;

namespace BdmService.WebAPI
{
    public class PlcHostedService : IHostedService, IDisposable
    {
        private readonly ILogger<PlcHostedService> _logger;
        private readonly IS7PlcService _s7Plc;

        public PlcHostedService(ILogger<PlcHostedService> logger, IS7PlcService s7Plc)
        {
            _logger = logger;
            _s7Plc = s7Plc;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Timed Hosted Service running. ");
            await Connecting(cancellationToken);
        }

        public async Task Connecting(CancellationToken cancellationToken)
        {
            while(!cancellationToken.IsCancellationRequested)
            {
                if (_s7Plc.ConnectionState == ConnectionStates.Offline)
                {
                    CancellationTokenSource tokenSource = new CancellationTokenSource();
                    _s7Plc.Disconnect();
                    _s7Plc.Connect("", 0, 2, tokenSource);
                   // _s7Plc.Disconnect();
                }
                Debug.WriteLine($"Запись {DateTime.Now}");
                await Task.Delay(5000);
            }         
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            await _s7Plc.DisconnectAsync();
            _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Timed Hosted Service is stopping. ");
        }

        public void Dispose()
        {
        }
    }
}
