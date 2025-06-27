import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import {
    BoxCubeIcon,
    CalenderIcon,
    ChatIcon,
    ChevronDownIcon,
    GridIcon,
    HorizontaLDots,
    ListIcon,
    PieChartIcon,
    TableIcon,
    TaskIcon,
    UserCircleIcon
} from "../icons";

// Тип пункта меню
type MenuItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    pro?: boolean;
    new?: boolean;
    children?: MenuItem[];
    key: string; // Уникальный идентификатор
};

// Генератор уникальных ключей для пунктов меню
const generateKey = (prefix: string, index: number, parentKey?: string) => {
    return parentKey ? `${parentKey}-${prefix}-${index}` : `${prefix}-${index}`;
};

// Данные для главного меню
const navItems: MenuItem[] = [
    {
        key: "home",
        icon: <GridIcon />,
        name: "Домашняя",
        children: [
            { key: "home-main", name: "Главная страница", path: "/" },
            { key: "home-downtime", name: "Простои по службам", path: "/DowntimeByServices" },
            { key: "home-shift", name: "Анализ работы смен", path: "/ShiftWorkAnalysis" },
            { key: "home-production", name: "План производства", path: "/ProductionPlan" },
            { key: "home-schedule", name: "График работы сменного персонала", path: "/WorkSchedule" },
            { key: "home-birthday", name: "Дни рождения сотрудников", path: "/Birthday" },
        ],
    },
    {
        key: "energy",
        icon: <CalenderIcon />,
        name: "Энергоучет",
        path: "/calendar",
        children: [
            {
                key: "water",
                name: "Вода",
                path: "/water",
                children: [
                    { key: "air", name: "Воздух", path: "/air" },
                    { key: "earth", name: "Земля", path: "/earth" }
                ]
            },
            { key: "boilers", name: "Котлы", path: "/boilers" },
            { key: "steam", name: "Пар", path: "/steam" },
            { key: "heating", name: "Отопление", path: "/heating" },
            { key: "treatment", name: "Очистные сооружения", path: "/treatment" },
            { key: "reports", name: "Отчеты", path: "/reports" },
        ],
    },
    {
        key: "askue",
        icon: <UserCircleIcon />,
        name: "АСКУЭ",
        children: [
            { key: "power", name: "Мощность", path: "/power" },
            { key: "energy", name: "Энергия", path: "/energy" },
        ],
    },
    {
        key: "journals",
        name: "Журналы",
        icon: <TaskIcon />,
        children: [
            { key: "tech", name: "Журнал технологов", path: "/tech-journal" },
            { key: "rpo", name: "Журнал РПО", path: "/rpo-journal" },
            { key: "lab", name: "Журнал лаборатория", path: "/lab-journal" },
        ],
    },
    {
        key: "reports",
        name: "Отчеты",
        icon: <ListIcon />,
        children: [
            { key: "downtime-year", name: "Простои по службам", path: "/DowntimeByServicesYear" },
            { key: "gp-production", name: "Выпуск ГП", path: "/ReportProduction" },
            { key: "products", name: "Выпуск продукции", path: "/ReportProd" },
            { key: "bdm", name: "Отчеты БДМ", path: "/ReportBDM" },
            { key: "boiler", name: "Отчеты котельная", path: "/boiler-reports" },
            { key: "os", name: "Отчеты ОС", path: "/os-reports" },
            { key: "electricity", name: "Отчеты по электроэнергии", path: "/electricity-reports" },
        ],
    },
    {
        key: "services",
        name: "Работы по службам",
        icon: <TableIcon />,
        children: [
            { key: "electro", name: "Электрослужба", path: "/electro-service" },
            { key: "mechanical", name: "Мехслужба", path: "/mechanical-service" },
            { key: "energy-service", name: "Энергослужба", path: "/energy-service" },
            { key: "os-service", name: "служба ОС", path: "/os-service" },
        ],
    },
];

// Данные для меню "Отчеты по выпускаемой продукции"
const othersItems: MenuItem[] = [
    {
        key: "production",
        icon: <PieChartIcon />,
        name: "Производство",
        children: [
            { key: "prod-plan", name: "План производства", path: "/prod-plan", pro: true },
            { key: "prod-output", name: "Выпущенная продукция", path: "/prod-output", pro: true },
            { key: "prod-costs", name: "Затраты энергоресурсов", path: "/prod-costs", pro: true },
        ],
    },
    {
        key: "prs",
        name: "ПРС",
        icon: <BoxCubeIcon />,
        children: [
            { key: "tamburs", name: "Тамбура", path: "/tamburs" },
            { key: "rolls", name: "Выпущенная продукция", path: "/rolls" },
        ],
    },
];

// Данные для меню поддержки
const supportItems: MenuItem[] = [
    {
        key: "chat",
        icon: <ChatIcon />,
        name: "Chat",
        path: "/chat",
    }
];

// Типы групп меню
type MenuType = "main" | "support" | "others";

const AppSidebar: React.FC = () => {
    // Получение состояния сайдбара из контекста
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();

    // Состояние для хранения открытых ключей меню
    const [openKeys, setOpenKeys] = useState<Record<MenuType, Set<string>>>({
        main: new Set(),
        support: new Set(),
        others: new Set(),
    });

    // Проверка активного пути
    const isActive = useCallback(
        (path?: string) => path && location.pathname === path,
        [location.pathname]
    );

    // Рекурсивная проверка активности родительского пункта
    const isParentActive = useCallback((item: MenuItem): boolean => {
        // Если текущий пункт активен
        if (item.path && isActive(item.path)) return true;

        // Если есть дети, проверяем активность любого из них
        if (item.children) {
            return item.children.some(child => isParentActive(child));
        }
        return false;
    }, [isActive]);

    // Переключение подменю
    const toggleSubmenu = (key: string, menuType: MenuType) => {
        setOpenKeys(prev => {
            // Создаем копию Set для текущего типа меню
            const newSet = new Set(prev[menuType]);

            if (newSet.has(key)) {
                // Закрытие меню и его дочерних элементов
                newSet.delete(key);
                const keysToRemove = Array.from(newSet).filter(k => k.startsWith(`${key}-`));
                keysToRemove.forEach(k => newSet.delete(k));
            } else {
                // Определение родительского ключа
                const parentKey = key.includes('-') ? key.substring(0, key.lastIndexOf('-')) : null;

                // Поиск ключей того же уровня
                const sameLevelKeys = Array.from(newSet).filter(k => {
                    const kParent = k.includes('-') ? k.substring(0, k.lastIndexOf('-')) : null;
                    return kParent === parentKey;
                });

                // Удаление ключей того же уровня
                sameLevelKeys.forEach(k => newSet.delete(k));

                // Добавление текущего ключа
                newSet.add(key);
            }

            // Обновляем состояние для текущего типа меню
            return { ...prev, [menuType]: newSet };
        });
    };

    // Автоматическое открытие меню при загрузке/изменении пути
    useEffect(() => {
        // Рекурсивный поиск активных ключей
        const findActiveKeys = (
            items: MenuItem[],
            menuType: MenuType,
            parentKey?: string
        ): string[] => {
            let activeKeys: string[] = [];

            for (const item of items) {
                // Формирование полного ключа
                const fullKey = parentKey ? `${parentKey}-${item.key}` : item.key;

                // Если путь активен, добавляем ключ и родительские ключи
                if (item.path && isActive(item.path)) {
                    activeKeys.push(fullKey);
                    if (parentKey) {
                        // Разделяем родительский ключ и добавляем все части
                        const parentParts = parentKey.split('-');
                        for (let i = 1; i <= parentParts.length; i++) {
                            activeKeys.push(parentParts.slice(0, i).join('-'));
                        }
                    }
                }

                // Рекурсивный поиск в дочерних элементах
                if (item.children) {
                    const childKeys = findActiveKeys(item.children, menuType, fullKey);
                    if (childKeys.length > 0) {
                        // Добавляем текущий ключ и ключи детей
                        activeKeys.push(fullKey, ...childKeys);
                    }
                }
            }

            // Удаление дубликатов
            return Array.from(new Set(activeKeys));
        };

        // Инициализация открытых ключей для каждой группы
        const newOpenKeys = { ...openKeys };
        newOpenKeys.main = new Set(findActiveKeys(navItems, "main"));
        newOpenKeys.support = new Set(findActiveKeys(supportItems, "support"));
        newOpenKeys.others = new Set(findActiveKeys(othersItems, "others"));

        setOpenKeys(newOpenKeys);
    }, [location.pathname]);

    // Рекурсивный рендеринг пунктов меню
    const renderMenuItems = (
        items: MenuItem[],
        menuType: MenuType,
        parentKey?: string,
        level = 0
    ) => {
        return (
            <ul className="flex flex-col gap-4">
                {items.map((item) => {
                    // Формирование уникального ключа с учетом родителя
                    const fullKey = parentKey ? `${parentKey}-${item.key}` : item.key;
                    const hasChildren = !!item.children?.length;
                    const isOpen = openKeys[menuType].has(fullKey);
                    const isActiveItem = isParentActive(item);

                    return (
                        <li key={fullKey}>
                            {/* Рендер пункта меню */}
                            {hasChildren ? (
                                // Кнопка для пунктов с подменю
                                <button
                                    onClick={() => toggleSubmenu(fullKey, menuType)}
                                    className={`menu-item group ${isActiveItem
                                            ? "menu-item-active bg-gray-100 text-brand-500"
                                            : "menu-item-inactive hover:bg-gray-50"
                                        } cursor-pointer w-full flex items-center py-3 px-4 rounded-lg transition-colors ${!isExpanded && !isHovered
                                            ? "lg:justify-center"
                                            : "lg:justify-start"
                                        }`}
                                    style={{ paddingLeft: `${level * 16}px` }}
                                >
                                    {/* Иконка */}
                                    <span
                                        className={`menu-item-icon-size  ${isActiveItem
                                                ? "menu-item-icon-active text-brand-500"
                                                : "menu-item-icon-inactive text-gray-500"
                                            }`}
                                    >
                                        {item.icon}
                                    </span>

                                    {/* Название (если сайдбар развернут) */}
                                    {(isExpanded || isHovered || isMobileOpen) && (
                                        <span className="ml-3 text-sm font-medium menu-item-text">
                                            {item.name}
                                        </span>
                                    )}

                                    {/* Стрелка для подменю (если есть дети) */}
                                    {(isExpanded || isHovered || isMobileOpen) && hasChildren && (
                                        <ChevronDownIcon
                                            className={`ml-auto w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : "text-gray-400"
                                                }`}
                                        />
                                    )}
                                </button>
                            ) : (
                                // Ссылка для конечных пунктов
                                item.path && (
                                    <Link
                                        to={item.path}
                                        className={`menu-item group w-full flex items-center py-3 px-4 rounded-lg transition-colors ${isActive(item.path)
                                                ? "menu-item-active bg-gray-100 text-brand-500"
                                                : "menu-item-inactive hover:bg-gray-50"
                                            }`}
                                        style={{ paddingLeft: `${level * 16}px` }}
                                    >
                                        {/* Иконка */}
                                        <span
                                                className={`menu-item-icon-size  ${isActive(item.path)
                                                    ? "menu-item-icon-active text-brand-500"
                                                    : "menu-item-icon-inactive text-gray-500"
                                                }`}
                                        >
                                            {item.icon}
                                        </span>

                                        {/* Название (если сайдбар развернут) */}
                                        {(isExpanded || isHovered || isMobileOpen) && (
                                            <span className="ml-3 text-sm font-medium menu-item-text">
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                )
                            )}

                            {/* Рендер дочерних элементов */}
                            {hasChildren && (isExpanded || isHovered || isMobileOpen) && (
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[1000px]" : "max-h-0"
                                        }`}
                                >
                                    {renderMenuItems(
                                        item.children!,
                                        menuType,
                                        fullKey,
                                        level + 1 // Увеличение уровня вложенности
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
                    ? "w-[290px]"
                    : isHovered
                        ? "w-[290px]"
                        : "w-[90px]"
                }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Логотип */}
            <div
                className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
            >
                <Link to="/">
                    {isExpanded || isHovered || isMobileOpen ? (
                        // Полноразмерный логотип
                        <>
                            <img
                                className="dark:hidden"
                                src="/images/logo/logo.svg"
                                alt="Logo"
                                width={150}
                                height={40}
                            />
                            <img
                                className="hidden dark:block"
                                src="/images/logo/logo-dark.svg"
                                alt="Logo"
                                width={150}
                                height={40}
                            />
                        </>
                    ) : (
                        // Иконка логотипа (свернутое состояние)
                        <>
                            <img
                                className="hidden dark:block"
                                src="/images/logo/logo-icon-dark.svg"
                                alt="Logo"
                                width={40}
                                height={40}
                            />
                            <img
                                className="dark:hidden"
                                src="/images/logo/logo-icon.svg"
                                alt="Logo"
                                width={40}
                                height={40}
                            />
                        </>
                    )}
                </Link>
            </div>

            {/* Основная навигация */}
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        {/* Группа "Главное" */}
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Главное"
                                ) : (
                                    <HorizontaLDots className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(navItems, "main")}
                        </div>

                        {/* Группа "Поддержка" */}
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Поддержка"
                                ) : (
                                    <HorizontaLDots className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(supportItems, "support")}
                        </div>

                        {/* Группа "Отчеты по выпускаемой продукции" */}
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Отчеты по выпускаемой продукции"
                                ) : (
                                    <HorizontaLDots className="size-6" />
                                )}
                            </h2>
                            {renderMenuItems(othersItems, "others")}
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;