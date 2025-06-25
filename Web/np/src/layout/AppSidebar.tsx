import { useCallback, useEffect, useRef, useState } from "react";
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
import { useLocation } from "react-router";
import { Link } from "react-router";

// Унифицированный тип для пунктов меню
type MenuItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    pro?: boolean;
    new?: boolean;
    children?: MenuItem[];
};

// Данные меню
const navItems: MenuItem[] = [
    {
        icon: <GridIcon />,
        name: "Домашняя",
        children: [
            { name: "Главная страница", path: "/" },
            { name: "Простои по службам", path: "/DowntimeByServices" },
            { name: "Анализ работы смен", path: "/ShiftWorkAnalysis" },
            { name: "План производства", path: "/ProductionPlan" },
            { name: "График работы сменного персонала", path: "/WorkSchedule" },
            { name: "Дни рождения сотрудников", path: "/stocks" },
        ],
    },
    {
        icon: <CalenderIcon />,
        name: "Энергоучет",
        path: "/calendar",
        children: [
            {
                name: "Вода",
                path: "/water",
                children: [
                    { name: "Воздух", path: "/wat" },
                    { name: "Земля", path: "/y" }
                ]
            },
            { name: "Котлы", path: "/analytics" },
            { name: "Пар", path: "/marketing" },
            { name: "Отопление", path: "/crm" },
            { name: "Очистные сооружения", path: "/stocks" },
            { name: "Отчеты", path: "/stocks" },
        ],
    },
    {
        icon: <UserCircleIcon />,
        name: "АСКУЭ",
        children: [
            { name: "Мощность", path: "/wat" },
            { name: "Энергия", path: "/analytics" },
        ],
    },
    {
        name: "Журналы",
        icon: <TaskIcon />,
        children: [
            { name: "Журнал технологов", path: "/task-list" },
            { name: "Журнал РПО", path: "/task-kanban" },
            { name: "Журнал лаборатория", path: "/task-kanban" },
        ],
    },
    {
        name: "Отчеты",
        icon: <ListIcon />,
        children: [
            { name: "Простои по службам", path: "/DowntimeByServicesYear" },
            { name: "Выпуск ГП", path: "/ReportProduction" },
            { name: "Выпуск продукции", path: "/ReportProd" },
            { name: "Отчеты БДМ", path: "/ReportBDM" },
            { name: "Отчеты котельная", path: "/form-layout" },
            { name: "Отчеты ОС", path: "/form-layout" },
            { name: "Отчеты по электроэнергии", path: "/form-layout" },
        ],
    },
    {
        name: "Работы по службам",
        icon: <TableIcon />,
        children: [
            { name: "Электрослужба", path: "/basic-tables" },
            { name: "Мехслужба", path: "/data-tables" },
            { name: "Энергослужба", path: "/data-tables" },
            { name: "служба ОС", path: "/data-tables" },
        ],
    },
];

const othersItems: MenuItem[] = [
    {
        icon: <PieChartIcon />,
        name: "Производство",
        children: [
            { name: "План производства", path: "/line-chart", pro: true },
            { name: "Выпущенная продукция", path: "/bar-chart", pro: true },
            { name: "Затраты энергоресурсов", path: "/pie-chart", pro: true },
        ],
    },
    {
        name: "ПРС",
        icon: <BoxCubeIcon />,
        children: [
            { name: "Тамбура", path: "/AllTamburs" },
            { name: "Выпущенная продукция", path: "/AllRolls" },
        ],
    },
];

const supportItems: MenuItem[] = [
    {
        icon: <ChatIcon />,
        name: "Chat",
        path: "/chat",
    }
];

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();

    // Состояние для отслеживания открытых путей
    const [openPaths, setOpenPaths] = useState<{
        main: string[];
        support: string[];
        others: string[];
    }>({
        main: [],
        support: [],
        others: [],
    });

    // Проверка активности пункта меню
    const isActive = useCallback(
        (path?: string) => path && location.pathname === path,
        [location.pathname]
    );

    // Проверка активности родительского пункта
    const isParentActive = useCallback(
        (item: MenuItem): boolean => {
            if (item.path && isActive(item.path)) return true;
            if (item.children) {
                return item.children.some(child => isParentActive(child));
            }
            return false;
        },
        [isActive]
    );

    // Переключение подменю
    const toggleSubmenu = (
        path: string,
        menuType: "main" | "support" | "others"
    ) => {
        setOpenPaths(prev => {
            const currentPaths = [...prev[menuType]];
            const pathIndex = currentPaths.indexOf(path);

            if (pathIndex > -1) {
                // Удаляем путь и все его дочерние пути
                currentPaths.splice(pathIndex);
            } else {
                // Добавляем новый путь, удаляя предыдущие на том же уровне
                const parentPath = path.split('/').slice(0, -1).join('/');
                const parentIndex = currentPaths.findIndex(p => p === parentPath);

                if (parentIndex > -1) {
                    currentPaths.splice(parentIndex + 1);
                }
                currentPaths.push(path);
            }

            return { ...prev, [menuType]: currentPaths };
        });
    };

    // Рекурсивный рендеринг пунктов меню
    const renderMenuItems = (
        items: MenuItem[],
        menuType: "main" | "support" | "others",
        parentPath = "",
        level = 0
    ) => {
        return (
            <ul className="flex flex-col gap-4">
                {items.map((item, index) => {
                    const pathKey = parentPath ? `${parentPath}/${index}` : `${index}`;
                    const hasChildren = !!item.children?.length;
                    const isOpen = openPaths[menuType].includes(pathKey);
                    const isActive = isParentActive(item);

                    return (
                        <li key={`${menuType}-${pathKey}`}>
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleSubmenu(pathKey, menuType)}
                                    className={`menu-item group ${isActive
                                            ? "menu-item-active"
                                            : "menu-item-inactive"
                                        } cursor-pointer ${!isExpanded && !isHovered
                                            ? "lg:justify-center"
                                            : "lg:justify-start"
                                        }`}
                                    style={{ paddingLeft: `${level * 16}px` }}
                                >
                                    <span
                                        className={`menu-item-icon-size ${isActive
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
                                        className={`menu-item group ${isActive
                                                ? "menu-item-active"
                                                : "menu-item-inactive"
                                            }`}
                                        style={{ paddingLeft: `${level * 16}px` }}
                                    >
                                        <span
                                            className={`menu-item-icon-size ${isActive
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
                                        pathKey,
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