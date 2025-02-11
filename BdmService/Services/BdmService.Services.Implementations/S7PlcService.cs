// Ignore Spelling: Plc Bdm

using BdmService.Infrastructure.Enums;
using BdmService.Services.Abstractions;
using Microsoft.Extensions.Logging;
using Sharp7;
using System.Diagnostics;

namespace BdmService.Services.Implementations
{
    public class S7PlcService : IS7PlcService
    {
        private readonly ILogger<S7PlcService> _logger;
        private readonly S7Client _client;
        private volatile object _locker = new object();
        private readonly CancellationTokenSource _cts;

        public ConnectionStates ConnectionState { get; private set; }

        public S7PlcService(ILogger<S7PlcService> logger)
        {
            _logger = logger;
            _client = new S7Client();
            _cts = new CancellationTokenSource();

        }

        public void Connect(string ipAddress, int rack, int slot)
        {
            try
            {
                ConnectionState = ConnectionStates.Connecting;
                int result = _client.ConnectTo(ipAddress, rack, slot);
                if (result == 0)
                {
                    ConnectionState = ConnectionStates.Online;
                    Task.Run(() =>ReadTag(1000, _cts.Token));
                }
                else
                {
                    _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Connection error: " + _client.ErrorText(result));
                    ConnectionState = ConnectionStates.Offline;
                }
            }
            catch
            {
                ConnectionState = ConnectionStates.Offline;
            }
        }

        public async Task ConnectAsync(string ipAddress, int rack, int slot)
        {
           await Task.Run(() => {Connect(ipAddress, rack, slot); },_cts.Token);
        }

        public void Disconnect()
        {
            if (_client.Connected)
            {
                _cts.Cancel();
                _client.Disconnect();
                ConnectionState = ConnectionStates.Offline;
                _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Connection disconnect: ");
            }
        }

        public async Task DisconnectAsync()
        {
            await Task.Run(() => { Disconnect(); }, _cts.Token);
        }


        private async Task ReadTag(int TimeRead , CancellationToken cancellationToken = default)
        {
            while (cancellationToken.IsCancellationRequested)
            {
                lock (_locker)
                {
                    Debug.WriteLine(DateTime.Now.ToString("HH:mm:ss") + "\t Чтение данных: ");       
                }
                await Task.Delay(TimeRead);
            }
        }
    }
}
