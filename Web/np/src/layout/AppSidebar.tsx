import { useCallback, useEffect, useState } from "react";
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
import { Link, useLocation } from "react-router";

type MenuItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    pro?: boolean;
    new?: boolean;
    children?: MenuItem[];
    key: string; // Добавляем уникальный ключ
};

// Генератор ключей для пунктов меню
const generateKey = (prefix: string, index: number, parentKey?: string) => {
    return parentKey ? `${parentKey}-${prefix}-${index}` : `${prefix}-${index}`;
};

// Данные меню с уникальными ключами
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
            { key: "home-birthdays", name: "Дни рождения сотрудников", path: "/stocks" },
        ],
    },
    {
        key: "EnergyAccounting",
        icon: <CalenderIcon />,
        name: "Энергоучет",
        path: "/calendar",
        children: [
            {
                key: "EnergyAccounting-water",
                name: "Вода", path: "/water",
                children: [
                    { key: "EnergyAccounting-water-wat", name: "Воздух", path: "/wat" },
                    { key: "EnergyAccounting-water-y", name: "Земля", path: "/y" }
                ]
            },
            { key: "EnergyAccounting-water-analytics", name: "Котлы", path: "/analytics" },
            { key: "EnergyAccounting-water-marketing", name: "Пар", path: "/marketing" },
            { key: "EnergyAccounting-water-crm", name: "Отопление", path: "/crm" },
            { key: "EnergyAccounting-water-stocks", name: "Очистные сооружения", path: "/stocks" },
            { key: "EnergyAccounting-water-stocks1", name: "Отчеты", path: "/stocks" },
        ],
    },
    {
        key: "askue",
        icon: <UserCircleIcon />,
        name: "АСКУЭ",
        children: [
            { key: "askue-wat", name: "Мощность", path: "/wat" },
            { key: "askue-analytics", name: "Энергия", path: "/analytics" },
        ],
    },
    {
        key: "journal",
        name: "Журналы",
        icon: <TaskIcon />,
        children: [
            { key: "journal-task-list", name: "Журнал технологов", path: "/task-list" },
            { key: "journal-task-kanban", name: "Журнал РПО", path: "/task-kanban" },
            { key: "journal-task-kanban1", name: "Журнал лаборатория", path: "/task-kanban" },
        ],
    },
    {
        key: "reports",
        name: "Отчеты",
        icon: <ListIcon />,
        children: [
            { key: "reports-downtimeByServicesYear", name: "Простои по службам", path: "/DowntimeByServicesYear" },
            { key: "reports-reportProduction", name: "Выпуск ГП", path: "/ReportProduction" },
            { key: "reports-reportProd", name: "Выпуск продукции", path: "/ReportProd" },
            { key: "reports-reportBDM", name: "Отчеты БДМ", path: "/ReportBDM" },
            { key: "reports-form-layout", name: "Отчеты котельная", path: "/form-layout" },
            { key: "reports-form-layout1", name: "Отчеты ОС", path: "/form-layout" },
            { key: "reports-form-layout2", name: "Отчеты по электроэнергии", path: "/form-layout" },
        ],
    },
    {
        key: "servicesWork",
        name: "Работы по службам",
        icon: <TableIcon />,
        children: [
            { key: "servicesWork-basicTables", name: "Электрослужба", path: "/basic-tables" },
            { key: "servicesWork-dataTables", name: "Мехслужба", path: "/data-tables" },
            { key: "servicesWork-dataTables1", name: "Энергослужба", path: "/data-tables" },
            { key: "servicesWork-dataTables2", name: "служба ОС", path: "/data-tables" },
        ],
    },
    // Остальные пункты меню с уникальными ключами...
].map((item, index) => ({ ...item, key: item.key || generateKey("nav", index) }));

const othersItems: MenuItem[] = [
    {
        key: "production",
        icon: <PieChartIcon />,
        name: "Производство",
        children: [
            { key: "prod-plan", name: "План производства", path: "/line-chart", pro: true },
            { key: "prod-output", name: "Выпущенная продукция", path: "/bar-chart", pro: true },
            { key: "prod-costs", name: "Затраты энергоресурсов", path: "/pie-chart", pro: true },
        ],
    },
    {
        key: "prs",
        name: "ПРС",
        icon: <BoxCubeIcon />,
        children: [
            { key: "prs-tamburs", name: "Тамбура", path: "/AllTamburs" },
            { key: "prs-rolls", name: "Выпущенная продукция", path: "/AllRolls" },
        ],
    },
].map((item, index) => ({ ...item, key: item.key || generateKey("other", index) }));

const supportItems: MenuItem[] = [
    {
        key: "chat",
        icon: <ChatIcon />,
        name: "Chat",
        path: "/chat",
    }
].map((item, index) => ({ ...item, key: item.key || generateKey("support", index) }));

type MenuType = "main" | "support" | "others";

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();

    // Состояние для отслеживания открытых ключей меню
    const [openKeys, setOpenKeys] = useState<Record<MenuType, Set<string>>>({
        main: new Set(),
        support: new Set(),
        others: new Set(),
    });

    // Проверка активности пункта меню
    const isActive = useCallback(
        (path?: string) => path && location.pathname === path,
        [location.pathname]
    );

    // Рекурсивная проверка активности родителя
    const isParentActive = useCallback((item: MenuItem): boolean => {
        if (item.path && isActive(item.path)) return true;
        if (item.children) {
            return item.children.some(child => isParentActive(child));
        }
        return false;
    }, [isActive]);

    // Переключение подменю с автоматическим закрытием
    const toggleSubmenu = (key: string, menuType: MenuType) => {
        setOpenKeys(prev => {
            const newSet = new Set(prev[menuType]);

            if (newSet.has(key)) {
                // Закрываем текущее меню и все его дочерние
                newSet.delete(key);
                const keysToRemove = Array.from(newSet).filter(k => k.startsWith(`${key}-`));
                keysToRemove.forEach(k => newSet.delete(k));
            } else {
                // Закрываем все меню того же уровня
                const parentKey = key.includes('-') ? key.substring(0, key.lastIndexOf('-')) : null;
                const sameLevelKeys = Array.from(newSet).filter(k => {
                    const kParent = k.includes('-') ? k.substring(0, k.lastIndexOf('-')) : null;
                    return kParent === parentKey;
                });

                sameLevelKeys.forEach(k => newSet.delete(k));
                // Открываем новое меню
                newSet.add(key);
            }

            return { ...prev, [menuType]: newSet };
        });
    };

    // Инициализация открытых меню при загрузке
    useEffect(() => {
        const findActiveKeys = (items: MenuItem[], menuType: MenuType, parentKey?: string): string[] => {
            let activeKeys: string[] = [];

            for (const item of items) {
                const fullKey = parentKey ? `${parentKey}-${item.key}` : item.key;

                if (item.path && isActive(item.path)) {
                    activeKeys.push(fullKey);
                    // Добавляем всех родителей
                    if (parentKey) {
                        activeKeys = [...activeKeys, ...parentKey.split('-')];
                    }
                }

                if (item.children) {
                    const childKeys = findActiveKeys(item.children, menuType, fullKey);
                    if (childKeys.length > 0) {
                        activeKeys = [...activeKeys, fullKey, ...childKeys];
                    }
                }
            }
            return activeKeys;
        };

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
                    const fullKey = parentKey ? `${parentKey}-${item.key}` : item.key;
                    const hasChildren = !!item.children?.length;
                    const isOpen = openKeys[menuType].has(fullKey);
                    const isActiveItem = isParentActive(item);

                    return (
                        <li key={fullKey}>
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleSubmenu(fullKey, menuType)}
                                    className={`menu-item group ${isActiveItem
                                            ? "menu-item-active"
                                            : "menu-item-inactive"
                                        } cursor-pointer ${!isExpanded && !isHovered
                                            ? "lg:justify-center"
                                            : "lg:justify-start"
                                        }`}
                                    style={{ paddingLeft: `${level * 16}px` }}
                                >
                                    <span
                                        className={`menu-item-icon-size ${isActiveItem
                                                ? "menu-item-icon-active"
                                                : "menu-item-icon-inactive"
                                            }`}
                                    >
                                        {item.icon}
                                    </span>
                                    {(isExpanded || isHovered || isMobileOpen) && (
                                        <span className="menu-item-text">{item.name}</span>
                                    )}
                                    {(isExpanded || isHovered || isMobileOpen) && hasChildren && (
                                        <ChevronDownIcon
                                            className={`ml-auto w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""
                                                }`}
                                        />
                                    )}
                                </button>
                            ) : (
                                item.path && (
                                    <Link
                                        to={item.path}
                                        className={`menu-item group ${isActive(item.path)
                                                ? "menu-item-active"
                                                : "menu-item-inactive"
                                            }`}
                                        style={{ paddingLeft: `${level * 16}px` }}
                                    >
                                        <span
                                            className={`menu-item-icon-size ${isActive(item.path)
                                                    ? "menu-item-icon-active"
                                                    : "menu-item-icon-inactive"
                                                }`}
                                        >
                                            {item.icon}
                                        </span>
                                        {(isExpanded || isHovered || isMobileOpen) && (
                                            <span className="menu-item-text">{item.name}</span>
                                        )}
                                    </Link>
                                )
                            )}

                            {hasChildren && (isExpanded || isHovered || isMobileOpen) && (
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${isOpen ? "block" : "hidden"
                                        }`}
                                >
                                    {renderMenuItems(
                                        item.children!,
                                        menuType,
                                        fullKey,
                                        level + 1
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
            {/* Логотип и остальной код без изменений */}
            <div
                className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
            >
                <Link to="/">
                    {isExpanded || isHovered || isMobileOpen ? (
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

            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
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

                        <div className="">
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Поддержка"
                                ) : (
                                    <HorizontaLDots />
                                )}
                            </h2>
                            {renderMenuItems(supportItems, "support")}
                        </div>

                        <div className="">
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "justify-start"
                                    }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Отчеты по выпускаемой продукции"
                                ) : (
                                    <HorizontaLDots />
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