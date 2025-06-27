import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useState, useMemo } from "react";

interface Employee {
    id: number;
    name: string;
    position: string;
    birthday: string;
    birthDay: number; // Добавляем числовое представление дня
    birthMonth: number;
    gender: 'male' | 'female';
}

const BirthdayPage = () => {
    const monthsGenitive = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];

    const monthsPrepositional = [
        "январе", "феврале", "марте", "апреле", "мае", "июне",
        "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"
    ];

    const monthsNominative = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const generateEmployees = () => {
        const allEmployees: Employee[] = [];
        const positions = [
            "Менеджер проектов", "Frontend разработчик", "Дизайнер",
            "Backend разработчик", "Аналитик", "Тестировщик",
            "Маркетолог", "HR специалист", "Бухгалтер", "Директор"
        ];
        const maleNames = ["Дмитрий", "Александр", "Михаил", "Артем", "Иван", "Сергей"];
        const femaleNames = ["Анна", "Елена", "Ольга", "Мария", "Наталья", "Ирина"];
        const surnames = ["Иванов", "Петров", "Сидоров", "Кузнецов", "Смирнов", "Васильев"];

        monthsGenitive.forEach((_, monthIndex) => {
            const count = Math.floor(Math.random() * 9) + 2;

            for (let i = 0; i < count; i++) {
                const gender = Math.random() > 0.5 ? 'male' : 'female';
                const firstName = gender === 'male'
                    ? maleNames[Math.floor(Math.random() * maleNames.length)]
                    : femaleNames[Math.floor(Math.random() * femaleNames.length)];
                const surname = surnames[Math.floor(Math.random() * surnames.length)];
                const middleName = gender === 'male'
                    ? ["Иванович", "Петрович", "Сергеевич", "Алексеевич"][Math.floor(Math.random() * 4)]
                    : ["Ивановна", "Петровна", "Сергеевна", "Алексеевна"][Math.floor(Math.random() * 4)];

                const birthDay = Math.floor(Math.random() * 28) + 1;

                allEmployees.push({
                    id: monthIndex * 100 + i,
                    name: `${surname}а ${firstName} ${middleName}`,
                    position: positions[Math.floor(Math.random() * positions.length)],
                    birthday: `${birthDay} ${monthsGenitive[monthIndex]}`,
                    birthDay,
                    birthMonth: monthIndex,
                    gender
                });
            }
        });

        return allEmployees;
    };

    const employees = useMemo(() => generateEmployees(), []);

    const filteredEmployees = useMemo(() =>
        employees
            .filter(emp => emp.birthMonth === selectedMonth)
            .sort((a, b) => a.birthDay - b.birthDay), // Сортировка по возрастанию дня
        [employees, selectedMonth]
    );

    const handlePrevMonth = () => setSelectedMonth(prev => (prev === 0 ? 11 : prev - 1));
    const handleNextMonth = () => setSelectedMonth(prev => (prev === 11 ? 0 : prev + 1));

    const getSystemAvatar = (gender: 'male' | 'female') => {
        return gender === 'male'
            ? "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            : "https://cdn-icons-png.flaticon.com/512/4140/4140047.png";
    };

    return (
        <>
            <PageMeta
                title="Домашняя - дни рождения"
                description="Домашняя - Дни рождения"
            />

            <PageBreadcrumb pageTitle="Дни рождения" />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Заголовок и навигация */}
                <div className="mb-12">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                            Дни рождения в {monthsPrepositional[selectedMonth]}
                        </h1>

                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 hidden sm:inline">
                                Именинников: <span className="font-bold text-indigo-600">{filteredEmployees.length}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 md:p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:bg-indigo-50"
                                    aria-label="Предыдущий месяц"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 md:p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all hover:bg-indigo-50"
                                    aria-label="Следующий месяц"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Список сотрудников */}
                {filteredEmployees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEmployees.map((employee) => (
                            <div
                                key={employee.id}
                                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                            >
                                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0">
                                    <img
                                        src={getSystemAvatar(employee.gender)}
                                        alt={employee.name}
                                        className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                                    />
                                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                                        <span className="text-xl text-pink-500">🎂</span>
                                    </div>
                                </div>

                                <div className="p-5 text-center flex-grow flex flex-col">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-1 line-clamp-2">{employee.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{employee.position}</p>

                                    <div className="mt-auto">
                                        <div className="bg-blue-50 rounded-lg px-4 py-2 inline-block">
                                            <p className="text-blue-700 font-medium text-base">
                                                <span className="mr-1">📅</span>
                                                {employee.birthday}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl shadow-inner">
                        <div className="text-5xl mb-4">🎈</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            В {monthsPrepositional[selectedMonth]} дней рождения нет
                        </h3>
                        <p className="text-gray-500">
                            Отличный повод устроить внеплановый праздник!
                        </p>
                    </div>
                )}

                {/* Пожелания */}
                <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')]"></div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative">
                        Тёплые пожелания {filteredEmployees.length > 0 ? filteredEmployees.length : ''} именинник{
                            filteredEmployees.length === 0 ? 'ам' :
                                filteredEmployees.length === 1 ? 'у' :
                                    'ам'
                        }
                    </h2>
                    <p className="text-white/90 text-base md:text-lg max-w-3xl mx-auto mb-6 relative">
                        Желаем крепкого здоровья, профессиональных успехов и исполнения самых заветных желаний!
                        Пусть каждый день будет наполнен радостью и вдохновением!
                    </p>
                    <div className="flex justify-center space-x-3 text-3xl relative">
                        {['🎁', '🎉', '✨'].map((emoji, i) => (
                            <span key={i} className="hover:scale-110 transition-transform">{emoji}</span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BirthdayPage;