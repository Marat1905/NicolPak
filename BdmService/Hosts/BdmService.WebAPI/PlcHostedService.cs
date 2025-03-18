// Ignore Spelling: Plc

using BdmService.Services.Abstractions;
using BdmService.Services.Implementations.Configurations;
using Sharp7.Extensions.Enums;
using Sharp7.Extensions.Options;

namespace BdmService.WebAPI
{
    public class PlcHostedService : IHostedService, IDisposable
    {
        private readonly ILogger<PlcHostedService> _logger;
        private readonly IS7PlcService _s7Plc;
        private readonly ConnectPlcSetting _settings;

        public PlcHostedService(ILogger<PlcHostedService> logger, IS7PlcService s7Plc)
        {
            _logger = logger;
            _s7Plc = s7Plc;
            _settings = CommonConfigurationManager.Configuration.GetSection(ConnectPlcSetting.Position).Get<ConnectPlcSetting>();
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
                if (_s7Plc.ConnectionState != ConnectionStates.Online)
                {
                    _s7Plc.Disconnect();
                    _s7Plc.Connect(_settings.IpAddress, _settings.Rack, _settings.Slot);
                    _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Подключение............");
                }
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
