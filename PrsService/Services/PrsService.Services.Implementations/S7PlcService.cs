using AutoMapper;
using Microsoft.Extensions.Logging;
using PrsService.Services.Abstractions;
using PrsService.Services.Contracts.DataBlock;
using PrsService.Services.Contracts.Production;
using PrsService.Services.Contracts.TamburPrs;
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
        private readonly DataBlockDto _dataBlock;
        private readonly S7Client _client;
        private volatile object _locker = new object();
        private CancellationToken _cts;
        private readonly Timer _timer;
        private readonly Dictionary<int, Dictionary<string, ReadTagSetting>> _tagSettings;
        private readonly Dictionary<string, MethodInfo> _methodsS7;
        private ConnectionStates _connectionStates;

        /// <summary>Снятие тамбура</summary>
        private int _tamburChangeCount;

        /// <summary>Снятие тамбура</summary>
        public int TamburChangeCount
        {
            get { return _tamburChangeCount; }
            set 
            {
                if(_tamburChangeCount!= value)
                {
                    if (value != 0)
                        Task.Run(() => TamburChange().Wait());
                }
                _tamburChangeCount = value;
               
            }
        }

        private bool _isRollChange;

        public bool IsRollChange
        {
            get { return _isRollChange; }
            set 
            {
                if (_isRollChange == true && value == false)
                    Task.Run(() => RollChange().Wait());

                _isRollChange = value;
            }
        }


        public ConnectionStates ConnectionState => _connectionStates;

        public S7PlcService(ILogger<S7PlcService> logger,ITamburService tamburService, 
                            IProductionService productionService, IMapper mapper, 
                            DataBlockDto dataBlock, Dictionary<int, Dictionary<string, ReadTagSetting>> tagSettings)
        {
            _logger = logger;
            _tamburService = tamburService;
            _productionService = productionService;
            _mapper = mapper;
            _dataBlock = dataBlock;
            _methodsS7 = ReadMethodS7();
            _client = new S7Client();
            _timer = new Timer(ReadTag, null, 0, 2000);
            _tagSettings = tagSettings;
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
                    _logger.LogError(DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + "\t Connection error: " + _client.ErrorText(result));
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
            ReadDB(_dataBlock, _tagSettings, ref _connectionStates);
            //var prod = _mapper.Map<CreatingProductionDto>(_db);
            TamburChangeCount = _dataBlock.TamburContPrs;
            IsRollChange= _dataBlock.IsProductionSet;
        }

        private async Task TamburChange()
        {
           
            if (!await _tamburService.ExistTambur(_dataBlock.TamburContPrs))
            {
                var tamburNew = _mapper.Map<CreatingTamburDto>(_dataBlock);
                await _tamburService.AddAsync(tamburNew);
                _logger.LogInformation(DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + "\t Запись тамбура в БД: ");
            }
            else
                _logger.LogWarning($"{DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss")} \t Тамбур с порядковым номером {_dataBlock.TamburContPrs} уже существует  в БД: ");
        }

        private async Task RollChange()
        {
            var prod = _mapper.Map<CreatingProductionDto>(_dataBlock);
            await _productionService.AddAsync(prod);
            _logger.LogInformation(DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + "\t Запись продукта в БД: ");
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
                    var MaxStartByte = data.Value.Max(x => x.Value.StartByte+4);
                   //TODO сделать расчет
                    // создаем буфер
                    byte[] bufer_Recv = new byte[MaxStartByte];
                    // считываем данные с контроллера из ДБ по которой сгруппирован словарь
                    Stopwatch sw = Stopwatch.StartNew();
                    sw.Start();                 
                    var result = _client.DBRead(data.Key, 0, bufer_Recv.Length, bufer_Recv);

                    if (result != 0)
                    {
                        _logger.LogError(DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + "\t Connection error: " + _client.ErrorText(result));
                        State = ConnectionStates.ErrorRead;
                    }
                    else
                    {
                        ReadTagsToModel(data.Value, _methodsS7, model, bufer_Recv);
                        AddValueCollection(data.Value, _methodsS7, model, bufer_Recv);
                    }
                }
            }

        }

        #region Вынести в отдельное место Extension
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
            PropertyInfo[] properties = model.GetType().GetProperties();
            //В цикле считываем по одному свойству
            foreach (PropertyInfo property in properties)
            {
                SetValue(setting, methodsS7, model, buffer, property);
            }
        }
        public static bool IsIList(Type type)
        {
            return type.GetInterfaces().Contains(typeof(System.Collections.IList));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="setting"></param>
        /// <param name="methodsS7"></param>
        /// <param name="model"></param>
        /// <param name="buffer"></param>
        public void AddValueCollection<T>(Dictionary<string, ReadTagSetting> setting, Dictionary<string, MethodInfo> methodsS7, T model, byte[] buffer)
        {
            PropertyInfo[] properties = typeof(T).GetProperties();
            foreach (var property in properties)
            {
                if (property.PropertyType.IsGenericType && IsIList(property.PropertyType))
                {
                    var type = property.PropertyType;
                    var name = property.Name;

                    var elementType = property.PropertyType.GetGenericArguments().First();
                    var listType = typeof(List<>);
                    Type[] IListParam = { type };
                    var constructedListType = listType.MakeGenericType(elementType);
                    var list = Activator.CreateInstance(constructedListType);
                    //Установить new
                    property.SetValue(model, list);

                    PropertyInfo[] propertiesList = property.PropertyType.GetProperties();

                    foreach (var prop in propertiesList)
                    {
                        if (prop.PropertyType.Name is nameof(RollDbDto))
                        {
                            for (var i = 0; i < 4; i++)
                            {
                                //Создаем объект
                                var instance = Activator.CreateInstance(prop.PropertyType);
                                foreach (var prop2 in instance.GetType().GetProperties())
                                {
                                    if (prop2.Name == "RollId")
                                    {
                                        setting.TryGetValue(prop2.Name, out var value);
                                        SetValue(setting, methodsS7, instance, buffer, prop2, i * value.Offset);
                                        var myValue = prop2.GetValue(instance, null);
                                        if (myValue != null && (int)myValue == 0)
                                            return;
                                    }
                                    else if (prop2.Name == "RollWidth")
                                    {
                                        setting.TryGetValue(prop2.Name, out var value);
                                        SetValue(setting, methodsS7, instance, buffer, prop2, i * value.Offset);
                                    }
                                }
                                //Укладываем в list
                                list.GetType().GetMethod("Add").Invoke(list, new object[] { instance });
                            }

                        }
                    }
                }
            }
        }

        private static void SetValue<T>(Dictionary<string, ReadTagSetting> setting, Dictionary<string, MethodInfo> methodsS7, T model, byte[] buffer, PropertyInfo property, int offset = 0) where T : class
        {
            //Проверяем есть ли для этого свойства настройки
            if (setting.TryGetValue(property.Name, out ReadTagSetting tagSetting))
            {
                // Проверяем полученное имя метода из json файла для конвертации в классе S7 
                if (methodsS7.TryGetValue(tagSetting.MethodRead, out MethodInfo method))
                {
                    int start = tagSetting.StartByte + offset;
                    List<object> args = new List<object>() { buffer, start };
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
        #endregion



    }
}
