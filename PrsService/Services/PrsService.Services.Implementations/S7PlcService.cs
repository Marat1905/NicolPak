using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PrsService.Services.Abstractions;
using PrsService.Services.Contracts.DataBlock;
using PrsService.Services.Contracts.Production;
using PrsService.Services.Contracts.TamburPrs;
using PrsService.Services.Implementations.Configurations;
using Sharp7;
using Sharp7.Extensions.Enums;
using Sharp7.Extensions.Options;
using System.Diagnostics;
using System.Reflection;

namespace PrsService.Services.Implementations
{
    public class S7PlcService : IS7PlcService
    {
        private readonly ILogger<S7PlcService> _logger;
        private readonly ITamburService _tamburService;
        private readonly IProductionService _productionService;
        private readonly IMapper _mapper;
        private readonly S7Client _client;
        private volatile object _locker = new object();
        private CancellationToken _cts;
        private readonly Timer _timer;
        private readonly Dictionary<int, Dictionary<string, ReadTagSetting>> _tagSettings;
        private readonly Dictionary<string, MethodInfo> _methodsS7;
        private ConnectionStates _connectionStates;

        private DataBlockDto _db;

        /// <summary>Снятие тамбура</summary>
        private bool _isTamburChange;

        /// <summary>Снятие тамбура</summary>
        public bool IsTamburChange
        {
            get { return _isTamburChange; }
            set 
            {
                if (_isTamburChange == true && value ==false)
                {
                    Task.Run(async () => await _tamburService.AddAsync(new CreatingTamburDto()));
                    Debug.WriteLine(DateTime.Now.ToString("HH:mm:ss") + "\t Запись тамбура в БД: ");
                }
                _isTamburChange = value;
            }
        }

        private bool _isRollChange;

        public bool IsRollChange
        {
            get { return _isRollChange; }
            set 
            {
                if (_isRollChange == true && value == false)
                {
                    var prod = _mapper.Map<CreatingProductionDto>(_db);
                    Task.Run(async () => await _productionService.AddAsync(prod));
                    Debug.WriteLine(DateTime.Now.ToString("HH:mm:ss") + "\t Запись продукта в БД: ");
                }
                _isRollChange = value; 
            }
        }


        public ConnectionStates ConnectionState => _connectionStates;

        public S7PlcService(ILogger<S7PlcService> logger,ITamburService tamburService, IProductionService productionService, IMapper mapper)
        {
            _logger = logger;
            _tamburService = tamburService;
            _productionService = productionService;
            _mapper = mapper;
            _methodsS7 = ReadMethodS7();
            _db = new DataBlockDto();
            _client = new S7Client();
            //_cts = token;
            _timer = new Timer(ReadTag, null, 0, 2000);

            _tagSettings = CommonConfigurationManager.Configuration
                .GetSection(ReadTagSetting.Position)
                .Get<List<ReadTagSetting>>()
                .ToDictionary(x => x.ColumnName, x => x)
                .GroupBy(o => o.Value.DataBlock)
                .ToDictionary(group => group.Key, group => group.ToDictionary());
            //tamburService.AddAsync(new CreatingTamburDto());

            //var prod = _mapper.Map<CreatingProductionDto>(_db);
            //Task.Run(async () => await _productionService.AddAsync(prod));

        }



        public void Connect(string ipAddress, int rack, int slot)
        {
            _connectionStates = ConnectionStates.Connecting;
            if (_connectionStates != ConnectionStates.Online)
            {
                int result = _client.ConnectTo(ipAddress, rack, 2);
                if (result == 0)
                    _connectionStates = ConnectionStates.Online;
                else
                {
                    _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Connection error: " + _client.ErrorText(result));
                    _connectionStates = ConnectionStates.Offline;
                }
            }
        }

        public async Task ConnectAsync(string ipAddress, int rack, int slot)
        {
            await Task.Run(() => { Connect(ipAddress, rack, slot); });
        }

        public void Disconnect()
        {
            _client.Disconnect();
        }

        public async Task DisconnectAsync()
        {
            await Task.Run(() => { Disconnect(); });
        }

        int count = 0;
        private async void ReadTag(object? state)
        {
            ReadDB(_db, _tagSettings, ref _connectionStates);
            IsTamburChange=_db.IsTamburSet;
            IsRollChange=_db.IsProductionSet;
        }

      

        /// <summary>Метод записи данных в класс</summary>
        /// <typeparam name="T">Класс</typeparam>
        /// <param name="model">Модель куда надо передать данные</param>
        /// <param name="tagSettings"></param>
        /// <param name="State">Состояние подключения</param>
        private void ReadDB<T>(T model,Dictionary<int, Dictionary<string, ReadTagSetting>> tagSettings, ref ConnectionStates State) where T : class
        {
            //Stopwatch sw = Stopwatch.StartNew();
            if (State == ConnectionStates.Online)
            {
                foreach (var data in tagSettings)
                {
                    //Ищем максимальный стартовый байт и прибавляем к нему  байта
                    var MaxStartByte = data.Value.Max(x => x.Value.StartByte+2);
                   //TODO сделать расчет
                    // создаем буфер
                    byte[] bufer_Recv = new byte[MaxStartByte];
                    // считываем данные с контроллера из ДБ по которой сгруппирован словарь
                    Stopwatch sw = Stopwatch.StartNew();
                    sw.Start();                 
                    var result = _client.DBRead(data.Key, 0, bufer_Recv.Length - 1, bufer_Recv);
                    sw.Stop();
                   // Debug.WriteLine(DateTime.Now.ToString(" Потраченное время на получение данных: " + sw.ElapsedMilliseconds));
                    if (result != 0)
                    {
                        _logger.LogInformation(DateTime.Now.ToString("HH:mm:ss") + "\t Connection error: " + _client.ErrorText(result));
                        State = ConnectionStates.ErrorRead;
                    }
                    else
                    {
                       // Stopwatch sw = Stopwatch.StartNew();
                       // sw.Start();
                        ReadTagsToModel(data.Value, _methodsS7, model, bufer_Recv);
                        sw.Stop();
                    }
                }
            }

        }

        /// <summary>Чтение данных из буфера в модель</summary>
        /// <typeparam name="T"> Тип модели класса</typeparam>
        /// <param name="setting">Конфигурация с JSON PlcReadTagSettings.json</param>
        /// <param name="methodsS7">Словарь методов из класса конвертации S7</param>
        /// <param name="model">Модель куда надо писать инфу</param>
        /// <param name="buffer">Буфер считанный с ПЛК</param>
        /// <exception cref="Exception"></exception>
        private static void ReadTagsToModel<T>(Dictionary<string, ReadTagSetting> setting, Dictionary<string, MethodInfo> methodsS7, T model, byte[] buffer) where T : class
        {
            //получаем все свойства класса
            PropertyInfo[] properties = typeof(T).GetProperties();
            //В цикле считываем по одному свойству
            foreach (PropertyInfo property in properties)
            {
                //Проверяем есть ли для этого свойства настройки
                if (setting.TryGetValue(property.Name, out ReadTagSetting tagSetting))
                {
                    //var method = typeof(S7).GetMethod(tagSetting.MethodRead);
                    //if(method!=null)
                    // Проверяем полученное имя метода из json файла для конвертации в классе S7 
                    if (methodsS7.TryGetValue(tagSetting.MethodRead, out MethodInfo method))
                    {
                        List<object> args = new List<object>() { buffer, tagSetting.StartByte };
                        if (method.GetParameters().Length == 3)
                            args.Add(tagSetting.Bit);
                        // передаем параметры в метод
                        var result = method.Invoke(typeof(S7), args.ToArray());
                        //Устанавливаем в тот класс куда надо было передать инфу
                        property.SetValue(model, Convert.ChangeType(result, property.PropertyType));
                    }
                    else
                        throw new Exception($"{tagSetting.MethodRead} - Такой метод не существует в S7");
                }
                // else
                //    throw new Exception($"Для свойства {property.Name} не найдена конфигурация для чтения" );
            }
        }

        /// <summary>Получение словаря методов класса S7 </summary>
        /// <returns>Словарь методов класса S7</returns>
        private Dictionary<string, MethodInfo> ReadMethodS7()
        {
            Dictionary<string, MethodInfo> dict = new Dictionary<string, MethodInfo>();
            MethodInfo[] methodInfos = typeof(S7).GetMethods(BindingFlags.Public | BindingFlags.Static);
            foreach (MethodInfo method in methodInfos)
            {
                if (!dict.ContainsKey(method.Name))
                    dict[method.Name] = method;
            }
            return dict;
        }
    }
}
