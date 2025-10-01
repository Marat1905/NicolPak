import React, { useState, useEffect, forwardRef, useCallback, useRef } from "react";
import { FiFolderPlus, FiFolderMinus, FiFile, FiPlus, FiChevronDown, FiChevronRight, FiCalendar, FiEdit2, FiTrash2, FiX, FiBluetooth } from "react-icons/fi";
import { v4 as uuidv4 } from 'uuid';
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ru from 'date-fns/locale/ru';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import moment from "moment";

registerLocale('ru', ru);
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// UUID сервисов и характеристик из C# кода
const VIPEN_SERVICE = "378b4074-c2b8-45ff-894c-418739e60000";
const VIPEN_CHAR_READING = "3890be9f-3a5e-459d-b799-102365770001";
const VIPEN_CHAR_CTRL = "3890be9f-3a5e-459d-b799-102365770002";
const VIPEN_CHAR_WAV_CTRL = "3890be9f-3a5e-459d-b799-102365770003";
const VIPEN_CHAR_WAV_READ = "3890be9f-3a5e-459d-b799-102365770004";

// Константы команд из C# кода
const ViPen_Command_Start = 0x0001;
const ViPen_Command_Stop = 0x0002;
const ViPen_Get_Data_Vel = 0x10;

interface TreeNode {
    key: string;
    title: string;
    type: 'equipment' | 'component' | 'point';
    children?: TreeNode[];
    parentKey?: string;
}

interface Reading {
    id: string;
    pointId: string;
    date: string;
    vibration: number;
    temperature: number;
    comment?: string;
}

interface ViPenData {
    velocity: number;
    acceleration: number;
    kurtosis: number;
    temperature: number;
    timestamp: Date;
}

// Новые интерфейсы для волновых данных
interface VPenWaveData {
    header: VPenHeader;
    blocks: VPenBlock[];
}

interface VPenHeader {
    viPen_Get_Data_Command: number;
    viPen_Get_Data_Block: number;
    viPen_Get_Wave_ID: number;
    reserv1: number;
    timestamp: number;
    coeff: number;
    reserv2: Uint16Array;
}

interface VPenBlock {
    viPen_Get_Data_Block: number;
    viPen_Get_Wave_ID: number;
    data: Int16Array;
}

interface UserDataViPen {
    addr: number;
    id: number;
    timestamp: number;
    values: number[];
}

// Улучшенный Bluetooth Hook с исправлениями для волновых данных
const useViPenBluetooth = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [currentData, setCurrentData] = useState<ViPenData | null>(null);
    const [waveData, setWaveData] = useState<VPenWaveData | null>(null);
    const [userData, setUserData] = useState<UserDataViPen | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [device, setDevice] = useState<BluetoothDevice | null>(null);

    const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
    const serviceRef = useRef<BluetoothRemoteGATTService | null>(null);
    const readingCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
    const ctrlCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
    const waveCtrlCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
    const waveReadCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Функция для безопасной проверки подключения
    const isGattConnected = useCallback(() => {
        return serverRef.current?.connected === true;
    }, []);

    // Функция для безопасного выполнения GATT операций с повторными попытками
    const safeGattOperation = useCallback(async <T,>(
        operation: () => Promise<T>,
        operationName: string,
        maxRetries = 3
    ): Promise<T> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (!isGattConnected()) {
                    throw new Error(`GATT сервер отключен. Попытка ${attempt}/${maxRetries}`);
                }

                const result = await operation();
                return result;
            } catch (err) {
                console.warn(`Ошибка при ${operationName} (попытка ${attempt}/${maxRetries}):`, err);

                if (attempt === maxRetries) {
                    throw err;
                }

                // Ждем перед повторной попыткой
                await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            }
        }

        throw new Error(`Не удалось выполнить ${operationName} после ${maxRetries} попыток`);
    }, [isGattConnected]);

    // Функция для парсинга данных из ArrayBuffer
    const parseViPenData = useCallback((data: DataView): ViPenData => {
        try {
            if (data.byteLength < 15) {
                throw new Error(`Недостаточно данных: ${data.byteLength} байт`);
            }

            // Пропускаем первые 7 байт (R0) и читаем Int16 значения (little-endian)
            const velocity = data.getInt16(7, true);
            const acceleration = data.getInt16(9, true);
            const kurtosis = data.getInt16(11, true);
            const temperature = data.getInt16(13, true);

            return {
                velocity: Math.round(velocity * 0.01 * 100) / 100,
                acceleration: Math.round(acceleration * 0.01 * 100) / 100,
                kurtosis: Math.round(kurtosis * 0.01 * 100) / 100,
                temperature: Math.round(temperature * 0.01 * 10) / 10,
                timestamp: new Date()
            };
        } catch (parseError) {
            console.error('Ошибка парсинга данных:', parseError);
            throw new Error(`Ошибка обработки данных: ${parseError}`);
        }
    }, []);

    // ПРАВИЛЬНАЯ функция для парсинга волновых данных согласно C# структурам
    const parseWaveData = useCallback((data: DataView): VPenWaveData => {
        try {
            console.log('Парсинг волновых данных, размер:', data.byteLength, 'байт');

            if (data.byteLength < 150) {
                console.warn('Слишком мало данных для волновых данных:', data.byteLength);
                throw new Error(`Недостаточно данных для волны: ${data.byteLength} байт`);
            }

            let offset = 0;

            // Парсим заголовок (правильная структура из C# кода - stVPenHeader)
            const header: VPenHeader = {
                viPen_Get_Data_Command: data.getUint8(offset),
                viPen_Get_Data_Block: data.getUint8(offset + 1),
                viPen_Get_Wave_ID: data.getUint8(offset + 2),
                reserv1: data.getUint8(offset + 3),
                timestamp: data.getUint32(offset + 4, true),
                coeff: data.getFloat32(offset + 8, true),
                reserv2: new Uint16Array(69) // 138 байт / 2 = 69 ushort
            };
            offset += 12; // 1+1+1+1 + 4 + 4 = 12 байт

            console.log('Заголовок распарсен:', {
                command: header.viPen_Get_Data_Command,
                block: header.viPen_Get_Data_Block,
                waveId: header.viPen_Get_Wave_ID,
                timestamp: header.timestamp,
                coeff: header.coeff
            });

            // Парсим блоки (правильная структура из C# кода - stVPenData с 22 блоками)
            const blocks: VPenBlock[] = [];
            const expectedBlocks = 22;

            for (let i = 0; i < expectedBlocks; i++) {
                if (offset + 2 > data.byteLength) {
                    console.warn(`Недостаточно данных для блока ${i}, offset: ${offset}, всего данных: ${data.byteLength}`);
                    break;
                }

                // Каждый блок имеет структуру stVPenBlock
                const block: VPenBlock = {
                    viPen_Get_Data_Block: data.getUint8(offset),
                    viPen_Get_Wave_ID: data.getUint8(offset + 1),
                    data: new Int16Array(74)
                };
                offset += 2;

                // Читаем данные блока (74 значения int16 = 148 байт)
                for (let j = 0; j < 74; j++) {
                    if (offset + 2 > data.byteLength) {
                        console.warn(`Недостаточно данных для элемента данных ${j} в блоке ${i}`);
                        break;
                    }
                    block.data[j] = data.getInt16(offset, true);
                    offset += 2;
                }

                blocks.push(block);
                console.log(`Блок ${i} распарсен: ID=${block.viPen_Get_Wave_ID}, номер=${block.viPen_Get_Data_Block}`);
            }

            console.log(`Успешно распарсено блоков: ${blocks.length}`);

            return { header, blocks };
        } catch (parseError) {
            console.error('Ошибка парсинга волновых данных:', parseError);
            throw new Error(`Ошибка обработки волновых данных: ${parseError}`);
        }
    }, []);

    // Функция для парсинга пользовательских данных
    const parseUserData = useCallback((data: DataView): UserDataViPen => {
        try {
            if (data.byteLength < 15) {
                throw new Error(`Недостаточно данных для пользовательских данных: ${data.byteLength} байт`);
            }

            let offset = 0;
            return {
                addr: data.getUint8(offset),
                id: data.getUint16(offset + 1, true),
                timestamp: data.getUint32(offset + 3, true),
                values: [
                    data.getInt16(offset + 7, true),
                    data.getInt16(offset + 9, true),
                    data.getInt16(offset + 11, true),
                    data.getInt16(offset + 13, true)
                ]
            };
        } catch (parseError) {
            console.error('Ошибка парсинга пользовательских данных:', parseError);
            throw new Error(`Ошибка обработки пользовательских данных: ${parseError}`);
        }
    }, []);

    // Обработчик изменений характеристики
    const handleCharacteristicChanged = useCallback((event: Event) => {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        if (!characteristic.value) {
            console.warn('Нет данных в характеристике');
            return;
        }

        try {
            const dataView = new DataView(characteristic.value.buffer);
            const viPenData = parseViPenData(dataView);
            setCurrentData(viPenData);
            setError(null);
        } catch (err) {
            console.error('Ошибка обработки данных:', err);
        }
    }, [parseViPenData]);

    // УЛУЧШЕННАЯ функция для загрузки волновых данных с накоплением данных
    const downloadWaveform = useCallback(async (): Promise<VPenWaveData> => {
        if (!serviceRef.current || !isGattConnected()) {
            throw new Error("Нет подключения к сервису");
        }

        let waveReadChar: BluetoothRemoteGATTCharacteristic | null = null;
        let collectedData = new Uint8Array();
        const expectedSize = 3450; // 150 байт заголовок + 22 * 150 байт блоков

        try {
            setIsDownloading(true);
            console.log('Начало загрузки волновых данных...');

            // Получаем характеристику управления волной
            const waveCtrlChar = await safeGattOperation(
                () => serviceRef.current!.getCharacteristic(VIPEN_CHAR_WAV_CTRL),
                'getWaveControlCharacteristic'
            );

            // Получаем характеристику чтения волны
            waveReadChar = await safeGattOperation(
                () => serviceRef.current!.getCharacteristic(VIPEN_CHAR_WAV_READ),
                'getWaveReadCharacteristic'
            );

            // Включаем уведомления для характеристики чтения волны
            await safeGattOperation(
                () => waveReadChar.startNotifications(),
                'startWaveNotifications'
            );

            console.log('Уведомления для волновых данных включены');

            // Команда для загрузки волновых данных (ViPen_Get_Data_Vel)
            const downloadCommand = new Uint8Array([ViPen_Get_Data_Vel, 0x00]);

            // Ждем немного перед отправкой команды
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('Отправка команды загрузки волновых данных...');
            await safeGattOperation(
                () => waveCtrlChar.writeValue(downloadCommand),
                'writeDownloadCommand'
            );

            console.log('Команда загрузки волновых данных отправлена');

            // Ждем данные с таймаутом и накоплением
            return await new Promise<VPenWaveData>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    if (waveReadChar) {
                        waveReadChar.removeEventListener('characteristicvaluechanged', onWaveDataReceived);
                    }
                    reject(new Error(`Таймаут ожидания волновых данных (30 сек). Собрано: ${collectedData.length}/${expectedSize} байт`));
                }, 30000);

                const onWaveDataReceived = (event: Event) => {
                    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
                    if (!characteristic.value) {
                        console.warn('Получены пустые данные');
                        return;
                    }

                    try {
                        const newData = new Uint8Array(characteristic.value.buffer);
                        console.log('Получены волновые данные, размер:', newData.byteLength, 'байт');

                        // Добавляем новые данные к уже собранным
                        const temp = new Uint8Array(collectedData.length + newData.length);
                        temp.set(collectedData);
                        temp.set(newData, collectedData.length);
                        collectedData = temp;

                        console.log('Общий размер собранных данных:', collectedData.length, '/', expectedSize, 'байт');

                        // Проверяем, набралось ли достаточно данных
                        if (collectedData.length >= expectedSize) {
                            clearTimeout(timeout);
                            characteristic.removeEventListener('characteristicvaluechanged', onWaveDataReceived);

                            const waveData = parseWaveData(new DataView(collectedData.buffer, 0, expectedSize));
                            setWaveData(waveData);
                            console.log('Волновые данные успешно загружены и распарсены');
                            resolve(waveData);
                        }
                    } catch (err) {
                        console.error('Ошибка при обработке волновых данных:', err);
                        clearTimeout(timeout);
                        characteristic.removeEventListener('characteristicvaluechanged', onWaveDataReceived);
                        reject(err);
                    }
                };

                waveReadChar.addEventListener('characteristicvaluechanged', onWaveDataReceived);
            });

        } catch (err) {
            console.error('Ошибка загрузки волновых данных:', err);
            throw new Error(`Ошибка загрузки волновых данных: ${err}`);
        } finally {
            // Отключаем уведомления
            if (waveReadChar) {
                try {
                    await waveReadChar.stopNotifications();
                    console.log('Уведомления отключены');
                } catch (err) {
                    console.warn('Ошибка отключения уведомлений:', err);
                }
            }
            setIsDownloading(false);
        }
    }, [safeGattOperation, parseWaveData, isGattConnected]);

    // Функция для чтения пользовательских данных (аналог C# ReadUserData)
    const readUserData = useCallback(async (): Promise<UserDataViPen> => {
        if (!serviceRef.current || !isGattConnected()) {
            throw new Error("Нет подключения к сервису");
        }

        try {
            console.log('Чтение пользовательских данных...');

            const readingChar = await safeGattOperation(
                () => serviceRef.current!.getCharacteristic(VIPEN_CHAR_READING),
                'getReadingCharacteristic'
            );

            // Читаем текущее значение
            const value = await safeGattOperation(
                () => readingChar.readValue(),
                'readUserData'
            );

            const userData = parseUserData(new DataView(value.buffer));
            setUserData(userData);
            console.log('Пользовательские данные успешно прочитаны');

            return userData;

        } catch (err) {
            console.error('Ошибка чтения пользовательских данных:', err);
            throw new Error(`Ошибка чтения пользовательских данных: ${err}`);
        }
    }, [safeGattOperation, parseUserData, isGattConnected]);

    // Улучшенная функция для старта измерения
    const startMeasurement = useCallback(async (): Promise<void> => {
        if (!serviceRef.current || !isGattConnected()) {
            throw new Error("Нет подключения к сервису");
        }

        try {
            console.log('Запуск измерения...');

            const ctrlCharacteristic = await safeGattOperation(
                () => serviceRef.current!.getCharacteristic(VIPEN_CHAR_CTRL),
                'getControlCharacteristic'
            );

            // Команда для запуска измерения (аналог C# ViPen_Command_Start)
            const startCommand = new Uint8Array([
                (ViPen_Command_Start & 0xFF),
                ((ViPen_Command_Start >> 8) & 0xFF)
            ]);

            // Ждем немного перед отправкой команды
            await new Promise(resolve => setTimeout(resolve, 100));

            await safeGattOperation(
                () => ctrlCharacteristic.writeValue(startCommand),
                'writeStartCommand'
            );

            console.log('Команда запуска измерения отправлена');

            // Включаем уведомления для характеристики чтения
            if (readingCharRef.current) {
                await safeGattOperation(
                    () => readingCharRef.current!.startNotifications(),
                    'startReadingNotifications'
                );
                console.log('Уведомления активированы');
            }

        } catch (err) {
            console.error('Ошибка запуска измерения:', err);
            throw new Error(`Ошибка запуска измерения: ${err}`);
        }
    }, [safeGattOperation, isGattConnected]);

    // Улучшенная функция для остановки измерения
    const stopMeasurement = useCallback(async (): Promise<void> => {
        if (!serviceRef.current || !isGattConnected()) {
            throw new Error("Нет подключения к сервису");
        }

        try {
            console.log('Остановка измерения...');

            const ctrlCharacteristic = await safeGattOperation(
                () => serviceRef.current!.getCharacteristic(VIPEN_CHAR_CTRL),
                'getControlCharacteristic'
            );

            // Команда для остановки измерения (аналог C# ViPen_Command_Stop)
            const stopCommand = new Uint8Array([
                (ViPen_Command_Stop & 0xFF),
                ((ViPen_Command_Stop >> 8) & 0xFF)
            ]);

            // Ждем немного перед отправкой команды
            await new Promise(resolve => setTimeout(resolve, 100));

            await safeGattOperation(
                () => ctrlCharacteristic.writeValue(stopCommand),
                'writeStopCommand'
            );

            console.log('Команда остановки измерения отправлена');

        } catch (err) {
            console.error('Ошибка остановки измерения:', err);
            throw new Error(`Ошибка остановки измерения: ${err}`);
        }
    }, [safeGattOperation, isGattConnected]);

    // Улучшенная функция подключения к сервисам
    const connectToServices = useCallback(async (gattServer: BluetoothRemoteGATTServer) => {
        try {
            console.log('Получение сервиса ViPen...');

            // Даем устройству время на инициализацию
            await new Promise(resolve => setTimeout(resolve, 1000));

            const viPenService = await safeGattOperation(
                () => gattServer.getPrimaryService(VIPEN_SERVICE),
                'getPrimaryService',
                5
            );

            serviceRef.current = viPenService;
            console.log('Сервис ViPen получен');

            // Получаем характеристики с задержками между запросами
            console.log('Получение характеристик...');

            await new Promise(resolve => setTimeout(resolve, 200));
            const readingChar = await safeGattOperation(
                () => viPenService.getCharacteristic(VIPEN_CHAR_READING),
                'getReadingCharacteristic'
            );

            await new Promise(resolve => setTimeout(resolve, 200));
            const ctrlChar = await safeGattOperation(
                () => viPenService.getCharacteristic(VIPEN_CHAR_CTRL),
                'getControlCharacteristic'
            );

            await new Promise(resolve => setTimeout(resolve, 200));
            const waveCtrlChar = await safeGattOperation(
                () => viPenService.getCharacteristic(VIPEN_CHAR_WAV_CTRL),
                'getWaveControlCharacteristic'
            );

            await new Promise(resolve => setTimeout(resolve, 200));
            const waveReadChar = await safeGattOperation(
                () => viPenService.getCharacteristic(VIPEN_CHAR_WAV_READ),
                'getWaveReadCharacteristic'
            );

            readingCharRef.current = readingChar;
            ctrlCharRef.current = ctrlChar;
            waveCtrlCharRef.current = waveCtrlChar;
            waveReadCharRef.current = waveReadChar;

            console.log('Все характеристики получены');

            // Включаем уведомления для основной характеристики чтения
            await safeGattOperation(
                () => readingChar.startNotifications(),
                'startNotifications'
            );

            // Добавляем обработчик изменений
            readingChar.addEventListener('characteristicvaluechanged', handleCharacteristicChanged);

            console.log('Уведомления запущены');

            return true;
        } catch (err) {
            console.error('Ошибка подключения к сервисам:', err);
            throw err;
        }
    }, [safeGattOperation, handleCharacteristicChanged]);

    const connect = useCallback(async () => {
        try {
            setIsScanning(true);
            setError(null);
            setCurrentData(null);
            setWaveData(null);
            setUserData(null);

            if (!navigator.bluetooth) {
                throw new Error("Браузер не поддерживает Web Bluetooth API");
            }

            console.log('Запрос устройства ViPen...');

            // Запрашиваем устройство с несколькими вариантами фильтров
            const bluetoothDevice = await navigator.bluetooth.requestDevice({
                filters: [
                    { name: 'ViPen' },
                    { namePrefix: 'ViPen' },
                    { services: [VIPEN_SERVICE] }
                ],
                optionalServices: [VIPEN_SERVICE]
            });

            if (!bluetoothDevice) {
                throw new Error("Устройство не выбрано");
            }

            console.log('Устройство найдено:', bluetoothDevice.name);
            setDevice(bluetoothDevice);

            if (!bluetoothDevice.gatt) {
                throw new Error("Устройство не поддерживает GATT");
            }

            // Добавляем обработчик отключения
            bluetoothDevice.addEventListener('gattserverdisconnected', (event) => {
                console.log('Устройство отключено:', event);
                setIsConnected(false);
                setError('Устройство было отключено');

                // Пытаемся переподключиться через 2 секунды
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }

                reconnectTimeoutRef.current = setTimeout(() => {
                    if (bluetoothDevice.gatt) {
                        console.log('Попытка переподключения...');
                        connect();
                    }
                }, 2000);
            });

            console.log('Подключение к GATT серверу...');

            // Подключаемся к GATT серверу с таймаутом
            const connectWithTimeout = async () => {
                const connectPromise = bluetoothDevice.gatt!.connect();
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Таймаут подключения (10 сек)')), 10000);
                });

                return await Promise.race([connectPromise, timeoutPromise]);
            };

            const gattServer = await connectWithTimeout();
            serverRef.current = gattServer;
            setIsConnected(true);
            console.log('Подключено к GATT серверу');

            // Подключаемся к сервисам
            await connectToServices(gattServer);

            setError(null);
            console.log('ViPen полностью подключен и готов к работе');

        } catch (err) {
            console.error('Ошибка подключения:', err);
            setError(`Ошибка подключения: ${err}`);
            await disconnect();
        } finally {
            setIsScanning(false);
        }
    }, [connectToServices]);

    const disconnect = useCallback(async () => {
        // Очищаем таймер переподключения
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // Останавливаем уведомления и очищаем обработчики
        if (readingCharRef.current) {
            try {
                readingCharRef.current.removeEventListener('characteristicvaluechanged', handleCharacteristicChanged);
                await readingCharRef.current.stopNotifications();
            } catch (err) {
                console.warn('Ошибка при остановке уведомлений:', err);
            }
            readingCharRef.current = null;
        }

        // Пытаемся отправить команду остановки
        if (serviceRef.current && isGattConnected()) {
            try {
                const ctrlCharacteristic = ctrlCharRef.current || await serviceRef.current.getCharacteristic(VIPEN_CHAR_CTRL);
                const stopCommand = new Uint8Array([
                    (ViPen_Command_Stop & 0xFF),
                    ((ViPen_Command_Stop >> 8) & 0xFF)
                ]);
                await ctrlCharacteristic.writeValue(stopCommand);
                console.log('Команда остановки отправлена');
            } catch (stopErr) {
                console.warn('Не удалось отправить команду остановки:', stopErr);
            }
        }

        serviceRef.current = null;
        ctrlCharRef.current = null;
        waveCtrlCharRef.current = null;
        waveReadCharRef.current = null;

        // Отключаемся от устройства
        if (device?.gatt?.connected) {
            try {
                device.gatt.disconnect();
                console.log('Устройство отключено');
            } catch (err) {
                console.warn('Ошибка при отключении:', err);
            }
        }

        serverRef.current = null;

        // Сбрасываем состояние
        setIsConnected(false);
        setDevice(null);
        setCurrentData(null);
        setWaveData(null);
        setUserData(null);
    }, [device, isGattConnected, handleCharacteristicChanged]);

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (isConnected) {
                disconnect();
            }
        };
    }, [isConnected, disconnect]);

    return {
        isConnected,
        isScanning,
        isDownloading,
        currentData,
        waveData,
        userData,
        error,
        connect,
        disconnect,
        startMeasurement,
        stopMeasurement,
        downloadWaveform,
        readUserData
    };
};

// Генерация начальных данных дерева оборудования
const generateInitialTreeData = (): TreeNode[] => [
    {
        key: 'equip-1',
        title: 'PSN-40',
        type: 'equipment',
        children: [
            {
                key: 'comp-1',
                title: 'Электродвигатель',
                type: 'component',
                parentKey: 'equip-1',
                children: [
                    {
                        key: 'point-1',
                        title: 'Передний подшипник',
                        type: 'point',
                        parentKey: 'comp-1'
                    },
                    {
                        key: 'point-2',
                        title: 'Задний подшипник',
                        type: 'point',
                        parentKey: 'comp-1'
                    }
                ]
            },
            {
                key: 'comp-2',
                title: 'Насос',
                type: 'component',
                parentKey: 'equip-1',
                children: [
                    {
                        key: 'point-3',
                        title: 'Передний подшипник',
                        type: 'point',
                        parentKey: 'comp-2'
                    },
                    {
                        key: 'point-4',
                        title: 'Задний подшипник',
                        type: 'point',
                        parentKey: 'comp-2'
                    }
                ]
            }
        ]
    }
];

// Генерация тестовых данных показаний
const generateRandomReadings = (pointId: string, days: number = 30): Reading[] => {
    const readings: Reading[] = [];
    const baseTemp = 30 + Math.random() * 10;
    const baseVibration = 2 + Math.random() * 3;

    for (let i = 0; i < days; i++) {
        const date = moment().subtract(days - i, 'days').format('YYYY-MM-DD');
        const tempFluctuation = Math.sin(i * 0.3) * 5 + (Math.random() * 4 - 2);
        const vibrationFluctuation = Math.sin(i * 0.5) * 1.5 + (Math.random() * 0.5 - 0.25);

        readings.push({
            id: uuidv4(),
            pointId,
            date,
            temperature: +(baseTemp + tempFluctuation).toFixed(1),
            vibration: +(baseVibration + vibrationFluctuation).toFixed(2),
            comment: i % 5 === 0 ? 'Плановый замер' : undefined
        });
    }

    return readings;
};

// Компонент Input
const Input = ({
    value,
    onChange,
    placeholder,
    type = 'text',
    className = ''
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    className?: string;
}) => {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full ${className}`}
        />
    );
};

// Компонент InputNumber
const InputNumber = ({
    value,
    onChange,
    placeholder,
    min,
    max,
    step,
    className = ''
}: {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
}) => {
    return (
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full ${className}`}
        />
    );
};

// Компонент TextArea
const TextArea = ({
    value,
    onChange,
    placeholder,
    rows = 3,
    className = ''
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}) => {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full ${className}`}
        />
    );
};

// Компонент Table
const Table = ({
    columns,
    data,
    onEdit,
    onDelete,
    className = ''
}: {
    columns: {
        title: string;
        dataIndex: string;
        key: string;
        render?: (value: any, record: any) => React.ReactNode;
        sorter?: (a: any, b: any) => number;
    }[];
    data: any[];
    onEdit?: (record: any) => void;
    onDelete?: (record: any) => void;
    className?: string;
}) => {
    const [sortedData, setSortedData] = useState(data);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        setSortedData(data);
    }, [data]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const column = columns.find(col => col.key === key);
        if (column?.sorter) {
            const sorted = [...data].sort((a, b) => {
                if (direction === 'asc') {
                    return column.sorter!(a, b);
                } else {
                    return column.sorter!(b, a);
                }
            });
            setSortedData(sorted);
        }

        setSortConfig({ key, direction });
    };

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                onClick={() => column.sorter && requestSort(column.key)}
                            >
                                <div className="flex items-center">
                                    {column.title}
                                    {sortConfig?.key === column.key && (
                                        <span className="ml-1">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        {(onEdit || onDelete) && (
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Действия
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {sortedData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            {columns.map((column) => (
                                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                    {column.render ? column.render(item[column.dataIndex], item) : item[column.dataIndex]}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                                                title="Редактировать"
                                            >
                                                <FiEdit2 />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(item)}
                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                                title="Удалить"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Кастомный компонент для DatePicker
const CustomDatePickerInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
        <button
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 flex items-center justify-between w-full"
            onClick={onClick}
            ref={ref}
        >
            {value || "Выберите дату"}
            <FiCalendar className="ml-2 text-gray-500 dark:text-gray-400" />
        </button>
    )
);

// Компонент RangeDatePicker
const RangeDatePicker = ({ startDate, endDate, onChange }: {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void
}) => {
    return (
        <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={onChange}
            customInput={<CustomDatePickerInput />}
            dateFormat="dd.MM.yyyy"
            locale="ru"
            className="w-full"
            popperClassName="z-50"
            popperPlacement="bottom-start"
            withPortal
            shouldCloseOnSelect={false}
        />
    );
};

// Основной компонент мониторинга вибрации и температуры
const VibrationTemperatureMonitoring: React.FC = () => {
    const [treeData, setTreeData] = useState<TreeNode[]>(generateInitialTreeData());
    const [readings, setReadings] = useState<Reading[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        moment().subtract(7, 'days').toDate(),
        moment().toDate()
    ]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isReadingModalVisible, setIsReadingModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isViPenModalVisible, setIsViPenModalVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
        'equip-1': true,
        'comp-1': true,
        'comp-2': true
    });
    const [addFormValues, setAddFormValues] = useState({
        type: 'equipment',
        name: ''
    });
    const [readingFormValues, setReadingFormValues] = useState<Omit<Reading, 'date'> & { date: Date }>({
        id: '',
        pointId: '',
        date: moment().toDate(),
        vibration: 0,
        temperature: 0,
        comment: ''
    });
    const [dateError, setDateError] = useState(false);

    // Bluetooth Hook с новыми функциями
    const {
        isConnected,
        isScanning,
        isDownloading,
        currentData,
        waveData,
        userData,
        error: bluetoothError,
        connect,
        disconnect,
        startMeasurement,
        stopMeasurement,
        downloadWaveform,
        readUserData
    } = useViPenBluetooth();

    // Обработчики для кнопок ViPen
    const handleStartMeasurement = useCallback(async () => {
        try {
            await startMeasurement();
            console.log('Измерение запущено');
        } catch (err) {
            console.error('Ошибка запуска измерения:', err);
            alert(`Ошибка запуска измерения: ${err}`);
        }
    }, [startMeasurement]);

    const handleStopMeasurement = useCallback(async () => {
        try {
            await stopMeasurement();
            console.log('Измерение остановлено');
        } catch (err) {
            console.error('Ошибка остановки измерения:', err);
            alert(`Ошибка остановки измерения: ${err}`);
        }
    }, [stopMeasurement]);

    const handleDownloadWaveform = useCallback(async () => {
        try {
            const data = await downloadWaveform();
            console.log('Волновые данные загружены:', data);
            alert(`Волновые данные загружены! Блоков: ${data.blocks.length}`);
        } catch (err) {
            console.error('Ошибка загрузки волновых данных:', err);
            alert(`Ошибка загрузки волновых данных: ${err}`);
        }
    }, [downloadWaveform]);

    const handleReadUserData = useCallback(async () => {
        try {
            const data = await readUserData();
            console.log('Пользовательские данные:', data);
            alert(`Пользовательские данные: ID=${data.id}, Температура=${data.values[3] * 0.01}°C`);
        } catch (err) {
            console.error('Ошибка чтения пользовательских данных:', err);
            alert(`Ошибка чтения пользовательских данных: ${err}`);
        }
    }, [readUserData]);

    const handleAddViPenReading = () => {
        if (!currentData || !selectedPoint) {
            alert('Нет данных с ViPen или не выбрана точка измерения');
            return;
        }

        setReadingFormValues({
            id: '',
            pointId: selectedPoint,
            date: moment().toDate(),
            vibration: currentData.velocity,
            temperature: currentData.temperature,
            comment: `ViPen: скорость ${currentData.velocity} мм/с, ускорение ${currentData.acceleration} m/s², куртозис ${currentData.kurtosis}`
        });

        setIsViPenModalVisible(false);
        setIsReadingModalVisible(true);
    };

    const toggleNode = (key: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getAllPoints = (nodes: TreeNode[]): TreeNode[] => {
        let points: TreeNode[] = [];

        nodes.forEach(node => {
            if (node.type === 'point') {
                points.push(node);
            }

            if (node.children) {
                points = [...points, ...getAllPoints(node.children)];
            }
        });

        return points;
    };

    useEffect(() => {
        const points = getAllPoints(treeData);
        const testReadings = points.flatMap(point =>
            generateRandomReadings(point.key, 30)
        );
        setReadings(testReadings);
    }, [treeData]);

    const handleNodeClick = (node: TreeNode) => {
        setSelectedNode(node);

        if (node.type === 'point') {
            setSelectedPoint(node.key);
        } else {
            setSelectedPoint(null);
        }
    };

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setDateError(false);

        if (start && end) {
            if (start > end) {
                setDateError(true);
                return;
            }
            setDateRange([start, end]);
        } else if (start) {
            setDateRange([start, null]);
        } else {
            setDateRange([null, null]);
        }
    };

    const renderTree = (nodes: TreeNode[]) => (
        <ul className="ml-4">
            {nodes.map((node) => (
                <li key={node.key} className="my-1">
                    <div
                        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${selectedNode?.key === node.key ? 'bg-blue-100 dark:bg-blue-900' : ''
                            }`}
                        onClick={() => {
                            if (node.children) {
                                toggleNode(node.key);
                            }
                            handleNodeClick(node);
                        }}
                    >
                        <span className="mr-2">
                            {node.children ? (
                                expandedNodes[node.key] ? (
                                    <FiChevronDown className="text-blue-500 dark:text-blue-400" />
                                ) : (
                                    <FiChevronRight className="text-blue-500 dark:text-blue-400" />
                                )
                            ) : (
                                <FiFile className="text-gray-500 dark:text-gray-400" />
                            )}
                        </span>
                        <span className="dark:text-gray-100">{node.title}</span>
                        <div className="ml-auto">
                            {node.type === 'equipment' && (
                                <button
                                    className="text-blue-500 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(node);
                                        setAddFormValues({ type: 'component', name: '' });
                                        setIsAddModalVisible(true);
                                    }}
                                >
                                    <FiPlus className="inline mr-1" />
                                    Компонент
                                </button>
                            )}
                            {node.type === 'component' && (
                                <button
                                    className="text-blue-500 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(node);
                                        setAddFormValues({ type: 'point', name: '' });
                                        setIsAddModalVisible(true);
                                    }}
                                >
                                    <FiPlus className="inline mr-1" />
                                    Точка
                                </button>
                            )}
                        </div>
                    </div>
                    {node.children && expandedNodes[node.key] && renderTree(node.children)}
                </li>
            ))}
        </ul>
    );

    const handleAddNode = () => {
        if (!addFormValues.name.trim()) {
            alert('Пожалуйста, введите название');
            return;
        }

        const newNode: TreeNode = {
            key: uuidv4(),
            title: addFormValues.name,
            type: addFormValues.type as 'equipment' | 'component' | 'point',
            parentKey: selectedNode?.key || undefined
        };

        const addNode = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map(node => {
                if (node.key === selectedNode?.key) {
                    return {
                        ...node,
                        children: [...(node.children || []), newNode]
                    };
                }

                if (node.children) {
                    return {
                        ...node,
                        children: addNode(node.children)
                    };
                }

                return node;
            });
        };

        const newTreeData = selectedNode ? addNode(treeData) : [...treeData, newNode];
        setTreeData(newTreeData);

        if (addFormValues.type === 'point') {
            const newReadings = generateRandomReadings(newNode.key, 30);
            setReadings([...readings, ...newReadings]);
        }

        setIsAddModalVisible(false);
        setAddFormValues({ type: 'equipment', name: '' });
    };

    const handleAddReading = () => {
        if (!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const newReading: Reading = {
            id: uuidv4(),
            pointId: selectedPoint!,
            date: moment(readingFormValues.date).format('YYYY-MM-DD'),
            vibration: readingFormValues.vibration,
            temperature: readingFormValues.temperature,
            comment: readingFormValues.comment
        };

        setReadings([...readings, newReading]);
        setIsReadingModalVisible(false);
        setReadingFormValues({
            id: '',
            pointId: '',
            date: moment().toDate(),
            vibration: 0,
            temperature: 0,
            comment: ''
        });
    };

    const handleEditReading = (reading: Reading) => {
        setReadingFormValues({
            id: reading.id,
            pointId: reading.pointId,
            date: moment(reading.date).toDate(),
            vibration: reading.vibration,
            temperature: reading.temperature,
            comment: reading.comment || ''
        });
        setIsEditModalVisible(true);
    };

    const handleUpdateReading = () => {
        if (!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setReadings(readings.map(r =>
            r.id === readingFormValues.id ? {
                ...r,
                date: moment(readingFormValues.date).format('YYYY-MM-DD'),
                vibration: readingFormValues.vibration,
                temperature: readingFormValues.temperature,
                comment: readingFormValues.comment
            } : r
        ));

        setIsEditModalVisible(false);
        setReadingFormValues({
            id: '',
            pointId: '',
            date: moment().toDate(),
            vibration: 0,
            temperature: 0,
            comment: ''
        });
    };

    const handleDeleteReading = (reading: Reading) => {
        if (window.confirm('Вы уверены, что хотите удалить это показание?')) {
            setReadings(readings.filter(r => r.id !== reading.id));
        }
    };

    const filteredReadings = readings
        .filter(reading => {
            if (selectedPoint && reading.pointId !== selectedPoint) return false;
            if (dateRange[0] && dateRange[1]) {
                const date = moment(reading.date);
                return date.isBetween(moment(dateRange[0]), moment(dateRange[1]), null, "[]");
            }
            return true;
        })
        .sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

    const prepareChartData = () => {
        const sortedReadings = [...filteredReadings].sort((a, b) =>
            moment(a.date).valueOf() - moment(b.date).valueOf()
        );

        const labels = sortedReadings.map(reading =>
            moment(reading.date).format("DD.MM.YYYY")
        );

        const vibrationData = sortedReadings.map(reading => reading.vibration);
        const temperatureData = sortedReadings.map(reading => reading.temperature);

        return {
            labels,
            datasets: [
                {
                    label: "Вибрация, мм/с",
                    data: vibrationData,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    yAxisID: "y",
                },
                {
                    label: "Температура, °C",
                    data: temperatureData,
                    borderColor: "rgb(53, 162, 235)",
                    backgroundColor: "rgba(53, 162, 235, 0.5)",
                    yAxisID: "y1",
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: "index",
            intersect: false,
        },
        scales: {
            y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
                title: {
                    display: true,
                    text: "Вибрация, мм/с",
                    color: '#9CA3AF',
                },
                grid: {
                    color: '#4B5563',
                },
                ticks: {
                    color: '#9CA3AF',
                }
            },
            y1: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: "Температура, °C",
                    color: '#9CA3AF',
                },
                ticks: {
                    color: '#9CA3AF',
                }
            },
            x: {
                grid: {
                    color: '#4B5563',
                },
                ticks: {
                    color: '#9CA3AF',
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#9CA3AF',
                }
            }
        }
    };

    const readingsColumns = [
        {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => <span className="dark:text-gray-200">{moment(date).format('DD.MM.YYYY')}</span>,
            sorter: (a: Reading, b: Reading) => moment(a.date).valueOf() - moment(b.date).valueOf(),
        },
        {
            title: 'Вибрация, мм/с',
            dataIndex: 'vibration',
            key: 'vibration',
            render: (value: number) => <span className="dark:text-gray-200">{value}</span>,
            sorter: (a: Reading, b: Reading) => a.vibration - b.vibration,
        },
        {
            title: 'Температура, °C',
            dataIndex: 'temperature',
            key: 'temperature',
            render: (value: number) => <span className="dark:text-gray-200">{value}</span>,
            sorter: (a: Reading, b: Reading) => a.temperature - b.temperature,
        },
        {
            title: 'Комментарий',
            dataIndex: 'comment',
            key: 'comment',
            render: (comment: string | undefined, record: Reading) => (
                <span className="dark:text-gray-200">{comment || '-'}</span>
            ),
        },
    ];

    return (
        <div className="flex gap-5 p-5 bg-gray-50 dark:bg-gray-800 min-h-screen transition-colors duration-300">
            {/* Панель оборудования */}
            <div className="w-[400px] bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Оборудование</h3>
                </div>
                <div className="p-4">
                    {renderTree(treeData)}
                    <button
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 py-2 px-4 rounded transition-colors"
                        onClick={() => {
                            setSelectedNode(null);
                            setAddFormValues({ type: 'equipment', name: '' });
                            setIsAddModalVisible(true);
                        }}
                    >
                        Добавить оборудование
                    </button>
                </div>
            </div>

            {/* Основное содержимое */}
            <div className="flex-1 flex flex-col gap-5">
                {/* Графики показаний */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Графики показаний</h3>
                    </div>
                    <div className="p-4">
                        <div className="mb-4 flex items-center">
                            <div className="w-64">
                                <RangeDatePicker
                                    startDate={dateRange[0]}
                                    endDate={dateRange[1]}
                                    onChange={handleDateChange}
                                />
                                {dateError && (
                                    <p className="text-red-500 text-sm mt-1">Конечная дата должна быть после начальной</p>
                                )}
                            </div>
                            {selectedPoint && (
                                <div className="ml-4 flex gap-2">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 py-1 px-4 rounded transition-colors"
                                        onClick={() => {
                                            setReadingFormValues({
                                                id: '',
                                                pointId: selectedPoint,
                                                date: moment().toDate(),
                                                vibration: 0,
                                                temperature: 0,
                                                comment: ''
                                            });
                                            setIsReadingModalVisible(true);
                                        }}
                                    >
                                        Добавить показания
                                    </button>
                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 py-1 px-4 rounded transition-colors flex items-center"
                                        onClick={() => setIsViPenModalVisible(true)}
                                    >
                                        <FiBluetooth className="mr-2" />
                                        ViPen
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedPoint ? (
                            <div className="h-[400px]">
                                <Line data={prepareChartData()} options={chartOptions} />
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                Выберите контрольную точку для отображения графиков
                            </div>
                        )}
                    </div>
                </div>

                {/* История показаний */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">История показаний</h3>
                    </div>
                    <div className="p-4">
                        <Table
                            columns={readingsColumns}
                            data={filteredReadings}
                            onEdit={handleEditReading}
                            onDelete={handleDeleteReading}
                            className="[&_th]:px-4 [&_th]:py-2 [&_td]:px-4 [&_td]:py-2"
                        />
                    </div>
                </div>
            </div>

            {/* Модальное окно ViPen */}
            {isViPenModalVisible && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="rounded-lg shadow-xl w-full max-w-md flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="px-6 py-4 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold flex items-center">
                                <FiBluetooth className="mr-2" />
                                ViPen Bluetooth
                            </h2>
                            <button
                                onClick={() => {
                                    setIsViPenModalVisible(false);
                                    disconnect();
                                }}
                                className="p-1 rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Закрыть"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            {bluetoothError && (
                                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                                    {bluetoothError}
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-gray-700 dark:text-gray-300">Статус подключения:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                        {isConnected ? 'Подключено' : 'Не подключено'}
                                    </span>
                                </div>

                                {!isConnected ? (
                                    <button
                                        onClick={connect}
                                        disabled={isScanning}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isScanning ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Поиск устройства...
                                            </>
                                        ) : (
                                            <>
                                                <FiBluetooth className="mr-2" />
                                                Подключиться к ViPen
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            onClick={disconnect}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                                        >
                                            Отключиться
                                        </button>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={handleStartMeasurement}
                                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                                            >
                                                Старт
                                            </button>
                                            <button
                                                onClick={handleStopMeasurement}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors"
                                            >
                                                Стоп
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={handleDownloadWaveform}
                                                disabled={isDownloading}
                                                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center"
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Загрузка...
                                                    </>
                                                ) : (
                                                    'Волновые данные'
                                                )}
                                            </button>
                                            <button
                                                onClick={handleReadUserData}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors"
                                            >
                                                Пользовательские данные
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isConnected && !currentData && (
                                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded">
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700 mr-2"></div>
                                        Ожидание данных от устройства... Нажмите "Старт" для начала измерений.
                                    </div>
                                </div>
                            )}

                            {currentData && (
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Текущие данные ViPen:</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Скорость вибрации</div>
                                            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                {currentData.velocity} мм/с
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Ускорение</div>
                                            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                {currentData.acceleration} m/s²
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Куртозис</div>
                                            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                {currentData.kurtosis}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Температура</div>
                                            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                {currentData.temperature} °C
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                        Обновлено: {moment(currentData.timestamp).format('HH:mm:ss')}
                                    </div>
                                </div>
                            )}

                            {waveData && (
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Волновые данные:</h3>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <div>Блоков: {waveData.blocks.length}</div>
                                        <div>ID волны: {waveData.header.viPen_Get_Wave_ID}</div>
                                        <div>Команда: {waveData.header.viPen_Get_Data_Command}</div>
                                        <div>Блок: {waveData.header.viPen_Get_Data_Block}</div>
                                        <div>Коэффициент: {waveData.header.coeff.toFixed(4)}</div>
                                        <div>Таймштамп: {waveData.header.timestamp}</div>
                                        {waveData.blocks.length > 0 && (
                                            <div className="mt-2">
                                                <div>Первый блок:</div>
                                                <div>ID: {waveData.blocks[0].viPen_Get_Wave_ID}</div>
                                                <div>Номер: {waveData.blocks[0].viPen_Get_Data_Block}</div>
                                                <div>Данные: [{waveData.blocks[0].data.slice(0, 5).join(', ')}...]</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {userData && (
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Пользовательские данные:</h3>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <div>Адрес: {userData.addr}</div>
                                        <div>ID: {userData.id}</div>
                                        <div>Таймштамп: {userData.timestamp}</div>
                                        <div>Значения: [{userData.values.join(', ')}]</div>
                                    </div>
                                </div>
                            )}

                            {isConnected && currentData && (
                                <button
                                    onClick={handleAddViPenReading}
                                    disabled={!selectedPoint}
                                    className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded transition-colors flex items-center justify-center ${!selectedPoint ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <FiPlus className="mr-2" />
                                    Добавить показание в базу
                                </button>
                            )}

                            {!selectedPoint && (
                                <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded text-sm">
                                    Для добавления показания выберите контрольную точку в дереве оборудования
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно добавления узла */}
            {isAddModalVisible && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="rounded-lg shadow-xl w-full max-w-md flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="px-6 py-4 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                Добавить {addFormValues.type === 'equipment' ? 'оборудование' :
                                    addFormValues.type === 'component' ? 'компонент' : 'контрольную точку'}
                            </h2>
                            <button
                                onClick={() => setIsAddModalVisible(false)}
                                className="p-1 rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Закрыть"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Тип
                                    </label>
                                    <select
                                        value={addFormValues.type}
                                        onChange={(e) => setAddFormValues({ ...addFormValues, type: e.target.value })}
                                        className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 w-full"
                                    >
                                        <option value="equipment">Оборудование</option>
                                        <option value="component">Компонент</option>
                                        <option value="point">Контрольная точка</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Название
                                    </label>
                                    <Input
                                        value={addFormValues.name}
                                        onChange={(value) => setAddFormValues({ ...addFormValues, name: value })}
                                        placeholder="Введите название"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2">
                            <button
                                onClick={() => setIsAddModalVisible(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleAddNode}
                                disabled={!addFormValues.name.trim()}
                                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${!addFormValues.name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно добавления показаний */}
            {isReadingModalVisible && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="rounded-lg shadow-xl w-full max-w-md flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="px-6 py-4 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Добавить показания</h2>
                            <button
                                onClick={() => setIsReadingModalVisible(false)}
                                className="p-1 rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Закрыть"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Дата
                                    </label>
                                    <DatePicker
                                        selected={readingFormValues.date}
                                        onChange={(date) => setReadingFormValues({ ...readingFormValues, date: date || new Date() })}
                                        customInput={<CustomDatePickerInput />}
                                        dateFormat="dd.MM.yyyy"
                                        locale="ru"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Вибрация, мм/с
                                    </label>
                                    <InputNumber
                                        value={readingFormValues.vibration}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, vibration: value })}
                                        min={0}
                                        max={20}
                                        step={0.01}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Температура, °C
                                    </label>
                                    <InputNumber
                                        value={readingFormValues.temperature}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, temperature: value })}
                                        min={-50}
                                        max={150}
                                        step={0.1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Комментарий
                                    </label>
                                    <TextArea
                                        value={readingFormValues.comment}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, comment: value })}
                                        placeholder="Введите комментарий"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2">
                            <button
                                onClick={() => setIsReadingModalVisible(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleAddReading}
                                disabled={!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature}
                                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования показаний */}
            {isEditModalVisible && (
                <div className="fixed inset-0 bg-black/50 dark:bg-gray-900/70 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="rounded-lg shadow-xl w-full max-w-md flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300">
                        <div className="px-6 py-4 bg-blue-600 dark:bg-gray-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Редактировать показания</h2>
                            <button
                                onClick={() => setIsEditModalVisible(false)}
                                className="p-1 rounded-full hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Закрыть"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Дата
                                    </label>
                                    <DatePicker
                                        selected={readingFormValues.date}
                                        onChange={(date) => setReadingFormValues({ ...readingFormValues, date: date || new Date() })}
                                        customInput={<CustomDatePickerInput />}
                                        dateFormat="dd.MM.yyyy"
                                        locale="ru"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Вибрация, мм/с
                                    </label>
                                    <InputNumber
                                        value={readingFormValues.vibration}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, vibration: value })}
                                        min={0}
                                        max={20}
                                        step={0.01}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Температура, °C
                                    </label>
                                    <InputNumber
                                        value={readingFormValues.temperature}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, temperature: value })}
                                        min={-50}
                                        max={150}
                                        step={0.1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Комментарий
                                    </label>
                                    <TextArea
                                        value={readingFormValues.comment}
                                        onChange={(value) => setReadingFormValues({ ...readingFormValues, comment: value })}
                                        placeholder="Введите комментарий"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditModalVisible(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleUpdateReading}
                                disabled={!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature}
                                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${!readingFormValues.date || !readingFormValues.vibration || !readingFormValues.temperature ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VibrationTemperatureMonitoring;